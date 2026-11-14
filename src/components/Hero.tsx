import { useEffect, useState } from "react";
import { ArrowDown, Expand } from "lucide-react";
import { PORTFOLIO_CONFIG } from "../config/portfolio";
import type { Photo } from "../types/photo";
import { formatHoverSpecs } from "../utils/exif";

interface HeroProps {
  heroPhoto?: Photo;
  isLoading: boolean;
  onInspectHero: (photo: Photo) => void;
}

export function Hero({ heroPhoto, isLoading, onInspectHero }: HeroProps) {
  const [scrollY, setScrollY] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    let rafId = 0;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        setScrollY(Math.min(window.scrollY, 900));
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setImageLoaded(false);
  }, [heroPhoto?.id]);

  const heroSpecs = heroPhoto ? formatHoverSpecs(heroPhoto.exif) : null;
  const parallaxOffset = scrollY * 0.22;

  return (
    <section
      id="top"
      aria-label="Présentation du portfolio"
      className="relative flex min-h-[92svh] w-full items-end overflow-hidden bg-[#09090B]"
    >
      {/* Image d'arrière-plan avec parallaxe discret et fondu */}
      <div
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={{
          transform: `translate3d(0, ${parallaxOffset}px, 0) scale(1.06)`,
        }}
      >
        {heroPhoto ? (
          <img
            src={heroPhoto.fullUrl || heroPhoto.thumbUrl}
            alt={heroPhoto.title || "Photographie mise en avant"}
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            className={`h-full w-full object-cover object-center transition-opacity duration-1000 ease-out ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div
            className={`h-full w-full bg-[#121215] ${
              isLoading ? "skeleton-shimmer" : ""
            }`}
          />
        )}
      </div>

      {/* Voiles atmosphériques garantissant contraste et transition douce */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-[#09090B]/92"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--bg-primary)] to-transparent transition-colors duration-500"
      />

      {/* Contenu éditorial du Hero */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-8 px-5 pb-14 pt-32 sm:px-10 sm:pb-20 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <div className="mb-5 flex items-center gap-3.5">
            <span className="h-px w-8 bg-[#C8A97E]" aria-hidden="true" />
            <span className="text-[11px] uppercase tracking-[0.28em] text-[#C8A97E]">
              {PORTFOLIO_CONFIG.heroEyebrow}
            </span>
          </div>

          <h1 className="font-serif text-4xl font-light leading-[1.06] tracking-[-0.01em] text-[#F4F4F0] sm:text-6xl lg:text-7xl">
            {PORTFOLIO_CONFIG.heroHeadlinePrefix}{" "}
            <span className="block italic text-[#C8A97E] sm:inline">
              {PORTFOLIO_CONFIG.heroHeadlineHighlight}
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-sm font-light leading-relaxed text-[#F4F4F0]/78 sm:text-base">
            {PORTFOLIO_CONFIG.heroDescription}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a
              href="#galerie"
              className="group inline-flex items-center gap-3 rounded-full border border-[#C8A97E]/60 bg-[#09090B]/55 px-6 py-3 text-xs uppercase tracking-[0.22em] text-[#F4F4F0] backdrop-blur-sm transition-all duration-300 hover:border-[#C8A97E] hover:bg-[#C8A97E] hover:text-[#09090B]"
            >
              <span>{PORTFOLIO_CONFIG.heroCtaLabel}</span>
              <ArrowDown
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        {/* Cartouche discret de l'œuvre en couverture */}
        {heroPhoto && (
          <button
            type="button"
            onClick={() => onInspectHero(heroPhoto)}
            className="group self-start rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-left backdrop-blur-md transition-all duration-300 hover:border-[#C8A97E]/60 hover:bg-black/60 lg:self-end cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#C8A97E]">
                  {heroPhoto.album}
                </p>
                {heroPhoto.title && (
                  <p className="mt-0.5 font-serif text-base italic text-[#F4F4F0]">
                    {heroPhoto.title}
                  </p>
                )}
                {heroSpecs && (
                  <p className="mt-0.5 text-[11px] tabular-nums tracking-[0.12em] text-[#F4F4F0]/65">
                    {heroSpecs}
                  </p>
                )}
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-[#F4F4F0]/75 transition-colors group-hover:border-[#C8A97E] group-hover:text-[#C8A97E]">
                <Expand className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </button>
        )}
      </div>
    </section>
  );
}
