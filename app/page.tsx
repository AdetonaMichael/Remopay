'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Gift,
  Globe,
  Headphones,
  Linkedin,
  Mail,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Tv,
  Users,
  Wallet,
  Wifi,
  Zap,
} from 'lucide-react';
import { LandingTopbar } from '@/components/LandingTopbar';

const heroSlides = [
  {
    title: 'Pay Everything.',
    highlight: 'Earn More.',
    suffix: 'Live Better.',
    desc: 'Your all-in-one payment platform for airtime, data, bills, TV subscriptions, wallet funding and more.',
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1800&q=90',
  },
  {
    title: 'Fast Bills.',
    highlight: 'Instant VTU.',
    suffix: 'Zero Stress.',
    desc: 'Buy airtime, data, electricity tokens and subscriptions from one reliable  wallet.',
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1800&q=90',
  },
  {
    title: 'Invite Friends.',
    highlight: 'Get Rewarded.',
    suffix: 'Repeat.',
    desc: 'Earn up to ₦200 when you refer verified customers who use Remopay.',
    image:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1800&q=90',
  },
];

const services = [
  {
    title: 'Airtime Recharge',
    desc: 'Recharge all major networks instantly.',
    icon: Smartphone,
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85',
    href: '/',
  },
  {
    title: 'Data Bundles',
    desc: 'Buy affordable data bundles in seconds.',
    icon: Wifi,
    image:
      'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=85',
    href: '/',
  },
  {
    title: 'Electricity Bills',
    desc: 'Pay electricity bills and get tokens instantly.',
    icon: Zap,
    image:
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=85',
    href: '/',
  },
  {
    title: 'TV Subscription',
    desc: 'Renew DSTV, GOtv, Startimes and more.',
    icon: Tv,
    image:
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=85',
    href: '/',
  },
  {
    title: 'Wallet Funding',
    desc: 'Fund your wallet securely anytime.',
    icon: Wallet,
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=85',
    href: '/',
  },
  {
    title: 'Virtual Dollar Card',
    desc: 'Create and manage virtual card instantly.',
    icon: CreditCard,
    image:
      'https://images.unsplash.com/photo-1569163139394-de4798aa62b1?auto=format&fit=crop&w=900&q=85',
    href: '/dashboard/virtual-card',
  },
  {
    title: 'Multi-Currency Accounts',
    desc: 'Hold and manage accounts in multiple currencies.',
    icon: Globe,
    image:
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf35f?auto=format&fit=crop&w=900&q=85',
    href: '/dashboard/multi-currency',
  },
];

const whyChoose = [
  {
    title: 'Lightning Fast',
    desc: 'Get your airtime, data and bills processed instantly.',
    icon: Zap,
  },
  {
    title: 'Secure & Safe',
    desc: 'Your transactions are protected and properly tracked.',
    icon: ShieldCheck,
  },
  {
    title: 'Rewards That Pay',
    desc: 'Earn cashback, bonuses and referral rewards.',
    icon: Gift,
  },
  {
    title: '24/7 Support',
    desc: 'Our support team is always here for you.',
    icon: Headphones,
  },
];

const stats = [
  { value: '50K+', label: 'Happy Users', icon: Users },
  { value: '250K+', label: 'Transactions', icon: CircleDollarSign },
  { value: '₦2B+', label: 'Total Payments', icon: Wallet },
  { value: '99.9%', label: 'Success Rate', icon: BadgeCheck },
];

