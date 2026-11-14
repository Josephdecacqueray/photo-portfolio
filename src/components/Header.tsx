import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { PORTFOLIO_CONFIG } from "../config/portfolio";
import type { ThemeMode } from "../types/photo";

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { href: "#galerie", label: "Galerie" },
  { href: "#apropos", label: "À propos" },
  { href: "#contact", label: "Contact" },
] as const;

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 64);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nextThemeLabel =
    theme === "dark" ? "Passer en Galerie Claire" : "Passer en Chambre Noire";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-200 ${
        scrolled
          ? "border-b border-[var(--border-subtle)] bg-[var(--bg-header)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:h-20 sm:px-10">
        {/* Monogramme & Identité */}
        <a
          href="#top"
          className={`group flex items-center gap-3.5 transition-colors duration-300 ${
            scrolled ? "text-[var(--text-primary)]" : "text-[#F4F4F0]"
          }`}
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full border font-serif text-sm tracking-[0.16em] transition-colors duration-300 ${
              scrolled
                ? "border-[var(--border-strong)] group-hover:border-[var(--accent)]"
                : "border-white/25 group-hover:border-[#C8A97E]"
            }`}
          >
            {PORTFOLIO_CONFIG.monogram}
          </span>
          <span className="flex flex-col">
            <span className="font-serif text-lg tracking-[0.06em] sm:text-xl">
              {PORTFOLIO_CONFIG.photographerName}
            </span>
            <span
              className={`hidden text-[10px] uppercase tracking-[0.26em] sm:block ${
                scrolled ? "text-[var(--text-secondary)]" : "text-[#F4F4F0]/65"
              }`}
            >
              {PORTFOLIO_CONFIG.subtitle}
            </span>
          </span>
        </a>

        {/* Navigation bureau + Sélecteur de thème */}
        <div className="flex items-center gap-6 sm:gap-9">
          <nav aria-label="Navigation principale" className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`relative text-xs uppercase tracking-[0.22em] transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#C8A97E] after:transition-all after:duration-300 hover:after:w-full ${
                  scrolled
                    ? "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    : "text-[#F4F4F0]/80 hover:text-[#F4F4F0]"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={onToggleTheme}
            title={nextThemeLabel}
            aria-label={nextThemeLabel}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-all duration-300 cursor-pointer ${
              scrolled
                ? "border-[var(--border-subtle)] bg-[var(--bg-surface)]/70 text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
                : "border-white/20 bg-black/25 text-[#F4F4F0]/85 hover:border-[#C8A97E] hover:text-white"
            }`}
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-3.5 w-3.5 text-[#C8A97E]" aria-hidden="true" />
                <span className="hidden lg:inline">Galerie Claire</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-[#C8A97E]" aria-hidden="true" />
                <span className="hidden lg:inline">Chambre Noire</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors md:hidden cursor-pointer ${
              scrolled
                ? "border-[var(--border-subtle)] text-[var(--text-primary)]"
                : "border-white/20 text-[#F4F4F0]"
            }`}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {mobileMenuOpen && (
        <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 px-6 py-5 backdrop-blur-lg md:hidden">
          <nav aria-label="Navigation mobile" className="flex flex-col gap-4">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs uppercase tracking-[0.24em] text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
