/**
 * Portfolio Photographique — Backend Google Apps Script (Drive API v3)
 *
 * Service avancé requis : Drive API (v3), identifiant "Drive".
 * Déploiement : Application Web -> Exécuter en tant que "Moi", Accès "Tout le monde".
 */

const ROOT_FOLDER_ID = "1deZZ37QyNmWDfQUUPJ7fu0K6Uw_rggpc";

const DEFAULT_ALBUM_NAME = "Sélection";
const CACHE_KEY_PREFIX = "portfolio_feed_v1";
const CACHE_TTL_SECONDS = 20 * 60; // 20 minutes (cohérent avec la durée de vie des liens thumbnailLink)
const CACHE_CHUNK_SIZE = 85000; // Marge sous la limite de 100 Ko par clé de CacheService

const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const FOLDER_MIME = "application/vnd.google-apps.folder";

/**
 * Point d'entrée HTTP GET de l'application Web Apps Script.
 * Prend en charge ?refresh=1 pour invalider le cache à la demande.
 */
function doGet(e) {
  try {
    if (!ROOT_FOLDER_ID || ROOT_FOLDER_ID === "COLLER_ICI_L_ID_DU_DOSSIER_DRIVE") {
      return jsonResponse({
        ok: false,
        error: "ROOT_FOLDER_ID n'est pas encore configuré dans Code.gs.",
      });
    }

    const params = (e && e.parameter) || {};
    const forceRefresh = params.refresh === "1" || params.refresh === "true";

    if (forceRefresh) {
      clearPortfolioCache();
    } else {
      const cached = readPortfolioCache();
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.cached = true;
        return jsonResponse(parsed);
      }
    }

    const payload = buildPortfolioPayload();
    writePortfolioCache(JSON.stringify(payload));

    return jsonResponse(payload);
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: err && err.message ? err.message : String(err),
    });
  }
}

/**
 * Construit le flux complet des albums et photographies depuis Google Drive.
 */
function buildPortfolioPayload() {
  const rootItems = listFolderChildren(ROOT_FOLDER_ID);

  const rootImages = [];
  const subfolders = [];

  for (let i = 0; i < rootItems.length; i++) {
    const item = rootItems[i];
    if (item.mimeType === FOLDER_MIME) {
      subfolders.push(item);
    } else if (ALLOWED_IMAGE_MIMES.indexOf(item.mimeType) !== -1) {
      rootImages.push(item);
    }
  }

  const photos = [];
  const albums = [];

  // 1. Images directement à la racine -> album "Sélection"
  if (rootImages.length > 0) {
    albums.push(DEFAULT_ALBUM_NAME);
    for (let i = 0; i < rootImages.length; i++) {
      photos.push(normalizePhoto(rootImages[i], DEFAULT_ALBUM_NAME));
    }
  }

  // 2. Sous-dossiers directs -> nom du sous-dossier comme nom d'album
  for (let f = 0; f < subfolders.length; f++) {
    const folder = subfolders[f];
    const folderImages = listFolderImages(folder.id);
    if (folderImages.length === 0) {
      continue;
    }

    const albumName = (folder.name || "Sans titre").trim();
    if (albums.indexOf(albumName) === -1) {
      albums.push(albumName);
    }

    for (let j = 0; j < folderImages.length; j++) {
      photos.push(normalizePhoto(folderImages[j], albumName));
    }
  }

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    cached: false,
    albums: albums,
    total: photos.length,
    photos: photos,
  };
}

/**
 * Liste tous les éléments directs non supprimés d'un dossier (avec pagination).
 */
function listFolderChildren(folderId) {
  const query = "'" + escapeDriveQuery(folderId) + "' in parents and trashed = false";
  return listFilesWithPagination(query);
}

/**
 * Liste uniquement les images compatibles d'un sous-dossier donné (avec pagination).
 */
function listFolderImages(folderId) {
  const mimeFilter = ALLOWED_IMAGE_MIMES
    .map(function (m) {
      return "mimeType = '" + m + "'";
    })
    .join(" or ");

  const query =
    "'" +
    escapeDriveQuery(folderId) +
    "' in parents and trashed = false and (" +
    mimeFilter +
    ")";

  return listFilesWithPagination(query);
}

/**
 * Appelle Drive API v3 Drive.Files.list en gérant automatiquement nextPageToken.
 */
function listFilesWithPagination(query) {
  const files = [];
  let pageToken = null;

  do {
    const options = {
      q: query,
      fields:
        "nextPageToken, files(id, description, mimeType, thumbnailLink, imageMediaMetadata(width, height, rotation, time, cameraMake, cameraModel, lens, focalLength, aperture, exposureTime, isoSpeed))",
      pageSize: 200,
      orderBy: "folder,name_natural",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    };

    if (pageToken) {
      options.pageToken = pageToken;
    }

    const response = Drive.Files.list(options);
    if (response && response.files && response.files.length > 0) {
      for (let i = 0; i < response.files.length; i++) {
        files.push(response.files[i]);
      }
    }

    pageToken = response ? response.nextPageToken : null;
  } while (pageToken);

  return files;
}

/**
 * Transforme un fichier Drive en objet photo propre pour le frontend.
 * Ne renvoie jamais le nom de fichier brut (ex: IMG_3434.jpeg).
 */
