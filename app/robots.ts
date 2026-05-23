import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://remopay.remonode.com';

  return {
    rules: [
      {
        userAgent: '*',

        allow: [
          '/',
          '/about',
          '/faq',
          '/support',
          '/privacy',
          '/terms',
        ],

        disallow: [
          // Authenticated areas
          '/admin',
          '/agent',
          '/dashboard',
          '/wallet',
          '/transactions',
          '/settings',
          '/notifications',

          // Authentication
          '/auth',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',

          // Backend/API
          '/api',
          '/server',
          '/internal',

          // Search/filter/query pages
          '/*?*sort=',
          '/*?*filter=',
          '/*?*search=',

          // Sensitive/static files
          '/_next/',
          '/static/',
          '/*.json$',

          // Prevent indexing of temporary pages
          '/success',
          '/error',
          '/callback',
        ],
      },

      // AI Crawlers
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      {
        userAgent: 'Claude-Web',
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}