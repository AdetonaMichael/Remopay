'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Code2,
  BarChart3,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Users,
  Lightbulb,
  Rocket,
  Heart,
  Coffee,
  Laptop,
  Globe,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { LandingTopbar } from '@/components/LandingTopbar';
import { Footer } from '@/components/shared/Footer';

const heroSlides = [
  {
    title: 'Launch Your',
    highlight: 'Career',
    suffix: 'in Fintech',
    desc: "Join Africa's fastest-growing digital finance platform and build the future of payments. Learn, grow, and make an impact from day one.",
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=90',
  },
  {
    title: 'Learn, Grow,',
    highlight: 'Make an Impact',
    suffix: 'From Day One',
    desc: 'Work on live projects that impact thousands of users. Ship code, run campaigns, and close deals that move the needle.',
    image:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1800&q=90',
  },
  {
    title: 'Your Future',
    highlight: 'Starts Here',
    suffix: 'at Remopay',
    desc: "We're looking for talented, passionate interns to help us build the future of payments across Africa.",
    image:
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1800&q=90',
  },
];

const openPositions = [
  {
    id: 'frontend-intern',
    icon: Code2,
    title: 'Frontend Engineering Intern',
    type: 'Internship',
    location: 'Lagos (Remote/Hybrid)',
    department: 'Engineering',
    description:
      'Build and maintain beautiful, responsive user interfaces using React, Next.js, and Tailwind CSS. Collaborate with designers and backend engineers to deliver seamless user experiences.',
    requirements: [
      'Familiarity with React, Next.js, or similar frameworks',
      'Basic understanding of HTML, CSS, and JavaScript/TypeScript',
      'Knowledge of responsive design principles',
      'A portfolio or GitHub profile showing your work',
      'Eagerness to learn and take ownership',
    ],
  },
  {
    id: 'backend-intern',
    icon: Code2,
    title: 'Backend Engineering Intern',
    type: 'Internship',
    location: 'Lagos (Remote/Hybrid)',
    department: 'Engineering',
    description:
      'Design, build, and maintain scalable APIs and microservices powering our platform. Work with Node.js, databases, and cloud infrastructure to solve real-world fintech challenges.',
    requirements: [
      'Basic knowledge of Node.js, Python, or Go',
      'Understanding of RESTful APIs and database concepts',
      'Familiarity with version control (Git)',
      'Strong problem-solving and analytical skills',
      'Interest in fintech and payment systems',
    ],
  },
  {
    id: 'marketing-intern',
    icon: BarChart3,
    title: 'Marketing Intern',
    type: 'Internship',
    location: 'Lagos (Remote/Hybrid)',
    department: 'Growth & Marketing',
    description:
      'Support our marketing team in executing campaigns that drive brand awareness and user acquisition. Create content, manage social media, and analyze campaign performance.',
    requirements: [
      'Strong written and verbal communication skills',
      'Familiarity with social media platforms and trends',
      'Basic knowledge of SEO and content marketing',
      'Creative thinking and attention to detail',
      'Passion for fintech and digital products',
    ],
  },
  {
    id: 'sales-intern',
    icon: Briefcase,
    title: 'Sales Intern',
    type: 'Internship',
    location: 'Lagos (On-site/Hybrid)',
    department: 'Sales & Partnerships',
    description:
      'Learn the ropes of B2B and B2C sales in a fast-growing fintech. Assist in lead generation, client outreach, relationship management, and sales reporting.',
    requirements: [
      'Excellent interpersonal and communication skills',
      'Self-motivated with a results-driven mindset',
      'Basic understanding of CRM tools is a plus',
      'Ability to work in a fast-paced environment',
      'Interest in fintech and business development',
    ],
  },
];

