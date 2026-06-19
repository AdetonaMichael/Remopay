import { Metadata } from 'next';
import { Smartphone, Wifi, Tv, Receipt, TrendingUp, Shield } from 'lucide-react';
import { HeroSection } from '@/components/vtu-public/HeroSection';
import { ServiceCard } from '@/components/vtu-public/ServiceCard';
import { Footer } from '@/components/shared/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'VTU Services | Airtime, Data, TV & Bills - Remopay',
  description: 'Fast and reliable VTU services on Remopay. Buy airtime, data bundles, TV subscriptions, and pay bills with ease. Instant delivery and best rates.',
  keywords: 'VTU, airtime, data bundles, TV subscription, bills payment, MTN, Airtel, Glo, 9mobile, DStv, GOtv',
};

export default function VtuPage() {
  const services = [
    {
      title: 'Airtime Top-up',
      subtitle: 'Buy Airtime',
      description: 'Instant airtime for all major networks',
      icon: Smartphone,
      href: '/vtu/airtime',
      features: [
        'All networks supported',
        'Instant delivery',
        'Competitive rates',
        ' 24/7 availability',
      ],
      color: 'red' as const,
    },
    {
      title: 'Data Bundles',
      subtitle: 'Get Data',
      description: 'Fast data for browsing, streaming & gaming',
      icon: Wifi,
      href: '/vtu/data',
      features: [
        'All network providers',
        'Various plan sizes',
        'Auto-renewal options',
        'Best prices',
      ],
      color: 'blue' as const,
    },
    {
      title: 'TV Subscriptions',
      subtitle: 'Watch TV',
      description: 'Premium TV channels - DStv, GOtv, Startimes',
      icon: Tv,
      href: '/vtu/tv',
      features: [
        'All providers available',
        'All subscription tiers',
        'Easy renewal',
        'Quick activation',
      ],
      color: 'red' as const,
    },
    {
      title: 'Bills Payment',
      subtitle: 'Pay Bills',
      description: 'Pay electricity, water & other bills online',
      icon: Receipt,
      href: '/vtu/bills',
      features: [
        'All providers supported',
        'Secure payments',
        'Receipt generation',
        'Payment history',
      ],
      color: 'blue' as const,
    },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Best Rates',
      description: 'Competitive pricing with the best rates in the market',
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Bank-level security for all your transactions',
    },
    {
      icon: Smartphone,
      title: 'Easy to Use',
      description: 'Simple, intuitive interface for quick transactions',
    },
  ];

  return (
    <main className="bg-white">
      {/* Hero */}
      <HeroSection
        title="Digital Payment Made Easy"
        subtitle="Fast, Reliable VTU Services"
        description="Top up airtime, buy data bundles, subscribe to TV, and pay bills - all in one place. With Remopay, your payments are quick, secure, and affordable."
        ctaText="Get Started"
        ctaHref="/auth/register"
      />

      {/* Services Grid */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            All Your Payment Needs
          </h2>
          <p className="text-lg text-gray-600">
            Choose from our wide range of services and complete your transactions instantly
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard
              key={service.href}
              title={service.title}
              description={service.description}
              icon={service.icon}
              href={service.href}
              features={service.features}
              color={service.color}
            />
          ))}
        </div>
      </section>

      {/* Why Choose Remopay */}
      <section className="border-t border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose Remopay?
            </h2>
            <p className="text-lg text-gray-600">
              The best digital payment platform in Nigeria
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-xl bg-white p-8 text-center shadow-sm">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-lg bg-red-50 p-3">
                      <Icon className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
            Ready to Make Your First Payment?
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Join thousands of satisfied users and start enjoying seamless digital payments today.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-8 py-3 font-semibold text-white transition-all hover:bg-red-700 hover:shadow-lg shadow-red-600/30"
            >
              Create Account
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 px-8 py-3 font-semibold text-gray-900 transition-all hover:border-red-600 hover:text-red-600"
            >
              Already a Member? Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
