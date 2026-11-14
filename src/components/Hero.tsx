import { useEffect, useState } from "react";
import { ArrowDown, Expand } from "lucide-react";
import { PORTFOLIO_CONFIG } from "../config/portfolio";
import type { Photo } from "../types/photo";
import { formatHoverSpecs } from "../utils/exif";
import { BoudoirAudioButton } from "./BoudoirAudioButton";

interface HeroProps {
  heroPhoto?: Photo;
  isLoading: boolean;
  onInspectHero: (photo: Photo) => void;
}

function HeroEditorial({ variant }: { variant: "portrait" | "landscape" }) {
  const isPortrait = variant === "portrait";

  return (
    <>
      <div className="mb-5 flex items-center gap-3.5">
        <span className="h-px w-8 bg-[#C8A97E]" aria-hidden="true" />
        <span className="text-[11px] uppercase tracking-[0.28em] text-[#C8A97E]">
          {PORTFOLIO_CONFIG.heroEyebrow}
        </span>
      </div>

      <h1
        className={`font-serif text-4xl font-light leading-[1.06] tracking-[-0.01em] text-[#F4F4F0] sm:text-6xl ${
          isPortrait ? "lg:text-[4.25rem]" : "lg:text-7xl"
        }`}
      >
        {PORTFOLIO_CONFIG.heroHeadlinePrefix}{" "}
        <span
          className={`block italic text-[#C8A97E] ${
            isPortrait ? "" : "sm:inline"
          }`}
        >
          {PORTFOLIO_CONFIG.heroHeadlineHighlight}
        </span>
      </h1>

      <p className="mt-5 max-w-lg text-sm font-light leading-relaxed text-[#F4F4F0]/78 sm:text-base">
        {PORTFOLIO_CONFIG.heroDescription}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <a
          href="#galerie"
          className="group inline-flex items-center gap-3 rounded-full border border-[#C8A97E]/60 bg-[#09090B]/60 px-6 py-3 text-xs uppercase tracking-[0.22em] text-[#F4F4F0] backdrop-blur-sm transition-all duration-300 hover:border-[#C8A97E] hover:bg-[#C8A97E] hover:text-[#09090B]"
        >
          <span>{PORTFOLIO_CONFIG.heroCtaLabel}</span>
          <ArrowDown
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5"
            aria-hidden="true"
          />
        </a>

        <BoudoirAudioButton />
      </div>
    </>
  );
}

export function Hero({ heroPhoto, isLoading, onInspectHero }: HeroProps) {
  const [scrollY, setScrollY] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [detectedPortrait, setDetectedPortrait] = useState(false);

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
    setDetectedPortrait(false);
  }, [heroPhoto?.id]);

  const isPortrait =
    heroPhoto && heroPhoto.width && heroPhoto.height
      ? heroPhoto.height > heroPhoto.width
      : detectedPortrait;

  const heroSpecs = heroPhoto ? formatHoverSpecs(heroPhoto.exif) : null;
  const parallaxOffset = scrollY * 0.18;

  // Mise en scène dédiée lorsque la photo principale est en format portrait :
  // affiche l'œuvre entière sans aucun rognage aux côtés du texte éditorial.
  if (heroPhoto && isPortrait) {
    const aspectRatio =
      heroPhoto.width && heroPhoto.height
        ? `${heroPhoto.width} / ${heroPhoto.height}`
        : "2 / 3";

    return (
      <section
        id="top"
        aria-label="Présentation du portfolio"
        className="relative flex min-h-[92svh] w-full items-center overflow-hidden bg-[#09090B] pt-24 pb-16 sm:pt-28 sm:pb-20"
      >
        {/* Aura ambiante très subtile issue de l'image */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <img
            src={heroPhoto.thumbUrl || heroPhoto.fullUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full scale-110 object-cover opacity-20 blur-3xl saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090B]/70 via-[#09090B]/65 to-[#09090B]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--bg-primary)] to-transparent transition-colors duration-500" />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-10 px-5 sm:px-10 lg:grid-cols-12 lg:gap-14">
          {/* Colonne texte éditorial */}
          <div className="order-2 lg:order-1 lg:col-span-6">
            <HeroEditorial variant="portrait" />
          </div>

          {/* Colonne œuvre portrait intégrale sans rognage */}
          <div className="order-1 flex justify-center lg:order-2 lg:col-span-6 lg:justify-end">
            <button
              type="button"
              onClick={() => onInspectHero(heroPhoto)}
              aria-label="Ouvrir la photographie mise en avant en plein écran"
              style={{
                transform: `translate3d(0, ${-parallaxOffset * 0.35}px, 0)`,
              }}
              className="group relative block max-w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A97E] cursor-zoom-in"
            >
              <div
                style={{ aspectRatio }}
                className="relative h-[56svh] max-h-[680px] max-w-full overflow-hidden rounded-sm border border-white/15 bg-[#121215] shadow-2xl transition-colors duration-500 sm:h-[68svh] group-hover:border-[#C8A97E]/70"
              >
                {!imageLoaded && (
                  <div className="skeleton-shimmer absolute inset-0" aria-hidden="true" />
                )}

                <img
                  src={heroPhoto.fullUrl || heroPhoto.thumbUrl}
                  alt={heroPhoto.title || "Photographie mise en avant"}
                  referrerPolicy="no-referrer"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalHeight > img.naturalWidth) {
                      setDetectedPortrait(true);
                    }
                    setImageLoaded(true);
                  }}
                  className={`h-full w-full object-contain transition-all duration-700 ease-out group-hover:scale-[1.015] ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 opacity-0 transition-all duration-500 group-hover:opacity-100">
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
                      <p className="mt-0.5 text-[11px] tabular-nums tracking-[0.12em] text-[#F4F4F0]/75">
                        {heroSpecs}
                      </p>
                    )}
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/45 text-[#F4F4F0]/85 backdrop-blur-sm">
                    <Expand className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Format paysage : Hero immersif plein écran
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
            onLoad={(e) => {
              const img = e.currentTarget;
              if (
                (!heroPhoto.width || !heroPhoto.height) &&
                img.naturalHeight > img.naturalWidth
              ) {
                setDetectedPortrait(true);
              }
              setImageLoaded(true);
            }}
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
          <HeroEditorial variant="landscape" />
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
