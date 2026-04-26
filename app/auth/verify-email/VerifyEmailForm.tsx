'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  BadgeCheck,
  Mail,
  MailCheck,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import {
  verifyEmailSchema,
  type VerifyEmailSchema,
} from '@/utils/validation.utils';

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';

  const { verifyEmail, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<VerifyEmailSchema>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  const email = watch('email');

  const onSubmit = async (data: VerifyEmailSchema) => {
    await verifyEmail(data);
  };

  const handleResendCode = async () => {
    // Add resend verification logic here.
    // Example: await resendVerificationCode({ email });
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <img
        src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1800&q=90"
        alt="Remopay verification background"
        className="absolute inset-0 h-full w-full object-cover brightness-95 contrast-110 saturate-110"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,60,60,0.15),transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/icon.png" alt="Remopay" width={45} height={45} />
              <span className="text-2xl font-black">Remopay</span>
            </Link>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <MailCheck className="h-8 w-8 text-[#ff737b]" />
              </div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff4b55]/40 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#ff737b]">
                <BadgeCheck size={14} />
                Verification Step
              </div>

              <h1 className="text-3xl font-black">Verify your email</h1>

              <p className="mt-3 text-sm leading-6 text-white/70">
                Enter your email address and verification code to activate your
                Remopay account securely.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-bold">Email</label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                    size={16}
                  />

                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff4b55]"
                  />
                </div>

                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold">
                  Verification Code
                </label>

                <input
                  {...register('code')}
                  type="text"
                  placeholder="Enter verification code"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-lg font-black tracking-[0.35em] text-white placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff4b55]"
                />

                {errors.code && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.code.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d71927] py-3 text-sm font-black text-white shadow-lg shadow-[#d71927]/30 transition hover:bg-[#b91420] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-[#ff737b]" />
                <p className="text-sm leading-6 text-white/65">
                  This helps us protect your Remopay wallet, transactions, and
                  reward activity.
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleResendCode}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#ff737b] hover:text-[#ff4b55]"
              >
                <RefreshCcw size={15} />
                Resend verification code
              </button>

              <p className="mt-4 text-sm text-white/65">
                Already verified?{' '}
                <Link
                  href="/auth/login"
                  className="font-bold text-[#ff737b] hover:text-[#ff4b55]"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}