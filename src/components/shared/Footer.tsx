'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid gap-12 md:grid-cols-5 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Remopay</h3>
              <p className="text-sm text-gray-600">Your all-in-one payment solution</p>
            </div>
            <div className="flex gap-3">
              <a href="https://facebook.com" className="text-gray-400 hover:text-red-600 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-red-600 transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-red-600 transition">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-red-600 transition">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/vtu/airtime" className="text-sm text-gray-600 hover:text-red-600 transition">
                  Airtime Top-up
                </Link>
              </li>
              <li>
                <Link href="/vtu/data" className="text-sm text-gray-600 hover:text-red-600 transition">
                  Data Bundles
                </Link>
              </li>
              <li>
                <Link href="/vtu/tv" className="text-sm text-gray-600 hover:text-red-600 transition">
                  TV Subscriptions
                </Link>
              </li>
              <li>
                <Link href="/vtu/bills" className="text-sm text-gray-600 hover:text-red-600 transition">
                  Bills Payment
                </Link>
              </li>
              <li>
                <Link href="/vtu" className="text-sm text-gray-600 hover:text-red-600 transition">
                  All Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900">Account</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/auth/login" className="text-sm text-gray-600 hover:text-red-600 transition">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-sm text-gray-600 hover:text-red-600 transition">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-red-600 transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-gray-600 hover:text-red-600 transition">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-red-600 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-600 hover:text-red-600 transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-600 hover:text-red-600 transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-gray-600 hover:text-red-600 transition">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <a href="mailto:support@remopay.com" className="text-sm text-gray-600 hover:text-red-600 transition">
                  support@remopay.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <a href="tel:+2340000000000" className="text-sm text-gray-600 hover:text-red-600 transition">
                  +234 (0) 000 0000 000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 pt-8">
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div>
              <p className="text-sm text-gray-600">
                © {currentYear} Remopay. All rights reserved.
              </p>
            </div>
            <div className="flex gap-6 justify-end">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-red-600 transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-red-600 transition">
                Terms of Service
              </Link>
              <Link href="/security" className="text-sm text-gray-600 hover:text-red-600 transition">
                Security
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