const perks = [
  {
    icon: Laptop,
    title: 'Remote-Friendly',
    description: 'Work from anywhere in Nigeria with flexible hours that fit your schedule.',
  },
  {
    icon: GraduationCap,
    title: 'Mentorship & Learning',
    description:
      'Get paired with experienced mentors who will guide your growth and help you build real-world skills.',
  },
  {
    icon: Rocket,
    title: 'Hands-On Experience',
    description:
      'Work on live projects that impact thousands of users. Ship code, run campaigns, and close deals from day one.',
  },
  {
    icon: Coffee,
    title: 'Team Culture',
    description:
      'Join a vibrant, inclusive team that values collaboration, innovation, and having fun while building.',
  },
  {
    icon: Heart,
    title: 'Health & Wellbeing',
    description: 'Access to health insurance coverage and wellness programs during your internship.',
  },
  {
    icon: Globe,
    title: 'Networking',
    description:
      'Connect with industry leaders, attend events, and build a network that lasts beyond your internship.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Submit Application',
    description:
      'Fill out our application form with your details, CV, and a brief note on why you want to join Remopay.',
  },
  {
    step: '02',
    title: 'Screening Call',
    description:
      'A short chat with our recruitment team to learn more about you and your aspirations.',
  },
  {
    step: '03',
    title: 'Take-Home Task',
    description:
      'Complete a practical task relevant to your role. Show us how you think and work.',
  },
  {
    step: '04',
    title: 'Final Interview',
    description:
      'Meet the team you will work with. Discuss your approach, ask questions, and explore mutual fit.',
  },
  {
    step: '05',
    title: 'Offer & Onboarding',
    description:
      'Receive your offer, sign up, and start your journey. We will set you up for success from day one.',
  },
];

const faqs = [
  {
    q: 'Who can apply for the internship program?',
    a: 'We welcome applications from current students, recent graduates, and early-career professionals who are passionate about fintech and eager to learn. A background in a related field is preferred but not mandatory.',
  },
  {
    q: 'Is the internship paid?',
    a: 'Yes, all our internships come with a competitive stipend to support you during your time with us.',
  },
  {
    q: 'How long does the internship last?',
    a: 'Our internship programs typically run for 3 to 6 months, depending on the role and your availability.',
  },
  {
    q: 'What is the work arrangement?',
    a: 'We offer flexible work arrangements. Most roles are remote-friendly or hybrid, with occasional in-person meetups in Lagos.',
  },
  {
    q: 'Will I receive a certificate upon completion?',
    a: 'Yes, you will receive a certificate of completion and a recommendation letter based on your performance.',
  },
  {
    q: 'Can this internship lead to a full-time offer?',
    a: 'Absolutely! Outstanding interns are often considered for full-time positions based on performance and business needs.',
  },
];

