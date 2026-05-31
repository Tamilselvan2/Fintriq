'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/lib/validations/auth';
import { authApi } from '@/lib/auth-api';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(data);
      setIsSuccess(true);
      toast.success('Reset email sent');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-6 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-3">Check your email</h1>
        <p className="text-muted-foreground mb-8">
          If an account exists, we've sent a password reset link to your email address.
        </p>
        <Link href="/login" className="w-full btn-primary btn-glow py-3 block text-center">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight mb-3">Reset Password</h1>
        <p className="text-[#94a3b8] text-sm opacity-80">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Email address</label>
          <div className="relative">
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-2.5 bg-background dark:bg-slate-900/50 border border-border rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="text-danger text-sm mt-1.5 font-medium animate-in fade-in">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary btn-glow py-3 mt-2"
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
        Remember your password?{' '}
        <Link href="/login" className="text-primary hover:underline transition-colors font-bold">
          Log in
        </Link>
      </div>
    </div>
  );
}
