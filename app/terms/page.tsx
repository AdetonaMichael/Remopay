'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 pt-20">
      {/* Header */}
      <section className="border-b border-gray-100 px-5 py-16 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="prose-h2 text-gray-900 mb-4">
            Terms of <span className="text-[#d71927]">Service</span>
          </h1>
          <p className="text-sm text-gray-500">
            Last updated: April 27, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-5 py-20 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-12 text-gray-700 leading-relaxed">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the Remopay platform (website, mobile app, and services), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>You must be at least 18 years old to use Remopay</li>
                <li>You must provide accurate, current, and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must comply with all applicable laws and regulations in your jurisdiction</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
              <p className="mb-4">As a user of Remopay, you agree to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Use the platform only for legitimate and lawful purposes</li>
                <li>Not engage in any fraudulent, deceptive, or illegal activities</li>
                <li>Protect your login credentials and notify us immediately of any unauthorized access</li>
                <li>Not attempt to circumvent security measures or access unauthorized data</li>
                <li>Not use the platform to fund illegal activities or money laundering</li>
                <li>Comply with all anti-money laundering (AML) and know-your-customer (KYC) requirements</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Services Description</h2>
              <p>
                Remopay provides payment services including but not limited to airtime purchase, data bundles, bill payments, wallet funding, virtual cards, and multi-currency accounts. We strive to maintain 24/7 service availability, but we are not liable for any downtime or service interruptions.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Fees and Charges</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Remopay may charge fees for various services as disclosed on our platform</li>
                <li>Fees are subject to change with 7 days' notice</li>
                <li>You are responsible for any fees charged by your bank or payment provider</li>
                <li>All fees are clearly displayed before you confirm any transaction</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Transaction Limits</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Daily transaction limits vary based on account verification level</li>
                <li>Unverified accounts: ₦100,000 per day</li>
                <li>Partially verified accounts: ₦500,000 per day</li>
                <li>Fully verified accounts: ₦5,000,000 per day</li>
                <li>Limits may change at Remopay's discretion</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Dispute Resolution</h2>
              <p className="mb-4">
                In the event of a dispute, users agree to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Contact Remopay support within 30 days of the disputed transaction</li>
                <li>Provide all necessary documentation to support the dispute</li>
                <li>Cooperate fully with the investigation process</li>
                <li>Accept Remopay's determination after a thorough investigation</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Remopay shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, including loss of data, business interruption, or loss of profits.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Remopay, its officers, directors, employees, and agents from any claims, damages, losses, and expenses arising from your violation of these Terms of Service or your use of the platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Account Suspension or Termination</h2>
              <p className="mb-4">
                Remopay reserves the right to suspend or terminate your account if:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>You violate these Terms of Service</li>
                <li>We detect fraudulent or suspicious activity</li>
                <li>You engage in illegal activities</li>
                <li>You fail to comply with AML/KYC requirements</li>
                <li>You provide false or misleading information</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modifications to Terms</h2>
              <p>
                Remopay reserves the right to modify these Terms of Service at any time. Changes will be effective upon posting to our website. Your continued use of the platform constitutes acceptance of the modified terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
              <p>
                These Terms of Service are governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p>
                For any questions about these Terms of Service, please contact us at:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Email: legal@remopay.com</li>
                <li>Phone: +234 (0) 700 123 4567</li>
                <li>Support Portal: support.remopay.com</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-white px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-gray-600 mb-8">
            By using Remopay, you acknowledge that you have read and understood these Terms of Service.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-3 rounded-xl bg-[#d71927] px-8 py-4 text-sm font-black text-white shadow-xl shadow-[#d71927]/30 transition hover:bg-[#b91420]"
          >
            Create Account
          </Link>
        </div>
      </section>
    </main>
  );
}
