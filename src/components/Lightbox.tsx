import { useCallback, useEffect, useRef, useState } from "react";
import {
  Aperture,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Focus,
  Gauge,
  Info,
  Timer,
  X,
} from "lucide-react";
import type { Photo } from "../types/photo";
import {
  formatAperture,
  formatCameraName,
  formatExifDate,
  formatExposureTime,
  formatFocalLength,
} from "../utils/exif";

interface LightboxProps {
  photos: Photo[];
  activeIndex: number;
  onClose: () => void;
  onChangeIndex: (nextIndex: number) => void;
}

export function Lightbox({
  photos,
  activeIndex,
  onClose,
  onChangeIndex,
}: LightboxProps) {
  const total = photos.length;
  const photo = photos[activeIndex];

  const [fullLoadedId, setFullLoadedId] = useState<string | null>(null);
  const [isExifOpen, setIsExifOpen] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    onChangeIndex((activeIndex - 1 + total) % total);
  }, [activeIndex, onChangeIndex, total]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    onChangeIndex((activeIndex + 1) % total);
  }, [activeIndex, onChangeIndex, total]);

  // Verrouille le scroll du document pendant l'ouverture de la visionneuse
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Navigation clavier (Échap, Flèche Gauche, Flèche Droite, touche I pour EXIF)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        setIsExifOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose]);

  // Préchargement haute résolution (fullUrl) des photos précédente et suivante
  useEffect(() => {
    if (total <= 1) return;
    const prevPhoto = photos[(activeIndex - 1 + total) % total];
    const nextPhoto = photos[(activeIndex + 1) % total];

    const preloaded: HTMLImageElement[] = [];
    [nextPhoto, prevPhoto].forEach((neighbor) => {
      if (neighbor?.fullUrl) {
        const img = new Image();
        img.referrerPolicy = "no-referrer";
        img.src = neighbor.fullUrl;
        preloaded.push(img);
      }
    });

    return () => {
      preloaded.length = 0;
    };
  }, [activeIndex, photos, total]);

  if (!photo) return null;

  const isFullLoaded = fullLoadedId === photo.id;

  const camera = formatCameraName(photo.exif.cameraMake, photo.exif.cameraModel);
  const lens = photo.exif.lens?.trim() || null;
  const focalLength = formatFocalLength(photo.exif.focalLength);
  const aperture = formatAperture(photo.exif.aperture);
  const exposureTime = formatExposureTime(photo.exif.exposureTime);
  const iso =
    typeof photo.exif.isoSpeed === "number" && photo.exif.isoSpeed > 0
      ? `ISO ${photo.exif.isoSpeed}`
      : null;
  const captureDate = formatExifDate(photo.exif.time);

  const exifRows = [
    { label: "Boîtier", value: camera, icon: Camera },
    { label: "Objectif", value: lens, icon: Focus },
    { label: "Focale", value: focalLength, icon: Focus },
    { label: "Ouverture", value: aperture, icon: Aperture },
    { label: "Vitesse", value: exposureTime, icon: Timer },
    { label: "Sensibilité", value: iso, icon: Gauge },
    { label: "Prise de vue", value: captureDate, icon: Calendar },
  ].filter((row): row is { label: string; value: string; icon: typeof Camera } => Boolean(row.value));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse photographique plein écran"
      className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-primary)]/96 text-[var(--text-primary)] backdrop-blur-xl transition-colors duration-300"
    >
      {/* Barre supérieure de la visionneuse */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--accent)]">
            {photo.album}
          </span>
          <span className="text-xs tabular-nums text-[var(--text-muted)]">
            {activeIndex + 1} / {total}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsExifOpen((open) => !open)}
            aria-expanded={isExifOpen}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors cursor-pointer ${
              isExifOpen
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Info className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
            <span>Données EXIF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la visionneuse (Échap)"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Corps principal : Zone Image + Panneau EXIF repliable */}
      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Zone d'affichage de la photographie avec support Swipe tactile */}
        <div
          className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4 sm:p-8 lg:p-10 select-none"
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
              };
            }
          }}
          onTouchEnd={(e) => {
            if (!touchStartRef.current || e.changedTouches.length === 0) return;
            const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
            const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
            touchStartRef.current = null;

            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
              if (dx < 0) {
                goNext();
              } else {
                goPrev();
              }
            }
          }}
        >
          {/* Bouton Précédent */}
          {total > 1 && (
            <button
              type="button"
              onClick={goPrev}
              aria-label="Photographie précédente (Flèche gauche)"
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 text-[var(--text-primary)] backdrop-blur-md transition-all hover:border-[var(--accent)] hover:scale-105 sm:left-6 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          )}

          {/* Conteneur progressif : aperçu rapide + image haute définition (fullUrl) */}
          <div className="relative flex h-full w-full items-center justify-center">
            {photo.thumbUrl !== photo.fullUrl && !isFullLoaded && (
              <img
                src={photo.thumbUrl}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain opacity-70 blur-[1px]"
              />
            )}

            <img
              key={photo.id}
              src={photo.fullUrl}
              alt={photo.title || `Photographie — ${photo.album}`}
              referrerPolicy="no-referrer"
              onLoad={() => setFullLoadedId(photo.id)}
              className={`${
                photo.thumbUrl !== photo.fullUrl && !isFullLoaded
                  ? "absolute inset-0 m-auto"
                  : ""
              } max-h-full max-w-full object-contain shadow-2xl transition-opacity duration-500 ${
                isFullLoaded || photo.thumbUrl === photo.fullUrl
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            />
          </div>

          {/* Bouton Suivant */}
          {total > 1 && (
            <button
              type="button"
              onClick={goNext}
              aria-label="Photographie suivante (Flèche droite)"
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 text-[var(--text-primary)] backdrop-blur-md transition-all hover:border-[var(--accent)] hover:scale-105 sm:right-6 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Panneau d'informations EXIF repliable */}
        {isExifOpen && (
          <aside
            aria-label="Détails techniques et légende"
            className="max-h-[42vh] shrink-0 overflow-y-auto border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-6 lg:max-h-none lg:w-88 lg:border-l lg:border-t-0 lg:px-7 lg:py-8"
          >
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--accent)]">
                  Fiche Technique
                </p>
                {photo.title ? (
                  <h2 className="mt-2 font-serif text-2xl italic leading-snug text-[var(--text-primary)]">
                    {photo.title}
                  </h2>
                ) : (
                  <p className="mt-2 font-serif text-lg italic text-[var(--text-secondary)]">
                    Tirage sans titre — Série {photo.album}
                  </p>
                )}
              </div>

              <div className="h-px bg-[var(--border-subtle)]" />

              {exifRows.length > 0 ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-1">
                  {exifRows.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-start justify-between gap-3">
                      <dt className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <Icon
                          className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]"
                          aria-hidden="true"
                        />
                        <span>{label}</span>
                      </dt>
                      <dd className="text-right text-xs font-medium tabular-nums text-[var(--text-primary)]">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  Les données EXIF de cette photographie n'ont pas été renseignées.
                </p>
              )}

              {photo.width && photo.height && (
                <>
                  <div className="h-px bg-[var(--border-subtle)]" />
                  <p className="text-[11px] tabular-nums tracking-[0.12em] text-[var(--text-muted)]">
                    Format natif : {photo.width} × {photo.height} px
                  </p>
                </>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
