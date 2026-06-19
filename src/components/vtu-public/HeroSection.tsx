interface HeroSectionProps {
  title: string;
  subtitle: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function HeroSection({
  title,
  subtitle,
  description,
  ctaText,
  ctaHref,
}: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-white py-20 sm:py-32">
      {/* Background gradient accent */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-red-50 opacity-30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-blue-50 opacity-20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl">
          {title}
        </h1>
        
        <p className="mb-6 text-xl font-semibold text-red-600">
          {subtitle}
        </p>

        {description && (
          <p className="mb-8 max-w-2xl mx-auto text-lg text-gray-600">
            {description}
          </p>
        )}

        {ctaText && ctaHref && (
          <a
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-8 py-3 font-semibold text-white transition-all hover:bg-red-700 hover:shadow-lg shadow-red-600/30"
          >
            {ctaText}
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
