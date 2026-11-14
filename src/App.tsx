import { useMemo, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { AboutSection } from "./components/AboutSection";
import { ALL_ALBUMS_KEY, AlbumFilterBar } from "./components/AlbumFilterBar";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Lightbox } from "./components/Lightbox";
import { MasonryGrid } from "./components/MasonryGrid";
import { usePortfolioPhotos } from "./hooks/usePortfolioPhotos";
import { useTheme } from "./hooks/useTheme";
import type { Photo } from "./types/photo";

interface LightboxState {
  list: Photo[];
  index: number;
}

export function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    photos,
    albums,
    isLoading,
    isRefreshing,
    error,
    sourceMode,
    hasConfiguredEndpoint,
    refresh,
  } = usePortfolioPhotos();

  const [selectedAlbum, setSelectedAlbum] = useState<string>(ALL_ALBUMS_KEY);
  const [lightboxState, setLightboxState] = useState<LightboxState | null>(null);

  const heroPhoto = useMemo(
    () => photos.find((photo) => photo.isHero) ?? photos[0],
    [photos]
  );

  const albumCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const photo of photos) {
      counts[photo.album] = (counts[photo.album] ?? 0) + 1;
    }
    return counts;
  }, [photos]);

  const effectiveAlbum =
    albums.length <= 1 ||
    (selectedAlbum !== ALL_ALBUMS_KEY && !albums.includes(selectedAlbum))
      ? ALL_ALBUMS_KEY
      : selectedAlbum;

  const filteredPhotos = useMemo(() => {
    if (effectiveAlbum === ALL_ALBUMS_KEY) {
      return photos;
    }
    return photos.filter((photo) => photo.album === effectiveAlbum);
  }, [effectiveAlbum, photos]);

  const openPhotoInLightbox = (photo: Photo, sourceList: Photo[]) => {
    const index = sourceList.findIndex((item) => item.id === photo.id);
    if (index === -1) return;
    setLightboxState({ list: sourceList, index });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main>
        <Hero
          heroPhoto={heroPhoto}
          isLoading={isLoading}
          onInspectHero={(photo) => openPhotoInLightbox(photo, photos)}
        />

        <section
          id="galerie"
          aria-labelledby="gallery-heading"
          className="mx-auto max-w-[1440px] px-5 py-20 sm:px-10 sm:py-28"
        >
          {/* En-tête de la galerie */}
          <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-14 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-7 bg-[var(--accent)]" aria-hidden="true" />
                <span className="text-[11px] uppercase tracking-[0.26em] text-[var(--accent)]">
                  Exposition
                </span>
              </div>
              <h2
                id="gallery-heading"
                className="font-serif text-3xl font-light tracking-[-0.01em] text-[var(--text-primary)] sm:text-5xl"
              >
                {effectiveAlbum === ALL_ALBUMS_KEY ? "Sélection d'œuvres" : effectiveAlbum}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {sourceMode === "demo" && (
                <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-[11px] tracking-[0.12em] text-[var(--text-secondary)]">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                    aria-hidden="true"
                  />
                  Aperçu démo · Données locales
                </span>
              )}

              {!isLoading && photos.length > 0 && (
                <span className="whitespace-nowrap text-xs tabular-nums tracking-[0.16em] text-[var(--text-muted)]">
                  {filteredPhotos.length}{" "}
                  {filteredPhotos.length > 1 ? "photographies" : "photographie"}
                </span>
              )}
            </div>
          </div>

          {/* Notification non bloquante si l'endpoint configuré échoue */}
          {error && (
            <div
              role="status"
              className="mb-8 flex flex-col items-start justify-between gap-4 rounded-sm border border-[var(--accent)]/40 bg-[var(--bg-surface)] px-5 py-4 text-xs text-[var(--text-secondary)] sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3">
                <AlertCircle
                  className="h-4 w-4 shrink-0 text-[var(--accent)]"
                  aria-hidden="true"
                />
                <span>
                  Connexion Google Drive indisponible ({error}). Affichage de la
                  galerie de secours.
                </span>
              </div>
              <button
                type="button"
                onClick={() => void refresh(false)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                <span>Réessayer</span>
              </button>
            </div>
          )}

          {/* Barre d'albums dynamique (auto-masquée si <= 1 album) */}
          <AlbumFilterBar
            albums={albums}
            selectedAlbum={effectiveAlbum}
            albumCounts={albumCounts}
            totalCount={photos.length}
            onSelectAlbum={setSelectedAlbum}
          />

          {/* Grille Maçonnerie adaptative */}
          <MasonryGrid
            photos={filteredPhotos}
            isLoading={isLoading}
            onSelectPhoto={(photo) => openPhotoInLightbox(photo, filteredPhotos)}
          />
        </section>

        <AboutSection />
      </main>

      <Footer
        hasConfiguredEndpoint={hasConfiguredEndpoint}
        isRefreshing={isRefreshing}
        onRefresh={() => void refresh(true)}
      />

      {/* Visionneuse Plein Écran */}
      {lightboxState && (
        <Lightbox
          photos={lightboxState.list}
          activeIndex={lightboxState.index}
          onClose={() => setLightboxState(null)}
          onChangeIndex={(nextIndex) =>
            setLightboxState((prev) =>
              prev ? { ...prev, index: nextIndex } : null
            )
          }
        />
      )}
    </div>
  );
}

export default App;
