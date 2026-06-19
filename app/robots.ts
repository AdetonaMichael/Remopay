import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://remopay.remonode.com';

  return {
    rules: [
      // Main search engines - allowed to crawl public pages
      {
        userAgent: ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider', 'YandexBot'],
        allow: [
          '/',
          '/about',
          '/faq',
          '/support',
          '/privacy',
          '/terms',
          '/multi-currency',
          '/auth/login',
          '/auth/register',
          '/auth/forgot-password',
          '/vtu',
          '/vtu/*',
          '/vtu/airtime',
          '/vtu/data',
          '/vtu/tv',
          '/vtu/bills',
        ],
        disallow: [
          // Authenticated user areas - should not be indexed
          '/admin',
          '/admin/*',
          '/agent',
          '/agent/*',
          '/dashboard',
          '/dashboard/*',
          '/wallet',
          '/wallet/*',
          '/settings',
          '/settings/*',
          '/notifications',
          '/notifications/*',
          '/transactions',
          '/transactions/*',
          
          // Authentication flows
          '/auth/verify-email',
          '/auth/verify-phone',
          '/auth/verify-email/*',
          '/auth/verify-phone/*',

          // Backend/API - never index
          '/api',
          '/api/*',
          '/server',
          '/server/*',
          '/internal',
          '/internal/*',

          // Dynamic query parameters that create duplicate content
          '/*?*sort=*',
          '/*?*filter=*',
          '/*?*search=*',
          '/*?*page=*',

          // System/temporary files
          '/_next',
          '/_next/*',
          '/static',
          '/static/*',
          '/*.json',
          '/*.xml',
          '/*.js',
          '/success',
          '/error',
          '/callback',
          '/not-found',
        ],
        crawlDelay: 1, // Be respectful to server
      },

      // Default for all other user agents
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/faq',
          '/support',
          '/privacy',
          '/terms',
          '/multi-currency',
          '/auth/login',
          '/auth/register',
          '/vtu',
          '/vtu/*',
        ],
        disallow: [
          '/admin',
          '/agent',
          '/dashboard',
          '/wallet',
          '/api',
          '/auth/verify',
          '/_next',
          '/*.json',
        ],
      },

      // Block AI/LLM training crawlers
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
      {
        userAgent: 'OpenAI-User',
        disallow: '/',
      },
      {
        userAgent: 'OpenAI',
        disallow: '/',
      },
      {
        userAgent: 'Applebot',
        disallow: '/',
      },
      {
        userAgent: 'Applebot-Extended',
        disallow: '/',
      },
    ],

    // Sitemap location for search engines
    sitemap: `${baseUrl}/sitemap.xml`,
    
    // Host canonical domain
    host: baseUrl,
  };
}