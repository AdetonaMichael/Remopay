'use client';

import { ArrowLeft, ArrowRight, CreditCard, Shield, Zap, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function VirtualCardPage() {
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
            Virtual <span className="text-[#ff2635]">Dollar Card</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">
            Create and manage virtual cards instantly. Pay online securely without exposing your real card details.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black mb-10">
            Why Choose <span className="text-[#ff2635]">Virtual Cards?</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: 'Instant Creation',
                desc: 'Generate virtual cards in seconds, ready to use immediately.',
              },
              {
                icon: Shield,
                title: 'Enhanced Security',
                desc: 'Protect your real card details with disposable virtual cards.',
              },
              {
                icon: Wallet,
                title: 'Full Control',
                desc: 'Set spending limits, expiry dates, and manage transactions easily.',
              },
              {
                icon: CreditCard,
                title: 'Multi-Use',
                desc: 'Create multiple cards for different purposes and merchants.',
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

      {/* How it works */}
      <section className="bg-[#140404] px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black mb-10">
            How It <span className="text-[#ff2635]">Works</span>
          </h2>

          <div className="space-y-6">
            {[
              { step: 1, title: 'Fund Your Wallet', desc: 'Add money to your Remopay wallet' },
              { step: 2, title: 'Create Card', desc: 'Click "Create Virtual Card" and set your preferences' },
              { step: 3, title: 'Use Instantly', desc: 'Get card details immediately and start shopping' },
              { step: 4, title: 'Manage & Monitor', desc: 'Track transactions and manage your cards anytime' },
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

      {/* CTA */}
      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-black mb-6">Ready to Create Your Virtual Card?</h2>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are securing their online transactions with Remopay Virtual Cards.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-3 rounded-xl bg-[#d71927] px-8 py-4 text-sm font-black text-white shadow-xl shadow-[#d71927]/30 transition hover:bg-[#b91420]"
          >
            Get Started Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
