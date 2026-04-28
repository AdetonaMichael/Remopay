import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Remopay - Your all-in-one payment solution",
  description: "Make Payment, Virtual Dollar Card and Virtual Top Up Services (Data | Airtime | Electricity | TV Subscription)",
  keywords: "airtime, data bundles, bills payment, top-up, VTU, telecom, Africa, Nigeria, MTN, Airtel, Glo, 9mobile, Virtual, Dollar Card, Dollar",
  authors: [{ name: "Remopay" }],
  creator: "Remopay",
  publisher: "Remopay",
  robots: "index, follow",
  metadataBase: new URL("https://remopay.vercel.app"),
  alternates: {
    canonical: "https://remopay.vercel.app",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
      {
        url: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    apple: {
      url: "/icon.png",
      sizes: "180x180",
      type: "image/png",
    },
    shortcut: "/icon.png",
  },
  openGraph: {
    type: "website",
    url: "https://remopay.vercel.app",
    title: "Remopay - Your all-in-one payment solution",
    description: "Make Payment, Virtual Dollar Card and Virtual Top Up Services (Data | Airtime | Electricity | TV Subscription)",
    siteName: "Remopay",
    images: [
      {
        url: "/remopay-banner.png",
        width: 1200,
        height: 630,
        alt: "Remopay - Your all-in-one payment solution",
        type: "image/png",
      },
      {
        url: "/remopay-banner.png",
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
    images: ["/remopay-banner.png"],
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
    url: "https://remopay.vercel.app",
    logo: "https://api.remopay.remonode.com/icon.png",
    description: "Make Payment, Virtual Dollar Card and Virtual Top Up Services (Data | Airtime | Electricity | TV Subscription)",
    sameAs: [
      "https://www.facebook.com/Remopay",
      "https://www.twitter.com/Remopay",
      "https://www.instagram.com/Remopay",
      "https://www.linkedin.com/company/remonode",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@remonode.com",
      availableLanguage: ["en"],
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Remopay",
    url: "https://remopay.vercel.app",
    description: "Make Payment, Virtual Dollar Card and Virtual Top Up Services (Data | Airtime | Electricity | TV Subscription)",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://afridatawebv3.com/search?q={search_term_string}",
      },
      query_input: "required name=search_term_string",
    },
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
      </head>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
