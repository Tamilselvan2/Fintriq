'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validations/auth';
import { authApi } from '@/lib/auth-api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({
        token,
        password: data.password,
      });
      setIsSuccess(true);
      toast.success('Password reset successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h1>
        <p className="text-muted-foreground mb-8">This password reset link is invalid or missing the required token.</p>
        <Link href="/forgot-password" className="text-primary hover:underline font-bold">
          Request a new link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-6 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-3">Password Updated</h1>
        <p className="text-muted-foreground mb-8">
          Your password has been successfully reset. You can now log in with your new password.
        </p>
        <button 
          onClick={() => router.push('/login')} 
          className="w-full btn-primary btn-glow py-3 block text-center"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight mb-3">Set New Password</h1>
        <p className="text-[#94a3b8] text-sm opacity-80">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-1.5">New Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type="password"
              className="w-full px-4 py-2.5 bg-background dark:bg-slate-900/50 border border-border rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="text-danger text-sm mt-1.5 font-medium animate-in fade-in">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Confirm New Password</label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type="password"
              className="w-full px-4 py-2.5 bg-background dark:bg-slate-900/50 border border-border rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && <p className="text-danger text-sm mt-1.5 font-medium animate-in fade-in">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary btn-glow py-3 mt-2"
        >
          {isSubmitting ? 'Updating...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
