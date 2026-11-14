import { useEffect, useRef, useState } from "react";
import { Expand } from "lucide-react";
import type { Photo } from "../types/photo";
import { formatHoverSpecs } from "../utils/exif";

interface PhotoCardProps {
  photo: Photo;
  revealDelayMs: number;
  onSelect: (photo: Photo) => void;
}

export function PhotoCard({ photo, revealDelayMs, onSelect }: PhotoCardProps) {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string>(() => {
    if (photo.width && photo.height) {
      return `${photo.width} / ${photo.height}`;
    }
    return "4 / 3";
  });

  useEffect(() => {
    if (photo.width && photo.height) {
      setAspectRatio(`${photo.width} / ${photo.height}`);
    }
  }, [photo.width, photo.height]);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.01, rootMargin: "160px 0px 160px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hoverSpecs = formatHoverSpecs(photo.exif);
  const ariaLabel = photo.title
    ? `Ouvrir « ${photo.title} » en plein écran`
    : `Ouvrir la photographie de l'album ${photo.album} en plein écran`;

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={() => onSelect(photo)}
      aria-label={ariaLabel}
      style={{
        transitionDelay: isVisible ? `${revealDelayMs}ms` : "0ms",
      }}
      className={`group relative block w-full overflow-hidden rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-left transition-[opacity,transform] duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-zoom-in ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio }}>
        {!isLoaded && (
          <div className="skeleton-shimmer absolute inset-0" aria-hidden="true" />
        )}

        <img
          src={photo.thumbUrl}
          alt={photo.title || `Photographie — ${photo.album}`}
          referrerPolicy="no-referrer"
          decoding="async"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
            }
            setIsLoaded(true);
          }}
          className={`h-full w-full object-contain transition-all duration-700 ease-out group-hover:scale-[1.02] ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Assombrissement subtil au survol */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
        />

        {/* Métadonnées discrètes au survol : légende éditoriale éventuelle + focale/ouverture */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 opacity-0 transition-all duration-500 translate-y-1.5 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:p-5">
          <div className="min-w-0">
            {photo.title && (
              <p className="truncate font-serif text-lg italic leading-snug text-[#F4F4F0]">
                {photo.title}
              </p>
            )}
            {hoverSpecs && (
              <p className="mt-0.5 text-[11px] font-normal tabular-nums tracking-[0.16em] text-[#C8A97E]">
                {hoverSpecs}
              </p>
            )}
          </div>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/35 text-[#F4F4F0]/85 backdrop-blur-sm">
            <Expand className="h-3 w-3" aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  );
}