export default function RemopayLandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [servicesScroll, setServicesScroll] = useState(0);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);

    return () => clearInterval(slider);
  }, []);

  const scrollServices = (direction: 'left' | 'right') => {
    if (servicesRef.current) {
      const scrollAmount = 400;
      const newScroll =
        direction === 'left'
          ? servicesScroll - scrollAmount
          : servicesScroll + scrollAmount;
      servicesRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
      setServicesScroll(newScroll);
    }
  };

  const currentHero = heroSlides[activeSlide];

  return (
    <main className="min-h-screen bg-[#100303] text-white">
      <LandingTopbar />

      <section className="relative min-h-[760px] overflow-hidden pt-20">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover object-[center_right] brightness-95 contrast-110 saturate-110"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute left-0 top-0 h-full w-[58%] bg-gradient-to-r from-black/80 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(255,60,60,0.16),transparent_58%)]" />
          </div>
        ))}

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <h1 className="max-w-3xl display-xl text-white">
              {currentHero.title}
              <br />
              <span className="text-[#ff2635]">{currentHero.highlight}</span>
              <br />
              {currentHero.suffix}
            </h1>

            <p className="mt-6 max-w-xl body-lg text-white/85">
              {currentHero.desc}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-3 rounded-xl bg-[#d71927] px-7 py-4 button-md text-white shadow-xl shadow-[#d71927]/30 transition hover:bg-[#b91420]"
              >
                Create Free Account <ArrowRight size={18} />
              </Link>

              <a
                href="#services"
                className="inline-flex items-center gap-3 rounded-xl border border-[#ff4b55]/50 bg-black/20 px-7 py-4 button-md text-white backdrop-blur transition hover:bg-white/10"
              >
                Explore Services <ArrowRight size={18} />
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ['Instant Payments', '24/7', Zap],
                ['Secure Platform', 'Bank-level Security', ShieldCheck],
                ['Rewards & Bonuses', 'Earn as you pay', Gift],
                ['Trusted by Users', 'Across Nigeria', Users],
              ].map(([title, desc, Icon]: any) => (
                <div key={title} className="border-r border-white/15 pr-4 last:border-0">
                  <Icon className="mb-3 h-7 w-7 text-white" />
                  <p className="label text-white">{title}</p>
                  <p className="mt-1 caption-xs text-white/65">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block" />

          <button
            onClick={() =>
              setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
            }
            className="absolute left-5 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur transition hover:bg-white/10 lg:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-5 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur transition hover:bg-white/10 lg:flex"
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`h-3 rounded-full transition-all ${
                  index === activeSlide ? 'w-8 bg-[#ff2635]' : 'w-3 bg-white/50'
                }`}
                aria-label={`Go to hero slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="border-t border-[#ff4b55]/20 bg-[#140404] px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header section */}
          <div className="mb-12">
            <h2 className="h2">
              Our <span className="text-[#ff2635]">Services</span>
            </h2>
            <p className="mt-5 max-w-2xl body-base text-white/70">
              Everything you need for everyday payments in one simple app.
            </p>

            <Link
              href="/auth/register"
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#d71927] px-6 py-4 button-md text-white transition hover:bg-[#b91420]"
            >
              View All Services <ArrowRight size={18} />
            </Link>
          </div>

          {/* Horizontally scrollable services */}
          <div className="relative">
            <div
              ref={servicesRef}
              className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide"
              style={{ scrollBehavior: 'smooth' }}
            >
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <div
                    key={service.title}
                    className="group flex-shrink-0 w-96 overflow-hidden rounded-2xl border border-[#ff4b55]/25 bg-[#1c0606] transition duration-300 hover:-translate-y-2 hover:border-[#ff4b55] hover:shadow-2xl hover:shadow-[#d71927]/20"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover brightness-95 contrast-110 saturate-110 transition duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#d71927] shadow-lg">
                        <Icon size={23} />
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="h5 text-[#ff2635]">
                        {service.title}
                      </h3>
                      <p className="mt-2 body-sm text-white/75">
                        {service.desc}
                      </p>

                      <button className="mt-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#d71927] transition group-hover:translate-x-1">
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <button
              onClick={() => scrollServices('left')}
              className="absolute left-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 -translate-x-6 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur transition hover:bg-white/10 lg:flex"
              aria-label="Scroll services left"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={() => scrollServices('right')}
              className="absolute right-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 translate-x-6 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur transition hover:bg-white/10 lg:flex"
              aria-label="Scroll services right"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </section>

      <section id="security" className="bg-[#100303] px-5 py-14 lg:px-8">
        <div className="mx-auto max-w-7xl border-t border-[#ff4b55]/20 pt-14">
          <div className="text-center">
            <h2 className="h2">
              Why Choose <span className="text-[#ff2635]">Remopay?</span>
            </h2>
            <p className="mt-3 body-base text-white/65">
              We make payments simple, fast and rewarding.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {whyChoose.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#ff4b55]/25 bg-gradient-to-br from-[#230707] to-[#120303] p-7"
                >
                  <Icon className="mb-6 h-10 w-10 text-[#ff737b]" />
                  <h3 className="h5 font-semibold">{item.title}</h3>
                  <p className="mt-3 body-sm text-white/65">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="rewards" className="bg-[#100303] px-5 pb-14 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-[#ff4b55]/25 bg-gradient-to-r from-[#b91420] via-[#7f0f17] to-[#220606] p-8 shadow-2xl shadow-[#d71927]/20 lg:p-12">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1fr_0.8fr]">
            <div>
              <h2 className="h2">
                Invite. Earn. Repeat.
              </h2>
              <p className="mt-4 max-w-md body-base leading-relaxed text-white/80">
                Refer your friends and earn up to ₦200 per verified referral.
              </p>

              <Link
                href="/auth/register"
                className="mt-7 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-4 button-md text-[#9b111e] transition hover:bg-white/90"
              >
                Start Referring <ArrowRight size={18} />
              </Link>
            </div>

            <div className="relative flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=85"
                alt="Referral rewards"
                className="h-60 w-full rounded-3xl object-cover brightness-95 contrast-110 saturate-110 shadow-2xl"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              <Gift className="absolute bottom-6 right-6 h-16 w-16 text-white drop-shadow-lg" />
            </div>

            <div className="rounded-2xl border border-white/20 bg-black/20 p-7 backdrop-blur">
              <p className="caption-sm text-white/70 font-semibold">Your Reward Wallet</p>
              <h3 className="mt-4 display-md text-[#ff737b]">₦200</h3>
              <p className="mt-2 body-sm text-white/60">Available Balance</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#100303] px-5 pb-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 rounded-3xl border border-[#ff4b55]/25 bg-[#180505] p-6 md:grid-cols-4 lg:p-8">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className="flex items-center gap-5 border-white/10 md:border-r md:last:border-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#ff4b55]/50">
                  <Icon className="h-7 w-7 text-[#ff737b]" />
                </div>
                <div>
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-label">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      <section
  id="download-app"
  className="relative overflow-hidden bg-[#100303] px-5 pb-24 pt-10 lg:px-8"
>
  <div className="absolute left-0 top-20 h-80 w-80 rounded-full bg-[#d71927]/20 blur-3xl" />
  <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[#ff737b]/10 blur-3xl" />

  <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 rounded-[2rem] border border-[#ff4b55]/25 bg-gradient-to-br from-[#220606] via-[#140404] to-[#090101] p-6 shadow-2xl shadow-[#d71927]/10 lg:grid-cols-[1fr_0.9fr] lg:p-12">
    <div>
     

      <h2 className="max-w-xl display-lg text-white">
        Everything you need,
        <br />
        <span className="text-[#ff2635]">right in your pocket.</span>
      </h2>

      <p className="mt-5 max-w-xl body-lg text-white/70">
        Download the Remopay mobile app to buy airtime, data, pay bills, fund
        your wallet, track transactions, and earn rewards anytime.
      </p>

      <div className="mt-8 w-fit">
        <div className="flex items-center gap-4 mb-4">
          <a
            href="#"
            className="inline-flex items-center gap-3 rounded-xl border border-white/15 bg-black px-6 py-3.5 text-white transition hover:bg-white/10"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Get it on Google Play"
              className="h-10 w-auto"
            />
          </a>

          <a
            href="#"
            className="inline-flex items-center gap-3 rounded-xl border border-white/15 bg-black px-6 py-3.5 text-white transition hover:bg-white/10"
          >
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="Download on the App Store"
              className="h-10 w-auto"
            />
          </a>
        </div>
        <a
          href="/"
          download
          className="flex items-center justify-center gap-3 rounded-xl bg-[#d71927] px-6 py-4 button-md text-white shadow-xl shadow-[#d71927]/25 transition hover:bg-[#b91420] w-full"
        >
          Direct Download
          <ArrowRight size={18} />
        </a>
      </div>
       

    </div>

    <div className="relative flex justify-center lg:justify-end">
      <div className="absolute top-10 h-72 w-72 rounded-full bg-[#d71927]/30 blur-3xl" />

      {/* Phone mockup frame */}
      <div className="relative">
        {/* Outer phone body */}
        <div className="relative h-[680px] w-[340px] rounded-[3rem] bg-gradient-to-br from-gray-900 via-black to-gray-950 p-3 shadow-2xl shadow-black/80">
          {/* Phone bezel/frame */}
          <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-black">
            {/* Notch */}
            <div className="absolute left-1/2 top-0 z-30 h-7 w-40 -translate-x-1/2 rounded-b-3xl bg-black shadow-lg" />
            
            {/* Screen */}
            <div className="relative h-full w-full overflow-hidden bg-black">
              <img
                src="/remopay5.png"
                alt="Remopay mobile app preview"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Screen reflection effect */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/10 via-transparent to-transparent" />

            {/* Home indicator area */}
            <div className="absolute bottom-2 left-1/2 z-30 h-1 w-32 -translate-x-1/2 rounded-full bg-white/20" />
          </div>

          {/* Phone side details */}
          <div className="absolute left-0 top-32 z-20 h-12 w-1 rounded-r-lg bg-gray-700/60" />
          <div className="absolute right-0 top-48 z-20 h-16 w-1 rounded-l-lg bg-gray-700/60" />
          <div className="absolute right-0 top-80 z-20 h-16 w-1 rounded-l-lg bg-gray-700/60" />
        </div>

        {/* Floating stat cards */}
        <div className="absolute -left-10 top-32 hidden rounded-2xl border border-[#ff4b55]/30 bg-[#180505]/90 p-4 shadow-xl backdrop-blur md:block">
          <p className="caption-xs text-white/50 font-semibold">Wallet Balance</p>
          <p className="mt-1 h4 text-white">₦25,680.50</p>
        </div>

        <div className="absolute -right-10 bottom-32 hidden rounded-2xl border border-[#ff4b55]/30 bg-[#180505]/90 p-4 shadow-xl backdrop-blur md:block">
          <p className="caption-xs text-white/50 font-semibold">Reward Wallet</p>
          <p className="mt-1 h4 text-[#ff737b]">₦200</p>
        </div>
      </div>
    </div>
  </div>
</section>

      <footer id="about" className="border-t border-[#ff4b55]/20 bg-[#140404] px-5 py-12 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Image src="/icon.png" alt="Remopay Logo" width={44} height={44} />
              <span className="h5 font-bold">Remopay</span>
            </div>
            <p className="mt-5 max-w-sm body-sm text-white/65">
              Pay smarter, live better with fast, secure and reliable payments.
            </p>
          </div>

          {[
            ['Company', [['About Us', '/about'], ['Careers', '/about'], ['Blog', '/'], ['Contact Us', '/support']]],
            ['Help', [['FAQs', '/faq'], ['Support Center', '/support'], ['Terms of Service', '/terms'], ['Privacy Policy', '/privacy']]],
            ['Services', [['Airtime', '/'], ['Data', '/'], ['Electricity', '/'], ['TV Subscription', '/'], ['More Services', '/']]],
          ].map(([title, links]: any) => (
            <div key={title}>
              <h3 className="mb-4 h6 font-semibold">{title}</h3>
              <ul className="space-y-3">
                {links.map((item: any) => (
                  <li key={item[0]}>
                    <Link href={item[1]} className="body-sm text-white/60 hover:text-[#ff737b]">{item[0]}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-4 h6 font-semibold">Follow Us</h3>
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/products/remonode-remopay/"
                target="_blank"
                rel="noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 hover:bg-white/10"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="mailto:support@remopay.com"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 hover:bg-white/10"
              >
                <Mail size={18} />
              </a>
            </div>

            <p className="mt-6 caption-sm text-white/50">
              © 2026 Remopay. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}