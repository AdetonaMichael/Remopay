'use client';

import { ArrowLeft, ArrowRight, Globe, TrendingUp, Lock, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function MultiCurrencyPage() {
  return (
    <main className="min-h-screen bg-[#100303] text-white pt-20">
      {/* Header */}
      <section className="border-b border-[#ff4b55]/20 px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-[#ff4b55] mb-6"
          >
            <ArrowLeft size={18} />
            Back to Services
          </Link>
          <h1 className="text-5xl font-black tracking-tight">
            Multi-Currency <span className="text-[#ff2635]">Accounts</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">
            Hold, manage, and transact in multiple currencies. Send and receive money globally with competitive rates.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black mb-10">
            Global <span className="text-[#ff2635]">Currency Support</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className="rounded-2xl border border-[#ff4b55]/25 bg-gradient-to-br from-[#230707] to-[#120303] p-6"
                >
                  <Icon className="h-10 w-10 text-[#ff737b] mb-4" />
                  <h3 className="text-lg font-black mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/70">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Currencies */}
      <section className="bg-[#140404] px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black mb-10">
            Supported <span className="text-[#ff2635]">Currencies</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN', 'JPY', 'INR', 'ZAR', 'KES', 'GHS', 'UGX'].map(
              (currency) => (
                <div
                  key={currency}
                  className="rounded-xl border border-[#ff4b55]/25 bg-[#1c0606] p-4 text-center hover:border-[#ff4b55] transition"
                >
                  <p className="text-2xl font-black text-[#ff737b]">{currency}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black mb-10">
            Getting <span className="text-[#ff2635]">Started</span>
          </h2>

          <div className="space-y-6">
            {[
              { step: 1, title: 'Verify Your Account', desc: 'Complete KYC verification for international transfers' },
              { step: 2, title: 'Add Currency Account', desc: 'Select currencies you want to hold from our list' },
              { step: 3, title: 'Fund Your Account', desc: 'Deposit funds and convert between currencies' },
              { step: 4, title: 'Send Globally', desc: 'Send and receive money internationally with ease' },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d71927] font-black flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-black mb-2">{item.title}</h3>
                  <p className="text-white/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#140404] px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black mb-10">
            Why Multi-Currency <span className="text-[#ff2635]">Matters</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-black mb-4">For Businesses</h3>
              <ul className="space-y-3 text-white/70">
                <li className="flex gap-3">
                  <span className="text-[#ff737b]">•</span>
                  <span>Accept payments in multiple currencies from global customers</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ff737b]">•</span>
                  <span>Reduce foreign exchange costs and settlement time</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ff737b]">•</span>
                  <span>Manage cash flow across different regions efficiently</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-black mb-4">For Individuals</h3>
              <ul className="space-y-3 text-white/70">
                <li className="flex gap-3">
                  <span className="text-[#ff737b]">•</span>
                  <span>Lock in favorable exchange rates for future use</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ff737b]">•</span>
                  <span>Send money to family abroad with competitive rates</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ff737b]">•</span>
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
          <h2 className="text-3xl font-black mb-6">Go Global with Remopay</h2>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Open multi-currency accounts and expand your financial possibilities worldwide.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-3 rounded-xl bg-[#d71927] px-8 py-4 text-sm font-black text-white shadow-xl shadow-[#d71927]/30 transition hover:bg-[#b91420]"
          >
            Open Your Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
