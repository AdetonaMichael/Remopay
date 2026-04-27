'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 pt-20">
      {/* Header */}
      <section className="border-b border-gray-100 px-5 py-16 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="prose-h2 text-gray-900 mb-4">
            Privacy <span className="text-[#d71927]">Policy</span>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p>
                Remopay ("we", "us", "our", or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <p className="mb-4">We collect information in several ways:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Personal Information:</strong> Name, email, phone number, date of birth, identification documents</li>
                <li><strong>Financial Information:</strong> Bank account details, card information, transaction history</li>
                <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent, actions taken, features used</li>
                <li><strong>Location Data:</strong> IP-based location information (with your consent)</li>
                <li><strong>Communication Data:</strong> Messages, support tickets, feedback you provide</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use collected information for:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Processing transactions and providing services</li>
                <li>Verifying identity and preventing fraud</li>
                <li>Complying with legal and regulatory requirements (AML/KYC)</li>
                <li>Improving and personalizing our platform</li>
                <li>Sending transactional and promotional communications</li>
                <li>Providing customer support and responding to inquiries</li>
                <li>Analyzing user behavior and platform performance</li>
                <li>Detecting and preventing unauthorized activity</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>End-to-end encryption for sensitive data transmission</li>
                <li>Secure servers with SSL/TLS certificates</li>
                <li>Regular security audits and penetration testing</li>
                <li>Two-factor authentication for account access</li>
                <li>PCI DSS compliance for payment card data</li>
                <li>Access controls limiting employee access to personal data</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
              <p className="mb-4">
                We do not sell your personal information. However, we may share data with:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Payment Processors:</strong> To process transactions securely</li>
                <li><strong>Banks and Financial Institutions:</strong> For fund transfers and account verification</li>
                <li><strong>Service Providers:</strong> For hosting, analytics, and customer support</li>
                <li><strong>Law Enforcement:</strong> When required by law or to prevent fraud</li>
                <li><strong>Regulatory Bodies:</strong> For AML/KYC compliance</li>
                <li><strong>Business Partners:</strong> With your explicit consent for co-branded services</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
              <p>
                We retain personal data only as long as necessary to provide services and comply with legal obligations. Typically, we retain:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Account information: Duration of account + 3 years after closure</li>
                <li>Transaction records: 7 years (regulatory requirement)</li>
                <li>Verification documents: Duration of account + 1 year after closure</li>
                <li>Device and usage data: 12 months from last activity</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights and Choices</h2>
              <p className="mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
                <li>Lodge complaints with regulatory authorities</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Remember your preferences</li>
                <li>Understand site usage patterns</li>
                <li>Improve user experience</li>
                <li>Prevent fraud and enhance security</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. Disabling cookies may affect platform functionality.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Links</h2>
              <p>
                Our platform may contain links to third-party websites. We are not responsible for their privacy practices. Please review their privacy policies before providing personal information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p>
                Remopay is not intended for children under 18 years old. We do not knowingly collect data from minors. If we become aware of such collection, we will delete it immediately.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfer</h2>
              <p>
                Your data may be transferred, stored, and processed in countries outside Nigeria. By using Remopay, you consent to such transfers, subject to appropriate safeguards.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Policy Updates</h2>
              <p>
                We may update this Privacy Policy periodically. Changes will be posted on our website with an updated "Last Updated" date. Your continued use of Remopay constitutes acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p>
                For privacy concerns or to exercise your rights, contact:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Email: privacy@remopay.com</li>
                <li>Data Protection Officer: dpo@remopay.com</li>
                <li>Phone: +234 (0) 700 123 4567</li>
                <li>Mailing Address: Remopay Nigeria Limited, Lagos, Nigeria</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-white px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-gray-600 mb-8">
            Your privacy is important to us. We are committed to protecting your personal information.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-3 rounded-xl bg-[#d71927] px-8 py-4 text-sm font-black text-white shadow-xl shadow-[#d71927]/30 transition hover:bg-[#b91420]"
          >
            Join Remopay Today
          </Link>
        </div>
      </section>
    </main>
  );
}
