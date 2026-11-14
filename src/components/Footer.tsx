import { ArrowUpRight, Mail, RefreshCw } from "lucide-react";
import { PORTFOLIO_CONFIG } from "../config/portfolio";

interface FooterProps {
  hasConfiguredEndpoint: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function Footer({
  hasConfiguredEndpoint,
  isRefreshing,
  onRefresh,
}: FooterProps) {
  const { contact, photographerName } = PORTFOLIO_CONFIG;
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contact"
      aria-labelledby="contact-heading"
      className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/55 transition-colors duration-500"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-10 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-7 bg-[var(--accent)]" aria-hidden="true" />
              <span className="text-[11px] uppercase tracking-[0.26em] text-[var(--accent)]">
                {contact.eyebrow}
              </span>
            </div>
            <h2
              id="contact-heading"
              className="max-w-xl font-serif text-3xl font-light leading-[1.16] text-[var(--text-primary)] sm:text-4xl"
            >
              {contact.title}
            </h2>
            <p className="mt-4 max-w-lg text-sm font-light leading-relaxed text-[var(--text-secondary)]">
              {contact.description}
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 lg:col-span-5 lg:items-end">
            <a
              href={`mailto:${contact.email}`}
              className="group inline-flex items-center gap-3 rounded-full border border-[var(--border-strong)] bg-[var(--bg-primary)] px-6 py-3 text-xs tracking-[0.14em] text-[var(--text-primary)] transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Mail className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
              <span>{contact.email}</span>
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>

            <a
              href={contact.instagramUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 text-xs tracking-[0.16em] text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
            >
              <span>Instagram · {contact.instagramHandle}</span>
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[var(--border-subtle)] pt-8 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center">
          <p>
            © {currentYear} {photographerName} — Tous droits réservés. Toute
            reproduction interdite sans autorisation écrite.
          </p>

          <div className="flex items-center gap-5">
            {hasConfiguredEndpoint && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)] disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw
                  className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
                <span>{isRefreshing ? "Actualisation…" : "Vider le cache Drive"}</span>
              </button>
            )}
            <a
              href="#top"
              className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Haut de page
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
