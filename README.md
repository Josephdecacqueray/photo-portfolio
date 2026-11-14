# Portfolio Photographique — Galerie d'Art connectée à Google Drive

Un portfolio photographique minimaliste, immersif et ultra-rapide conçu selon une esthétique **Chambre Noire / Galerie d'Art**, propulsé par **Vite + React + TypeScript + Tailwind CSS** et connecté dynamiquement à un dossier **Google Drive** via **Google Apps Script (Drive API v3)**.

---

## Aperçu des fonctionnalités

- **Double thème raffiné** : mode **Chambre Noire** (`#09090B`, accent doré champagne `#C8A97E`) par défaut et bascule instantanée vers **Galerie Claire** (`#FAF9F6`).
- **Hero immersif** : mise en avant de la photo marquée `"hero"` (ou de la première photo du flux) avec parallaxe douce, fondu progressif et appel vers la galerie.
- **Grille Maçonnerie adaptative sans rognage** : respecte strictement les ratios natifs portrait/paysage (`width` / `height`), apparition fluide en cascade au défilement et affichage discret de la focale et de l'ouverture au survol (`50mm · f/1.8`).
- **Albums dynamiques depuis Google Drive** :
  - Images à la racine du dossier Drive → regroupées sous l'album **`Sélection`**.
  - Sous-dossiers directs → chaque nom de sous-dossier devient automatiquement un album filtrable.
  - La barre de filtres est **automatiquement masquée** s'il n'existe qu'un seul album (dossier racine unique).
- **Visionneuse Plein Écran (Lightbox)** :
  - Affichage haute résolution (`=s2400`) avec préchargement automatique des images précédente et suivante.
  - Navigation clavier (`Échap`, `←`, `→`, touche `I` pour le panneau EXIF) et glissement tactile (*swipe*) sur mobile.
  - Panneau d'informations EXIF repliable : boîtier, objectif, focale, ouverture, vitesse formatée en fraction (`1/250s`), ISO, date de prise de vue et légende éditoriale.
- **Esthétique galerie préservée** : les noms de fichiers bruts (ex. `IMG_3434.jpeg`) ne sont jamais affichés ; seule la *Description* Google Drive sert de légende éditoriale.
- **Mode aperçu immédiat** : tant que `VITE_APPS_SCRIPT_URL` n'est pas configurée, le portfolio charge un jeu de données de démonstration local pour être prévisualisable instantanément.

---

## Architecture du projet

```text
photo-portfolio/
├── apps-script/
│   ├── Code.gs                 # API Google Apps Script (Drive API v3, CacheService 20 min, ?refresh=1)
│   └── appsscript.json         # Manifeste activant Drive API v3 et l'application Web
├── public/
│   ├── demo/                   # Photographies de démonstration locales (mode fallback)
│   └── favicon.svg
├── src/
│   ├── components/             # Header, Hero, AlbumFilterBar, MasonryGrid, PhotoCard, Lightbox, AboutSection, Footer
│   ├── config/portfolio.ts     # Identité du photographe, textes éditoriaux et coordonnées
│   ├── data/demoPhotos.ts      # Données de démonstration avec métadonnées EXIF
│   ├── hooks/                  # usePortfolioPhotos, useTheme
│   ├── types/photo.ts          # Modèles TypeScript
│   └── utils/exif.ts           # Formatage des vitesses (1/250s), focales, ouvertures et dates
├── .env.example
├── index.html
└── package.json
```

---

## Prérequis & Mise en ligne étape par étape

### Étape 1 — Préparer votre dossier Google Drive

