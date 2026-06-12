import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";

// Using system fonts instead of Google Fonts to avoid network dependency during build

export const metadata: Metadata = {
  title: "Remopay - Digital Finance Platform | USD Accounts, Virtual Cards & Bill Payments",
  description: "Remopay is a modern digital finance platform with USD accounts, virtual dollar cards, money transfers, bill payments, airtime conversion, and VTU services. Secure international payments for freelancers, remote workers, and businesses.",
  keywords: "digital finance platform, USD account, virtual dollar card, international payments, online payments, money transfer, bill payments, airtime to cash, virtual top-up, digital wallet, fintech, financial services, cross-border payments, dollar banking, payment solutions, virtual card, freelance payments, remote worker payments, VTU, data bundles, airtime, MTN, Airtel, Glo, 9mobile",
  authors: [{ name: "Remopay" }],
  creator: "Remopay",
  publisher: "Remopay",
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  metadataBase: new URL("https://remopay.remonode.com"),
  alternates: {
    canonical: "https://remopay.remonode.com",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/icon.png?v=2",
        sizes: "any",
        type: "image/png",
      },
      {
        url: "/icon.png?v=2",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon.png?v=2",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    apple: {
      url: "/icon.png?v=2",
      sizes: "180x180",
      type: "image/png",
    },
    shortcut: "/icon.png?v=2",
  },
  openGraph: {
    type: "website",
    url: "https://remopay.remonode.com",
    title: "Remopay - Your All-in-One Digital Finance Solution",
    description: "Secure USD accounts, virtual dollar cards, international payments, money transfers, bill payments, and airtime conversion - all in one platform.",
    siteName: "Remopay",
    images: [
      {
        url: "https://remopay.remonode.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Remopay - Digital Finance Platform",
      },
      {
        url: "https://remopay.remonode.com/remopay-banner.png",
        width: 800,
        height: 420,
        alt: "Remopay - Your all-in-one payment solution",
        type: "image/png",
      },
    ],
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remopay - Your all-in-one payment solution",
    description: "Make Payment, Virtual Dollar Card and Virtual Top Up Services (Data | Airtime | Electricity | TV Subscription)",
    images: ["https://remopay.remonode.com/remopay-banner.png"],
    creator: "@Remopay",
    site: "@Remopay",
  },
  category: "Technology",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Remopay",
    url: "https://remopay.remonode.com",
    logo: "https://remopay.remonode.com/icon.png",
    description: "Remopay is a modern digital finance platform that empowers individuals and businesses with secure USD accounts, virtual dollar cards, seamless money transfers, and everyday payment solutions.",
    sameAs: [
      "https://www.facebook.com/RemonodeTech/",
      "https://www.twitter.com/RemonodeTech",
      "https://www.instagram.com/RemonodeTech",
      "https://www.linkedin.com/company/remonode",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@remonode.com",
      availableLanguage: ["en"],
      telephone: "+234-xxx-xxxx",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "NG",
    },
    foundingDate: "2024",
    areaServed: "NG",
    knowsAbout: [
      "Digital Finance",
      "Online Payments",
      "International Money Transfers",
      "Virtual Dollar Cards",
      "USD Banking",
      "Bill Payments",
      "Virtual Top-Up Services",
      "Airtime to Cash Conversion",
      "Financial Services",
      "Fintech",
    ],
    offers: [
      {
        "@type": "Service",
        name: "USD Accounts",
        description: "Receive, hold, and manage US Dollar payments conveniently from clients, businesses, and international platforms.",
      },
      {
        "@type": "Service",
        name: "Virtual Dollar Cards",
        description: "Secure virtual USD cards for international online payments, subscriptions, advertising, e-commerce, and global transactions.",
      },
      {
        "@type": "Service",
        name: "Virtual Top-Up Services",
        description: "Buy airtime, mobile data, electricity tokens, TV subscriptions, examination pins, and more at competitive rates.",
      },
      {
        "@type": "Service",
        name: "Airtime to Cash Conversion",
        description: "Instantly convert excess airtime into cash directly within the platform.",
      },
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Remopay",
    url: "https://remopay.remonode.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://remopay.remonode.com/search?q={search_term_string}",
      },
      query: "required name=search_term_string",
    },
    description: "Digital Finance Platform - USD Accounts, Virtual Cards & Bill Payments",
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "AFRIDataNG",
    image: "https://api.remopay.remonode.com/remopay-banner.png",
    description: "Make Payment, Virtual Dollar Card and Virtual Top Up Services (Data | Airtime | Electricity | TV Subscription)",
    url: "https://remopay.vercel.com",
    telephone: "+234-810-2300935",
    priceRange: "₦",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Africa",
      addressCountry: "NG",
    },
    areaServed: {
      "@type": "Country",
      name: "Nigeria",
    },
    sameAs: [
      "https://www.facebook.com/Remopay",
      "https://www.twitter.com/Remopay",
    ],
  };

  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        {/* JSON-LD Structured Data */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          strategy="afterInteractive"
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          strategy="afterInteractive"
        />
        <Script
          id="service-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
          strategy="afterInteractive"
        />

        {/* Additional Meta Tags */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <meta name="theme-color" content="#620707" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Remopay" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#620707" />
        <meta name="msapplication-TileImage" content="/icon.png" />

        {/* Preconnect to External Sources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://analytics.google.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Google Analytics 4 with Enhanced Tracking */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-L0LS146KZG"
          strategy="afterInteractive"
          async
        />
        <Script
          id="google-analytics-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-L0LS146KZG', {
                'page_path': window.location.pathname,
                'page_title': document.title,
                'anonymize_ip': false,
                'allow_google_signals': true,
                'allow_ad_personalization_signals': true,
                'send_page_view': true,
                'cookie_flags': 'SameSite=None;Secure'
              });
              
              // Track all navigation events
              window.addEventListener('popstate', function() {
                gtag('event', 'page_view', {
                  'page_path': window.location.pathname,
                  'page_title': document.title,
                  'page_referrer': document.referrer
                });
              });
              
              // Enable enhanced measurement
              gtag('event', 'page_view', {
                'send_to': 'G-L0LS146KZG',
                'page_title': document.title,
                'page_path': window.location.pathname
              });
            `,
          }}
        />

        {/* Google Ads Conversion Tracking (placeholder - update with your conversion ID) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-YOUR_CONVERSION_ID"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
