import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://remopay.remonode.com';
  const lastModified = new Date();

  // Main pages with highest priority
  const mainPages = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/multi-currency`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
  ];

  // Service feature pages - high priority for SEO
  const serviceFeaturePages = [
    {
      url: `${baseUrl}/services/usd-accounts`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/services/virtual-dollar-cards`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/services/virtual-topup`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/services/airtime-to-cash`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/services/money-transfer`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/services/bill-payments`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/services/international-payments`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Informational pages - medium priority
  const infoPages = [
    {
      url: `${baseUrl}/faq`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    },
    {
      url: `${baseUrl}/support`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // Auth pages - lower priority (users need to login/signup)
  const authPages = [
    {
      url: `${baseUrl}/auth/login`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7, // Higher priority for signup to improve conversions
    },
    {
      url: `${baseUrl}/auth/forgot-password`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ];

  // Combine all public pages - EXCLUDE dashboard, admin, agent pages
  return [...mainPages, ...serviceFeaturePages, ...infoPages, ...authPages];
}
