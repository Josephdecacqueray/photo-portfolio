interface AlbumFilterBarProps {
  albums: string[];
  selectedAlbum: string;
  albumCounts: Record<string, number>;
  totalCount: number;
  onSelectAlbum: (album: string) => void;
}

export const ALL_ALBUMS_KEY = "__ALL__";

export function AlbumFilterBar({
  albums,
  selectedAlbum,
  albumCounts,
  totalCount,
  onSelectAlbum,
}: AlbumFilterBarProps) {
  // Règle stricte : masqué automatiquement s'il n'y a qu'un seul dossier racine / album
  if (albums.length <= 1) {
    return null;
  }

  return (
    <div className="mb-10 border-b border-[var(--border-subtle)] pb-3 sm:mb-12">
      <div
        role="tablist"
        aria-label="Filtrer par album photographique"
        className="flex flex-wrap items-center gap-x-7 gap-y-3"
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedAlbum === ALL_ALBUMS_KEY}
          onClick={() => onSelectAlbum(ALL_ALBUMS_KEY)}
          className={`relative pb-2.5 text-xs uppercase tracking-[0.22em] transition-colors duration-300 cursor-pointer ${
            selectedAlbum === ALL_ALBUMS_KEY
              ? "text-[var(--text-primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <span>Toutes les séries</span>
          <span className="ml-1.5 text-[10px] tabular-nums text-[var(--text-muted)]">
            {totalCount}
          </span>
          <span
            aria-hidden="true"
            className={`absolute inset-x-0 -bottom-[13px] h-[1.5px] bg-[var(--accent)] transition-transform duration-300 origin-left ${
              selectedAlbum === ALL_ALBUMS_KEY ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </button>

        {albums.map((album) => {
          const isActive = selectedAlbum === album;
          const count = albumCounts[album] ?? 0;

          return (
            <button
              key={album}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectAlbum(album)}
              className={`relative pb-2.5 text-xs uppercase tracking-[0.22em] transition-colors duration-300 cursor-pointer ${
                isActive
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span>{album}</span>
              <span className="ml-1.5 text-[10px] tabular-nums text-[var(--text-muted)]">
                {count}
              </span>
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 -bottom-[13px] h-[1.5px] bg-[var(--accent)] transition-transform duration-300 origin-left ${
                  isActive ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