1. Créez un dossier racine sur [Google Drive](https://drive.google.com) (par exemple `Portfolio Photo`).
2. Déposez vos photographies (`JPEG`, `PNG` ou `WebP`) :
   - Les photos placées **directement à la racine** apparaîtront dans l'album **`Sélection`**.
   - Les photos placées dans des **sous-dossiers directs** (ex. `Architecture`, `Portraits`, `Voyages`) créeront automatiquement des filtres par album portant le nom du sous-dossier.
3. **Partager le dossier en lecture seule** (indispensable pour que les vignettes CDN Google soient accessibles aux visiteurs du site) :
   - Faites un clic droit sur le dossier racine → **Partager** → **Partager**.
   - Dans **Accès général**, remplacez *Limité* par **Tous les utilisateurs disposant du lien**.
   - Vérifiez que le rôle est bien réglé sur **Lecteur** (lecture seule), puis cliquez sur **Terminé**.
4. **Récupérer l'ID du dossier Drive** :
   - Ouvrez votre dossier dans Google Drive et regardez l'URL dans la barre d'adresse :
     `https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz`
   - L'identifiant `ROOT_FOLDER_ID` correspond à la suite de caractères située après `/folders/` (ex. `1AbCdEfGhIjKlMnOpQrStUvWxYz`).

#### Astuces éditoriales (champ « Description » dans Google Drive)

Dans Google Drive, faites un clic droit sur une photo → **Informations sur le fichier** → **Détails** → **Description** :
- **Légende éditoriale** : écrivez simplement un titre ou une courte légende (ex. *« Brume d'aube sur les cimes »*). Si ce champ reste vide, aucun nom de fichier brut (`IMG_3434.jpeg`) ne sera affiché.
- **Photo Hero** : ajoutez `hero` dans la description d'une photo (ex. `hero` ou `hero | Reflets d'après-pluie`) pour la définir automatiquement comme image d'ouverture en plein écran.

---

### Étape 2 — Configurer Google Apps Script et activer Drive API v3

1. Rendez-vous sur [script.google.com](https://script.google.com) et cliquez sur **Nouveau projet**.
2. Renommez le projet (ex. `Portfolio Drive API`).
3. Ouvrez le fichier `Code.gs` créé par défaut, supprimez son contenu, puis copiez-collez l'intégralité de [`apps-script/Code.gs`](./apps-script/Code.gs).
4. Remplacez la constante en haut du fichier par votre identifiant de dossier Drive :
   ```javascript
   const ROOT_FOLDER_ID = "VOTRE_ID_DE_DOSSIER_DRIVE";
   ```
5. **Activer le service avancé Drive API (v3)** :
   - Dans la colonne de gauche, cliquez sur le bouton **`+`** en face de **Services**.
   - Sélectionnez **Drive API** dans la liste.
   - Vérifiez que la **Version** est bien **`v3`** et l'identifiant **`Drive`**.
   - Cliquez sur **Ajouter**.
6. *(Optionnel)* Pour vérifier ou copier le manifeste [`apps-script/appsscript.json`](./apps-script/appsscript.json) : ouvrez **Paramètres du projet** (roue crantée à gauche) → cochez **Afficher le fichier manifeste « appsscript.json » dans l'éditeur**.
7. Enregistrez le projet (`Ctrl + S` / `Cmd + S`).

---

### Étape 3 — Déployer l'Application Web Apps Script

1. En haut à droite de l'éditeur Apps Script, cliquez sur **Déployer** → **Nouveau déploiement**.
2. Cliquez sur l'icône d'engrenage à côté de *Sélectionner un type* → choisissez **Application Web**.
3. Configurez impérativement les options suivantes :
   - **Description** : `Portfolio API v1`
   - **Exécuter en tant que** : **Moi** *(votre compte Google)*
   - **Qui a accès** : **Tout le monde** *(nécessaire pour que le site public puisse interroger le flux JSON sans connexion Google)*
4. Cliquez sur **Déployer**.
5. Lors du premier déploiement, Google demande d'autoriser les permissions : cliquez sur **Autoriser l'accès** → choisissez votre compte → si un écran *"Google n'a pas validé cette application"* apparaît, cliquez sur **Paramètres avancés** → **Accéder à Portfolio Drive API (non sécurisé)** → **Autoriser**.
6. Copiez l'**URL de l'application Web** générée (elle se termine par `/exec`).

> **Vider le cache à la demande** : le script met le flux JSON en cache pendant **20 minutes** (`CacheService`). Après avoir ajouté ou modifié des photos sur Drive, vous pouvez soit cliquer sur **« Vider le cache Drive »** en bas de page du site, soit appeler votre URL Apps Script avec `?refresh=1` à la fin.

---

### Étape 4 — Lancer le site en local & personnaliser l'identité

1. Installez les dépendances :
   ```bash
   npm install
   ```
2. Dupliquez `.env.example` en `.env` et collez votre URL Apps Script :
   ```bash
   cp .env.example .env
   ```
   Dans `.env` :
   ```env
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/VOTRE_DEPLOYMENT_ID/exec
   ```
3. Personnalisez votre nom, monogramme, biographie et coordonnées dans [`src/config/portfolio.ts`](./src/config/portfolio.ts).
4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
5. Vérifiez le build de production :
   ```bash
   npm run build
   ```

---

### Étape 5 — Héberger le site gratuitement

Le site génère des fichiers statiques dans le dossier `dist/` et s'héberge gratuitement en quelques clics :

#### Option A : Vercel (recommandé)
1. Poussez ce dossier sur un dépôt GitHub / GitLab / Bitbucket.
2. Connectez le dépôt sur [vercel.com](https://vercel.com) → **Add New Project**.
3. Framework détecté automatiquement : **Vite** (`npm run build`, dossier de sortie `dist`).
4. Dans **Environment Variables**, ajoutez :
   - Nom : `VITE_APPS_SCRIPT_URL`
   - Valeur : `https://script.google.com/macros/s/.../exec`
5. Cliquez sur **Deploy**.

#### Option B : Netlify
1. Connectez votre dépôt sur [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
2. Build command : `npm run build` · Publish directory : `dist`.
3. Dans **Site configuration → Environment variables**, ajoutez `VITE_APPS_SCRIPT_URL`.
4. Lancez le déploiement.

#### Option C : Cloudflare Pages
1. Connectez votre dépôt dans le tableau de bord [Cloudflare Pages](https://pages.cloudflare.com) → **Workers & Pages** → **Create**.
2. Preset : **Vite** (`npm run build`, output directory : `dist`).
3. Dans **Settings → Environment variables**, ajoutez `VITE_APPS_SCRIPT_URL` pour *Production* (et *Preview* si souhaité).
4. Déployez : chaque nouveau commit mettra automatiquement le site à jour.
