import { useEffect, useMemo, useState } from "react";
import type { Photo } from "../types/photo";
import { PhotoCard } from "./PhotoCard";

interface MasonryGridProps {
  photos: Photo[];
  isLoading: boolean;
  onSelectPhoto: (photo: Photo) => void;
}

function getColumnCount(width: number): number {
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

const SKELETON_ASPECTS = ["3 / 4", "3 / 2", "4 / 5", "16 / 10", "2 / 3", "4 / 3"];

export function MasonryGrid({
  photos,
  isLoading,
  onSelectPhoto,
}: MasonryGridProps) {
  const [columnCount, setColumnCount] = useState<number>(() =>
    typeof window !== "undefined" ? getColumnCount(window.innerWidth) : 3
  );

  useEffect(() => {
    const onResize = () => {
      const next = getColumnCount(window.innerWidth);
      setColumnCount((prev) => (prev === next ? prev : next));
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Distribution équilibrée par colonne la plus courte :
  // respecte l'ordre de lecture gauche-droite et préserve les ratios natifs sans rognage.
  const columns = useMemo(() => {
    const cols: Array<Array<{ photo: Photo; orderIndex: number }>> = Array.from(
      { length: columnCount },
      () => []
    );
    const heights = new Array<number>(columnCount).fill(0);

    photos.forEach((photo, index) => {
      let shortestCol = 0;
      for (let c = 1; c < columnCount; c++) {
        if (heights[c] < heights[shortestCol]) {
          shortestCol = c;
        }
      }

      const ratioHeight =
        photo.width && photo.height ? photo.height / photo.width : 0.75;

      cols[shortestCol].push({ photo, orderIndex: index });
      heights[shortestCol] += ratioHeight + 0.08;
    });

    return cols;
  }, [photos, columnCount]);

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-label="Chargement de la galerie photographique"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
      >
        {Array.from({ length: columnCount }).map((_, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-5 lg:gap-7">
            {[0, 1].map((rowIdx) => {
              const aspectRatio =
                SKELETON_ASPECTS[(colIdx + rowIdx * columnCount) % SKELETON_ASPECTS.length];
              return (
                <div
                  key={rowIdx}
                  style={{ aspectRatio }}
                  className="skeleton-shimmer w-full rounded-sm border border-[var(--border-subtle)]"
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-16 text-center">
        <p className="font-serif text-2xl italic text-[var(--text-primary)]">
          Aucune photographie dans cette série pour le moment.
        </p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Ajoutez des images dans votre dossier Google Drive ou sélectionnez une autre série.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
      {columns.map((columnItems, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-5 lg:gap-7">
          {columnItems.map(({ photo, orderIndex }) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              revealDelayMs={(orderIndex % Math.max(columnCount, 1)) * 60}
              onSelect={onSelectPhoto}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
