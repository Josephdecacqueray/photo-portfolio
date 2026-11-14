import { PORTFOLIO_CONFIG } from "../config/portfolio";

export function AboutSection() {
  const { about } = PORTFOLIO_CONFIG;

  return (
    <section
      id="apropos"
      aria-labelledby="about-heading"
      className="border-t border-[var(--border-subtle)] py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-7 bg-[var(--accent)]" aria-hidden="true" />
            <span className="text-[11px] uppercase tracking-[0.26em] text-[var(--accent)]">
              {about.eyebrow}
            </span>
          </div>
          <h2
            id="about-heading"
            className="font-serif text-3xl font-light leading-[1.15] text-[var(--text-primary)] sm:text-5xl"
          >
            {about.title}
          </h2>
        </div>

        <div className="space-y-8 lg:col-span-7">
          <div className="space-y-5 text-sm font-light leading-[1.85] text-[var(--text-secondary)] sm:text-base">
            {about.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <dl className="grid gap-6 border-t border-[var(--border-subtle)] pt-8 sm:grid-cols-3">
            {about.details.map((detail) => (
              <div key={detail.label}>
                <dt className="text-[10px] uppercase tracking-[0.24em] text-[var(--accent)]">
                  {detail.label}
                </dt>
                <dd className="mt-2 text-xs leading-relaxed text-[var(--text-primary)] sm:text-sm">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
