'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { AuthProtectedRoute } from '@/components/AuthProtectedRoute';
import { loginSchema, type LoginSchema } from '@/utils/validation.utils';

  export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    await login(data);
  };

  return (
    <AuthProtectedRoute requireUnauthenticated={true} redirectTo="/dashboard">
      <div className="relative min-h-screen overflow-hidden text-white">
        
        {/* 🔥 Background Image */}
        <img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1800&q=90"
          className="absolute inset-0 h-full w-full object-cover brightness-95 contrast-110 saturate-110"
          alt="Remopay background"
        />

        {/* 🎯 Balanced Overlay (NOT TOO DARK) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* 🌟 Glow Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,60,60,0.15),transparent_60%)]" />

        {/* 🔷 Content */}
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">

          <div className="w-full max-w-md">

            {/* 🔴 Logo */}
            <div className="mb-6 flex justify-center">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/icon.png" alt="Remopay" width={45} height={45} />
                <span className="text-2xl font-black">Remopay</span>
              </Link>
            </div>

            {/* 💎 Glass Card */}
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">

              {/* Header */}
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-black">Welcome Back</h2>
                <p className="mt-2 text-sm text-white/70">
                  Sign in to continue your payments and rewards
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Email */}
                <div>
                  <label className="mb-1 block text-sm font-bold">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff4b55]"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1 block text-sm font-bold">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />

                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff4b55]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-white/70">
                    <input type="checkbox" {...register('remember_me')} />
                    Remember me
                  </label>

                  <Link href="/auth/forgot-password" className="text-[#ff4b55] font-bold">
                    Forgot?
                  </Link>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-white shadow-lg transition ${
                    isLoading
                      ? 'bg-[#d71927]/60 shadow-[#d71927]/15 cursor-not-allowed opacity-70'
                      : 'bg-[#d71927] shadow-[#d71927]/30 hover:bg-[#b91420]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center text-sm text-white/70">
                Don’t have an account?{' '}
                <Link href="/auth/register" className="font-bold text-[#ff4b55]">
                  Create one
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AuthProtectedRoute>
  );
}