export default function CareersPage() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const slider = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);

    return () => clearInterval(slider);
  }, []);

  const currentHero = heroSlides[activeSlide];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <LandingTopbar />

      {/* ===== Animated Hero Section ===== */}
      <section className="relative min-h-[560px] sm:min-h-[640px] md:min-h-[700px] lg:min-h-[760px] overflow-hidden pt-16 sm:pt-20">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === activeSlide}
              fetchPriority={index === activeSlide ? 'high' : 'low'}
              sizes="100vw"
              className="object-cover object-[center_center] brightness-[0.35] contrast-110 saturate-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute left-0 top-0 h-full w-[58%] bg-gradient-to-r from-black/80 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(255,60,60,0.16),transparent_58%)]" />
          </div>
        ))}

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 sm:gap-10 px-5 py-14 sm:py-18 lg:py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff4b55]/40 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <span className="flex h-2 w-2 rounded-full bg-green-400" />
              Now Hiring Interns
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {currentHero.title}{' '}
              <br />
              <span className="text-[#ff2635]">{currentHero.highlight}</span>
              <br />
              {currentHero.suffix}
            </h1>

            <p className="mt-4 sm:mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              {currentHero.desc}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Link
                href="#open-positions"
                className="inline-flex items-center gap-2 sm:gap-3 rounded-xl bg-[#d71927] px-5 py-3 sm:px-6 sm:py-3.5 md:px-7 md:py-4 text-sm font-bold text-white shadow-xl shadow-[#d71927]/30 transition hover:bg-[#b91420]"
              >
                View Open Positions <ArrowRight size={18} />
              </Link>

              <Link
                href="#faq"
                className="inline-flex items-center gap-2 sm:gap-3 rounded-xl border border-[#ff4b55]/50 bg-black/20 px-5 py-3 sm:px-6 sm:py-3.5 md:px-7 md:py-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                Learn More
              </Link>
            </div>

            <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
              {[
                ['Mentorship', '1-on-1 Guidance', GraduationCap],
                ['Real Projects', 'Production Impact', Rocket],
                ['Flexible Work', 'Remote/Hybrid', Laptop],
                ['Stipend', 'Competitive Pay', Heart],
              ].map(([title, desc, Icon]: any) => (
                <div key={title} className="border-r border-white/15 pr-3 sm:pr-4 last:border-0">
                  <Icon className="mb-2 sm:mb-3 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="mt-1 text-xs text-white/65">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block" />

          <button
            onClick={() =>
              setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
            }
            className="absolute left-5 top-1/2 z-20 hidden h-10 w-10 lg:h-12 lg:w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur transition hover:bg-white/10 lg:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-5 top-1/2 z-20 hidden h-10 w-10 lg:h-12 lg:w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur transition hover:bg-white/10 lg:flex"
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-6 sm:bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2.5 sm:gap-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 sm:h-3 rounded-full transition-all ${
                  index === activeSlide ? 'w-7 sm:w-8 bg-[#ff2635]' : 'w-2.5 sm:w-3 bg-white/50'
                }`}
                aria-label={`Go to hero slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== Why Join Us ===== */}
      <section className="px-5 py-20 lg:px-8 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Intern at <span className="text-[#d71927]">Remopay?</span>
            </h2>
            <p className="mt-4 text-gray-600">
              More than just an internship — a launchpad for your career in fintech.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((perk, idx) => {
              const Icon = perk.icon;
              return (
                <div
                  key={idx}
                  className="group rounded-xl border border-gray-200 bg-white p-6 transition hover:border-red-200 hover:shadow-sm"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-[#d71927] transition group-hover:bg-red-100">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-gray-900">{perk.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{perk.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Open Positions ===== */}
      <section
        id="open-positions"
        className="border-t border-gray-100 bg-gray-50/50 px-5 py-20 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Open <span className="text-[#d71927]">Internships</span>
            </h2>
            <p className="mt-4 text-gray-600">
              We are currently hiring for the following intern positions. Each role offers
              hands-on experience, mentorship, and a path to growth.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {openPositions.map((position) => {
              const Icon = position.icon;
              return (
                <div
                  key={position.id}
                  id={position.id}
                  className="group rounded-xl border border-gray-200 bg-white p-8 transition hover:border-red-200 hover:shadow-md"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-[#d71927]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{position.title}</h3>
                        <p className="text-xs font-medium text-[#d71927]">{position.type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="mb-4 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1">
                      {position.location}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1">
                      {position.department}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mb-5 text-sm leading-relaxed text-gray-600">
                    {position.description}
                  </p>

                  {/* Requirements */}
                  <div className="mb-6">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                      What We're Looking For
                    </p>
                    <ul className="space-y-2">
                      {position.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Apply Button */}
                  <Link
                    href={`mailto:careers@remopay.com?subject=Application for ${encodeURIComponent(position.title)}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#d71927] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#b91420]"
                  >
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* General Application CTA */}
          <div className="mt-12 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="mb-2 text-sm font-semibold text-gray-900">
              Don't see a role that fits?
            </p>
            <p className="mb-4 text-sm text-gray-600">
              We're always on the lookout for talented people. Send us a general application.
            </p>
            <Link
              href="mailto:careers@remopay.com?subject=General Internship Application"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Send General Application
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== What We Look For ===== */}
      <section className="px-5 py-20 lg:px-8 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              What We <span className="text-[#d71927]">Value</span>
            </h2>
            <p className="mt-4 text-gray-600">
              Beyond technical skills, we look for people who share our passion for impact.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Lightbulb,
                title: 'Curiosity',
                desc: 'We value people who ask questions, explore new ideas, and never stop learning.',
              },
              {
                icon: Users,
                title: 'Collaboration',
                desc: 'Great things happen when diverse minds work together toward a common goal.',
              },
              {
                icon: Rocket,
                title: 'Ownership',
                desc: 'Take initiative, own your work, and deliver results that move the needle.',
              },
              {
                icon: Heart,
                title: 'Integrity',
                desc: 'Do the right thing, always. Trust is the foundation of everything we build.',
              },
            ].map((value, idx) => {
              const Icon = value.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-200 bg-white p-6 text-center transition hover:border-red-200 hover:shadow-sm"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#d71927]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-gray-900">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Application Process ===== */}
      <section className="border-t border-gray-100 bg-gray-50/50 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              How to <span className="text-[#d71927]">Apply</span>
            </h2>
            <p className="mt-4 text-gray-600">
              Our application process is designed to be transparent and straightforward.
            </p>
          </div>

          <div className="relative mt-16">
            {/* Connecting line (desktop) */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gray-200 lg:block" />

            <div className="space-y-12 lg:space-y-0">
              {steps.map((step, idx) => (
                <div
                  key={step.step}
                  className={`relative flex items-center ${
                    idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div className="w-full lg:w-1/2">
                    <div
                      className={`rounded-xl border border-gray-200 bg-white p-6 transition hover:border-red-200 hover:shadow-sm ${
                        idx % 2 === 0 ? 'lg:mr-8 lg:text-right' : 'lg:ml-8'
                      }`}
                    >
                      <span className="mb-2 block text-xs font-bold text-[#d71927]">
                        Step {step.step}
                      </span>
                      <h3 className="mb-2 text-base font-bold text-gray-900">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-gray-600">{step.description}</p>
                    </div>
                  </div>

                  {/* Circle indicator (desktop) */}
                  <div className="absolute left-1/2 hidden -translate-x-1/2 lg:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-red-200 bg-white text-xs font-bold text-[#d71927]">
                      {step.step}
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden w-1/2 lg:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ Section ===== */}
      <section id="faq" className="px-5 py-20 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently Asked <span className="text-[#d71927]">Questions</span>
            </h2>
            <p className="mt-4 text-gray-600">
              Got questions about our internship program? Find answers below.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-300 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-left transition hover:bg-gray-50">
                  <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                  <span className="flex-shrink-0 text-[#d71927] transition group-open:rotate-45">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4">
                  <p className="text-sm leading-relaxed text-gray-700">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="border-t border-gray-100 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm lg:p-12">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Ready to Start Your Journey?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-600">
              Take the first step toward an exciting career in fintech. We can't wait to
              hear from you.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="#open-positions"
                className="inline-flex items-center gap-2 rounded-xl bg-[#d71927] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#b91420]"
              >
                Browse Openings
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="mailto:careers@remopay.com"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Email Us
              </Link>
            </div>
            <p className="mt-6 text-xs text-gray-500">
              Or send your application to{' '}
              <a
                href="mailto:careers@remopay.com"
                className="font-semibold text-[#d71927] underline underline-offset-2 hover:text-[#b91420]"
              >
                careers@remopay.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <Footer />

      {/* ===== Structured Data (JSON-LD) ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'JobPosting',
            title: 'Internship Programs at Remopay',
            description:
              "Remopay is hiring interns across frontend engineering, backend engineering, marketing, and sales. Join Africa's fastest-growing digital finance platform.",
            hiringOrganization: {
              '@type': 'Organization',
              name: 'Remopay',
              sameAs: 'https://remopay.remonode.com',
              logo: 'https://remopay.remonode.com/icon.png',
            },
            employmentType: 'INTERN',
            applicantLocationRequirements: {
              '@type': 'Country',
              name: 'NG',
            },
            jobLocation: {
              '@type': 'Place',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Lagos',
                addressCountry: 'NG',
              },
            },
            datePosted: '2025-01-01',
            validThrough: '2025-12-31',
            employmentUnit: 'Remopay',
          }),
        }}
      />
    </main>
  );
}
