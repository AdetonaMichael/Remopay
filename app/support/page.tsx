'use client';

import { Mail, MessageSquare, Phone, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
    alert('Thank you for reaching out. We\'ll respond shortly.');
    setFormData({ name: '', email: '', category: 'general', subject: '', message: '' });
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <section className="border-b border-gray-100 px-5 py-16 lg:px-8 bg-white">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="prose-h1 text-gray-900 mb-4">
            We're Here to <span className="text-[#d71927]">Help</span>
          </h1>
          <p className="prose-p text-gray-600">
            Get support, report issues, or send us feedback. Our team is available 24/7.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="px-5 py-20 lg:px-8 bg-gray-50/50">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Mail,
                title: 'Email',
                desc: 'support@remopay.com',
                time: 'Typically responds within 2 hours',
              },
              {
                icon: MessageSquare,
                title: 'Live Chat',
                desc: 'Available in app',
                time: 'Response time: < 5 minutes',
              },
              {
                icon: Phone,
                title: 'Phone',
                desc: '+234 (0) 700 123 4567',
                time: 'Mon-Sun: 9AM - 10PM WAT',
              },
              {
                icon: Clock,
                title: 'Hours',
                desc: 'Available 24/7',
                time: 'Dedicated holiday support',
              },
            ].map((method, idx) => {
              const Icon = method.icon;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-sm transition"
                >
                  <Icon className="h-8 w-8 text-[#d71927] mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
                  <p className="text-sm text-gray-700 font-medium mb-1">{method.desc}</p>
                  <p className="text-xs text-gray-500">{method.time}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Support Form */}
      <section className="px-5 py-20 lg:px-8 bg-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="prose-h3 text-gray-900 mb-12">Send us a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-[#d71927]/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-[#d71927]/20 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-[#d71927]/20 text-sm"
              >
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing Issue</option>
                <option value="account">Account Support</option>
                <option value="fraud">Fraud Report</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief subject"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-[#d71927]/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your issue..."
                rows={5}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-[#d71927]/20 resize-none text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#d71927] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b91420]"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-[#d71927]/20 bg-gradient-to-r from-[#d71927] to-[#a0101a] p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-black mb-4 text-white">
                  Quick Answers to Common Questions
                </h2>
                <p className="text-white/90 mb-6">
                  Check our comprehensive FAQ section for instant answers to frequently asked questions about Remopay.
                </p>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3 text-sm font-black text-[#9b111e] transition hover:bg-white/90"
                >
                  Visit FAQs <ArrowRight size={18} />
                </Link>
              </div>

              <div className="space-y-4">
                <Link
                  href="/faq"
                  className="block rounded-xl border border-white/20 bg-black/20 p-4 hover:bg-white/10 transition"
                >
                  <p className="font-black text-white">How do I create an account?</p>
                  <p className="text-xs text-white/70 mt-1">Getting Started</p>
                </Link>
                <Link
                  href="/faq"
                  className="block rounded-xl border border-white/20 bg-black/20 p-4 hover:bg-white/10 transition"
                >
                  <p className="font-black text-white">What payment methods are available?</p>
                  <p className="text-xs text-white/70 mt-1">Transactions & Payments</p>
                </Link>
                <Link
                  href="/faq"
                  className="block rounded-xl border border-white/20 bg-black/20 p-4 hover:bg-white/10 transition"
                >
                  <p className="font-black text-white">How do I earn referral rewards?</p>
                  <p className="text-xs text-white/70 mt-1">Rewards & Referrals</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
