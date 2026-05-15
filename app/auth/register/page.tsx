'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  Phone,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  Gift,
} from 'lucide-react';

import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/shared/Button';
import { AuthProtected } from '@/components/AuthProtected';
import { AuthProtectedRoute } from '@/components/AuthProtectedRoute';
import { PhoneInput } from '@/components/shared/PhoneInput';
import { registerSchema, type RegisterSchema } from '@/utils/validation.utils';

const STEPS = [
  {
    id: 1,
    label: 'Personal',
    fields: ['first_name', 'last_name', 'email'] as const,
    description: 'Tell us who you are',
  },
  {
    id: 2,
    label: 'Contact',
    fields: ['phone_number'] as const,
    description: 'How can we reach you',
  },
  {
    id: 3,
    label: 'Security',
    fields: ['password', 'password_confirmation'] as const,
    description: 'Secure your account',
  },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-8 flex items-center justify-center">
      {STEPS.map((step, idx) => {
        const done = current > step.id;
        const active = current === step.id;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                  done
                    ? 'bg-[#22c55e] text-white'
                    : active
                      ? 'bg-[#d71927] text-white ring-4 ring-[#ff4b55]/20'
                      : 'border border-white/20 bg-white/10 text-white/50'
                }`}
              >
                {done ? <CheckCircle2 size={14} /> : step.id}
              </div>

              <span
                className={`mt-1.5 caption-xs ${
                  active ? 'text-[#ff737b]' : done ? 'text-white' : 'text-white/45'
                }`}
              >
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={`mx-1 mb-5 h-[2px] w-12 rounded-full sm:w-16 ${
                  current > step.id ? 'bg-[#22c55e]' : 'bg-white/20'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldWrapper({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block label text-white">{label}</label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
          {icon}
        </div>
        {children}
      </div>

      {error && <p className="mt-1 caption-xs text-red-400">{error}</p>}
    </div>
  );
}

function PasswordInput({
  label,
  placeholder,
  error,
  registration,
}: {
  label: string;
  placeholder: string;
  error?: string;
  registration: any;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <FieldWrapper label={label} icon={<Lock size={16} />} error={error}>
      <input
        {...registration}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-11 body-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff4b55]"
      />

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
        tabIndex={-1}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </FieldWrapper>
  );
}

function RegisterPageContent() {
  const { register: registerUser, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
    setValue,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  // Populate referral code from URL query parameter
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setValue('referral_code', refCode);
    }
  }, [searchParams, setValue]);

  const stepFields: Record<number, (keyof RegisterSchema)[]> = {
    1: ['first_name', 'last_name', 'email'],
    2: ['phone_number'],
    3: ['password', 'password_confirmation'],
  };

  const handleNext = async () => {
    const valid = await trigger(stepFields[currentStep]);
    if (valid) setCurrentStep((step) => Math.min(step + 1, STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const onSubmit = async (data: RegisterSchema) => {
    await registerUser(data);
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <img
        src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1800&q=90"
        alt="Remopay register background"
        className="absolute inset-0 h-full w-full object-cover brightness-95 contrast-110 saturate-110"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,60,60,0.15),transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="mb-6 flex justify-center">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/icon.png" alt="Remopay" width={45} height={45} />
              <span className="h5 font-bold">Remopay</span>
            </Link>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mb-6 text-center">
              <h1 className="h3">Create Account</h1>
              <p className="mt-2 body-sm text-white/70">
                Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].description}
              </p>
            </div>

            <StepIndicator current={currentStep} />

            <form onSubmit={handleSubmit(onSubmit)}>
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FieldWrapper
                      label="First Name"
                      icon={<User size={16} />}
                      error={errors.first_name?.message}
                    >
                      <input
                        {...register('first_name')}
                        type="text"
                        placeholder="John"
                        className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff4b55]"
                      />
                    </FieldWrapper>

                    <FieldWrapper
                      label="Last Name"
                      icon={<User size={16} />}
                      error={errors.last_name?.message}
                    >
                      <input
                        {...register('last_name')}
                        type="text"
                        placeholder="Doe"
                        className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff4b55]"
                      />
                    </FieldWrapper>
                  </div>

                  <FieldWrapper
                    label="Email Address"
                    icon={<Mail size={16} />}
                    error={errors.email?.message}
                  >
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-3 body-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff4b55]"
                    />
                  </FieldWrapper>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="rip-input-wrapper">
                    <PhoneInput
                      control={control as any}
                      name="phone_number"
                      label="Phone Number"
                      defaultCountry="NG"
                      placeholder="Enter your phone number"
                      required={true}
                    />
                  </div>

                  <FieldWrapper label="Referral Code (Optional)" icon={<Gift size={16} />}>
                    <input
                      {...register('referral_code')}
                      type="text"
                      placeholder="REMOPAY-XXXXX"
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-3 body-sm uppercase tracking-wider text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff4b55]"
                    />
                  </FieldWrapper>

                  <p className="caption-xs leading-5 text-white/55">
                    Enter a referral code if someone invited you to Remopay.
                  </p>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5">
                  <PasswordInput
                    label="Password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    registration={register('password')}
                  />

                  <PasswordInput
                    label="Confirm Password"
                    placeholder="••••••••"
                    error={errors.password_confirmation?.message}
                    registration={register('password_confirmation')}
                  />

                  <label className="flex cursor-pointer items-start gap-3 pt-1 body-sm text-white/70">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-[#d71927] focus:ring-[#ff4b55]"
                    />
                    <span className="leading-relaxed">
                      I agree to the{' '}
                      <Link href="/terms" className="font-bold text-[#ff737b]">
                        Terms of Service
                      </Link>{' '}
                      and platform policies.
                    </span>
                  </label>
                </div>
              )}

              <div className={`mt-7 flex gap-3 ${currentStep > 1 ? '' : 'flex-col'}`}>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 button-md text-white/75 transition hover:bg-white/10"
                  >
                    <ArrowLeft size={15} />
                    Back
                  </button>
                )}

                {currentStep < STEPS.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#d71927] py-3 button-md text-white shadow-lg shadow-[#d71927]/30 transition hover:bg-[#b91420]"
                  >
                    Continue
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <Button
                    type="submit"
                    fullWidth
                    isLoading={isLoading}
                    className="flex-1 rounded-xl bg-[#d71927] py-3 font-black text-white shadow-lg shadow-[#d71927]/30 hover:bg-[#b91420]"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      Create Account
                      <ArrowRight size={15} />
                    </span>
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 border-t border-white/10 pt-5 text-center">
              <p className="text-sm text-white/70">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-bold text-[#ff737b]">
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

function RegisterPageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#100303] to-black">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#d71927] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProtectedRoute requireUnauthenticated={true} redirectTo="/dashboard">
      <Suspense fallback={<RegisterPageFallback />}>
        <RegisterPageContent />
      </Suspense>
    </AuthProtectedRoute>
  );
}