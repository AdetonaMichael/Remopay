'use client';

import { ArrowLeft, ArrowRight, Globe, TrendingUp, Lock, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { LandingTopbar } from '@/components/LandingTopbar';
import { Footer } from '@/components/shared/Footer';

export default function MultiCurrencyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <LandingTopbar />

      {/* Header */}
      <section className="border-b border-gray-200 px-5 py-8 pt-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#d71927] mb-6"
          >
            <ArrowLeft size={18} />
            Back to Services
          </Link>
          <h1 className="text-5xl font-black tracking-tight text-gray-900">
            Multi-Currency <span className="text-[#d71927]">Accounts</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Hold, manage, and transact in multiple currencies. Send and receive money globally with
            competitive rates.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black mb-10 text-gray-900">
            Global <span className="text-[#d71927]">Currency Support</span>
          </h2>

          <div className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-4">
            {[
              {
                icon: DollarSign,
                title: 'Multiple Currencies',
                desc: 'Hold USD, EUR, GBP, and more in your wallet.',
              },
              {
                icon: TrendingUp,
                title: 'Real-time Rates',
                desc: 'Convert currencies at competitive market rates anytime.',
              },
              {
                icon: Globe,
                title: 'Global Transfers',
                desc: 'Send money internationally with low fees and fast settlement.',
              },
              {
                icon: Lock,
                title: 'Secure Storage',
                desc: 'Bank-level security for all your currency holdings.',
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex-shrink-0 w-72 md:w-auto md:flex-shrink rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-red-200 hover:shadow-sm snap-start"
                >
                  <Icon className="h-10 w-10 text-[#d71927] mb-4" />
                  <h3 className="text-lg font-black mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Currencies */}
      <section className="bg-gray-50/50 border-t border-gray-100 px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black mb-10 text-gray-900">
            Supported <span className="text-[#d71927]">Currencies</span>
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-6">
            {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN', 'JPY', 'INR', 'ZAR', 'KES', 'GHS', 'UGX'].map(
              (currency) => (
                <div
                  key={currency}
                  className="flex-shrink-0 w-28 sm:w-32 md:w-auto md:flex-shrink rounded-xl border border-gray-200 bg-white p-4 text-center transition hover:border-red-200 hover:shadow-sm snap-start"
                >
                  <p className="text-2xl font-black text-[#d71927]">{currency}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black mb-10 text-gray-900">
            Getting <span className="text-[#d71927]">Started</span>
          </h2>

          <div className="space-y-6">
            {[
              { step: 1, title: 'Verify Your Account', desc: 'Complete KYC verification for international transfers' },
              { step: 2, title: 'Add Currency Account', desc: 'Select currencies you want to hold from our list' },
              { step: 3, title: 'Fund Your Account', desc: 'Deposit funds and convert between currencies' },
              { step: 4, title: 'Send Globally', desc: 'Send and receive money internationally with ease' },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d71927] text-white font-black flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-black mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50/50 border-t border-gray-100 px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black mb-10 text-gray-900">
            Why Multi-Currency <span className="text-[#d71927]">Matters</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-black mb-4 text-gray-900">For Businesses</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-[#d71927] font-bold">•</span>
                  <span>Accept payments in multiple currencies from global customers</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#d71927] font-bold">•</span>
                  <span>Reduce foreign exchange costs and settlement time</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#d71927] font-bold">•</span>
                  <span>Manage cash flow across different regions efficiently</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-black mb-4 text-gray-900">For Individuals</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-[#d71927] font-bold">•</span>
                  <span>Lock in favorable exchange rates for future use</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#d71927] font-bold">•</span>
                  <span>Send money to family abroad with competitive rates</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#d71927] font-bold">•</span>
                  <span>Travel confidently with access to local currencies</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-black mb-6 text-gray-900">Go Global with Remopay</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Open multi-currency accounts and expand your financial possibilities worldwide.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-3 rounded-xl bg-[#d71927] px-8 py-4 text-sm font-black text-white shadow-lg shadow-[#d71927]/20 transition hover:bg-[#b91420]"
          >
            Open Your Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
