'use client';

import { ChevronDown, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I create a Remopay account?',
        a: 'To create a Remopay account, visit our website or download the app, click on "Create Account", and fill in your details. You\'ll need to verify your email and phone number before you can start using the platform.',
      },
      {
        q: 'What documents do I need to verify my account?',
        a: 'You\'ll need a valid government-issued ID (National ID, Driver\'s License, or Passport) and a recent utility bill or bank statement for address verification. The verification process typically takes 5-15 minutes.',
      },
      {
        q: 'Is there a minimum age requirement?',
        a: 'Yes, you must be at least 18 years old to create and use a Remopay account. We require this for regulatory compliance and customer protection.',
      },
    ],
  },
  {
    category: 'Transactions & Payments',
    questions: [
      {
        q: 'What payment methods can I use?',
        a: 'You can fund your Remopay wallet using bank transfers, debit cards, credit cards, and mobile money. All transactions are secured with bank-level encryption.',
      },
      {
        q: 'How long does it take to process a transaction?',
        a: 'Most transactions are processed instantly. Bank transfers may take 24-48 hours depending on your bank. You\'ll receive a notification once the transaction is complete.',
      },
      {
        q: 'Is there a transaction limit?',
        a: 'Yes, transaction limits depend on your account verification level. Unverified accounts have lower limits. Fully verified users can transact up to ₦5,000,000 per day.',
      },
      {
        q: 'Can I cancel a transaction?',
        a: 'If the transaction hasn\'t been processed, you can cancel it within a few minutes. Once processed, you\'ll need to contact our support team to request a refund.',
      },
    ],
  },
  {
    category: 'Virtual Cards',
    questions: [
      {
        q: 'What is a Virtual Dollar Card?',
        a: 'A Virtual Dollar Card is a digital card generated instantly for secure online shopping. It\'s not a physical card but works like a regular card for online purchases.',
      },
      {
        q: 'Can I set spending limits on my virtual card?',
        a: 'Yes, when creating a virtual card, you can set a maximum spending limit, expiry date, and restrict it to specific merchants for added security.',
      },
      {
        q: 'What happens if my virtual card is compromised?',
        a: 'Virtual cards are disposable. You can deactivate a compromised card instantly and create a new one. Your main wallet balance remains protected.',
      },
      {
        q: 'How many virtual cards can I create?',
        a: 'You can create multiple virtual cards. There\'s no limit to the number of cards you can have, giving you maximum flexibility and security.',
      },
    ],
  },
  {
    category: 'Multi-Currency Accounts',
    questions: [
      {
        q: 'Which currencies can I hold?',
        a: 'We support USD, EUR, GBP, CAD, AUD, NGN, JPY, INR, ZAR, KES, GHS, and UGX. More currencies are being added regularly.',
      },
      {
        q: 'How do I convert between currencies?',
        a: 'You can convert currencies directly from your wallet dashboard. We offer competitive market rates with minimal conversion fees.',
      },
      {
        q: 'Can I receive international transfers?',
        a: 'Yes, fully verified users can receive international transfers. You\'ll get a bank account number or details for the currency you\'re receiving in.',
      },
      {
        q: 'What are the fees for international transfers?',
        a: 'Fees vary by destination country and amount. Typically, they range from 1-2% of the transfer amount. You\'ll see the exact fee before confirming any transfer.',
      },
    ],
  },
  {
    category: 'Rewards & Referrals',
    questions: [
      {
        q: 'How do I earn referral rewards?',
        a: 'Share your unique referral link with friends. When they sign up and complete their first transaction, you\'ll earn up to ₦200 per referral. There\'s no limit to how much you can earn.',
      },
      {
        q: 'How are referral rewards paid?',
        a: 'Referral rewards are automatically credited to your reward wallet. You can withdraw them to your main wallet or use them for future transactions.',
      },
      {
        q: 'Can I track my referral bonuses?',
        a: 'Yes, you can view all your referrals and earnings in the Referrals section of your dashboard. You\'ll see real-time updates on your reward balance.',
      },
      {
        q: 'Do I get cashback on purchases?',
        a: 'Yes, we offer cashback on selected transactions. Airtime, data, and bill payments often come with cashback rewards. Check your dashboard for current offers.',
      },
    ],
  },
  {
    category: 'Security & Privacy',
    questions: [
      {
        q: 'How is my data protected?',
        a: 'We use military-grade encryption and follow international security standards. Your data is stored securely on our servers and never shared with third parties without your consent.',
      },
      {
        q: 'What is two-factor authentication (2FA)?',
        a: '2FA is an extra security layer that requires a second verification (usually a code sent to your phone) when logging in. We strongly recommend enabling it for added protection.',
      },
      {
        q: 'What should I do if I suspect fraud?',
        a: 'Contact our support team immediately. We monitor all transactions for suspicious activity and will investigate any fraud claims. Your account will be protected while we investigate.',
      },
      {
        q: 'Do you store my card details?',
        a: 'No, we never store full card details. Card information is processed through secure payment gateways and deleted after verification.',
      },
    ],
  },
];

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.a.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <section className="border-b border-gray-100 px-5 py-16 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="prose-h1 text-gray-900 mb-4">
            Frequently Asked <span className="text-[#d71927]">Questions</span>
          </h1>
          <p className="prose-p text-gray-600">
            Find answers to common questions about Remopay and how to get the most out of our platform.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="border-b border-gray-100 px-5 py-8 lg:px-8 bg-gray-50/50">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-[#d71927]/20"
            />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="px-5 py-20 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl space-y-12">
          {filteredFaqs.map((category) => (
            <div key={category.category}>
              <h2 className="prose-h3 text-[#d71927] mb-8 pb-4 border-b border-gray-200">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((item, idx) => {
                  const id = `${category.category}-${idx}`;
                  const isExpanded = expandedId === id;

                  return (
                    <div
                      key={id}
                      className="overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition"
                    >
                      <button
                        onClick={() => toggleExpand(id)}
                        className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-gray-50"
                      >
                        <span className="font-semibold text-gray-900 text-base">{item.q}</span>
                        <ChevronDown
                          size={20}
                          className={`flex-shrink-0 text-[#d71927] transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50 text-gray-700 text-sm leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
              <p className="text-gray-600">No FAQs found matching your search. Try different keywords.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200 px-5 py-16 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-black mb-4 text-gray-900">Can't find what you're looking for?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help. Reach out to us anytime.
          </p>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 rounded-xl bg-[#d71927] px-6 py-3 text-sm font-black text-white transition hover:bg-[#b91420]"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </main>
  );
}
