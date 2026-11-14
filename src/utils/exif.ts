import type { PhotoExif } from "../types/photo";

/**
 * Formate la vitesse d'obturation en fraction photographique lisible (ex: 0.004 -> "1/250s").
 */
export function formatExposureTime(seconds: number | null | undefined): string | null {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }

  if (seconds >= 1) {
    const rounded = Number.isInteger(seconds) ? seconds : Number(seconds.toFixed(1));
    return `${rounded}s`;
  }

  const denominator = Math.round(1 / seconds);
  if (denominator >= 2) {
    const relativeError = Math.abs(1 / denominator - seconds) / seconds;
    if (relativeError < 0.06) {
      return `1/${denominator}s`;
    }
  }

  return `${Number(seconds.toFixed(1))}s`;
}

/**
 * Formate l'ouverture (ex: 1.8 -> "f/1.8", 8 -> "f/8").
 */
export function formatAperture(aperture: number | null | undefined): string | null {
  if (typeof aperture !== "number" || !Number.isFinite(aperture) || aperture <= 0) {
    return null;
  }
  const clean = Number.isInteger(aperture) ? aperture : Number(aperture.toFixed(1));
  return `f/${clean}`;
}

/**
 * Formate la distance focale (ex: 50 -> "50mm").
 */
export function formatFocalLength(focalLength: number | null | undefined): string | null {
  if (typeof focalLength !== "number" || !Number.isFinite(focalLength) || focalLength <= 0) {
    return null;
  }
  const clean = Math.round(focalLength);
  return `${clean}mm`;
}

/**
 * Construit le résumé court affiché au survol de la grille (ex: "50mm · f/1.8").
 */
export function formatHoverSpecs(exif: PhotoExif): string | null {
  const parts: string[] = [];
  const focal = formatFocalLength(exif.focalLength);
  const aperture = formatAperture(exif.aperture);

  if (focal) parts.push(focal);
  if (aperture) parts.push(aperture);

  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * Déduplique la marque et le modèle du boîtier (ex: "Canon" + "Canon EOS R5" -> "Canon EOS R5").
 */
export function formatCameraName(
  make: string | null | undefined,
  model: string | null | undefined
): string | null {
  const cleanMake = make?.trim() || "";
  const cleanModel = model?.trim() || "";

  if (!cleanMake && !cleanModel) return null;
  if (!cleanMake) return cleanModel;
  if (!cleanModel) return cleanMake;

  if (cleanModel.toLowerCase().startsWith(cleanMake.toLowerCase())) {
    return cleanModel;
  }

  return `${cleanMake} ${cleanModel}`;
}

/**
 * Formate la date EXIF Google Drive ("YYYY:MM:DD HH:mm:ss" ou ISO) en français lisible.
 */
export function formatExifDate(rawTime: string | null | undefined): string | null {
  if (!rawTime || typeof rawTime !== "string") return null;

  const trimmed = rawTime.trim();
  if (!trimmed) return null;

  // Format EXIF classique : "2025:10:14 18:22:09"
  const exifNormalized = trimmed.replace(
    /^(\d{4}):(\d{2}):(\d{2})(?:[ T](\d{2}:\d{2}:\d{2}))?/,
    (_, y: string, m: string, d: string, t?: string) => (t ? `${y}-${m}-${d}T${t}` : `${y}-${m}-${d}`)
  );

  const date = new Date(exifNormalized);
  if (Number.isNaN(date.getTime())) {
    return trimmed;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