function normalizePhoto(file, albumName) {
  const meta = file.imageMediaMetadata || {};
  const parsedDesc = parseDescription(file.description);

  let width = typeof meta.width === "number" && meta.width > 0 ? meta.width : null;
  let height = typeof meta.height === "number" && meta.height > 0 ? meta.height : null;

  // Si l'EXIF indique une rotation de 90° ou 270°, le CDN Google sert l'image déjà pivotée :
  // on inverse width et height pour préserver le ratio d'aspect natif exact.
  if (width && height && (meta.rotation === 90 || meta.rotation === 270)) {
    const tmp = width;
    width = height;
    height = tmp;
  }

  return {
    id: file.id,
    album: albumName,
    title: parsedDesc.title,
    isHero: parsedDesc.isHero,
    thumbUrl: buildCdnUrl(file.thumbnailLink, file.id, 900),
    fullUrl: buildCdnUrl(file.thumbnailLink, file.id, 2400),
    width: width,
    height: height,
    exif: {
      time: meta.time || null,
      cameraMake: meta.cameraMake || null,
      cameraModel: meta.cameraModel || null,
      lens: meta.lens || null,
      focalLength: typeof meta.focalLength === "number" ? meta.focalLength : null,
      aperture: typeof meta.aperture === "number" ? meta.aperture : null,
      exposureTime: typeof meta.exposureTime === "number" ? meta.exposureTime : null,
      isoSpeed: typeof meta.isoSpeed === "number" ? meta.isoSpeed : null,
    },
  };
}

/**
 * Génère les URLs CDN Google haute vitesse à partir du thumbnailLink (=s220 -> =s900 / =s2400).
 */
function buildCdnUrl(thumbnailLink, fileId, size) {
  if (!thumbnailLink) {
    return "https://lh3.googleusercontent.com/d/" + fileId + "=s" + size;
  }
  if (/=s\d+/.test(thumbnailLink)) {
    return thumbnailLink.replace(/=s\d+/, "=s" + size);
  }
  return thumbnailLink + "=s" + size;
}

/**
 * Analyse le champ description Drive :
 * - Extrait la présence éventuelle du marqueur "hero" (ex: "hero", "#hero", "hero | Légende").
 * - Laisse title vide ("") si aucune légende éditoriale n'est renseignée.
 */
function parseDescription(rawDescription) {
  if (!rawDescription || typeof rawDescription !== "string") {
    return { title: "", isHero: false };
  }

  const trimmed = rawDescription.trim();
  if (!trimmed) {
    return { title: "", isHero: false };
  }

  const isStandaloneHero = /^#?hero$/i.test(trimmed);
  if (isStandaloneHero) {
    return { title: "", isHero: true };
  }

  const hasHeroTag = /(?:^|\s|\||\[)#?hero(?:\]|\s|\||:|-|$)/i.test(trimmed);
  const cleanedTitle = trimmed
    .replace(/\[#?hero\]/gi, "")
    .replace(/(?:^|\n)\s*#?hero\s*(?:[:|\-–—]\s*|\n|$)/gi, "\n")
    .replace(/\s+#hero\b/gi, "")
    .trim();

  return {
    title: cleanedTitle,
    isHero: hasHeroTag,
  };
}

/**
 * Lecture / Écriture / Suppression du cache (avec découpage sécurisé si > 85 Ko).
 */
function readPortfolioCache() {
  const cache = CacheService.getScriptCache();
  const countRaw = cache.get(CACHE_KEY_PREFIX + "_count");
  if (!countRaw) {
    return null;
  }

  const count = parseInt(countRaw, 10);
  if (!count || count < 1) {
    return null;
  }

  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push(CACHE_KEY_PREFIX + "_" + i);
  }

  const chunksMap = cache.getAll(keys);
  let combined = "";
  for (let i = 0; i < keys.length; i++) {
    const part = chunksMap[keys[i]];
    if (typeof part !== "string") {
      return null;
    }
    combined += part;
  }

  return combined;
}

function writePortfolioCache(serialized) {
  try {
    const cache = CacheService.getScriptCache();
    const totalChunks = Math.ceil(serialized.length / CACHE_CHUNK_SIZE);
    const entries = {};
    entries[CACHE_KEY_PREFIX + "_count"] = String(totalChunks);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CACHE_CHUNK_SIZE;
      entries[CACHE_KEY_PREFIX + "_" + i] = serialized.slice(start, start + CACHE_CHUNK_SIZE);
    }

    cache.putAll(entries, CACHE_TTL_SECONDS);
  } catch (err) {
    // Le cache est une optimisation : ne jamais bloquer la réponse en cas de dépassement de quota.
  }
}

function clearPortfolioCache() {
  const cache = CacheService.getScriptCache();
  const countRaw = cache.get(CACHE_KEY_PREFIX + "_count");
  const keysToRemove = [CACHE_KEY_PREFIX + "_count"];

  if (countRaw) {
    const count = parseInt(countRaw, 10);
    for (let i = 0; i < count; i++) {
      keysToRemove.push(CACHE_KEY_PREFIX + "_" + i);
    }
  }

  cache.removeAll(keysToRemove);
}

function escapeDriveQuery(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
