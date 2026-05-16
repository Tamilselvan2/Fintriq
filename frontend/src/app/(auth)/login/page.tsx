'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast.success('Logged in successfully');
    } catch (error: any) {
      const status = error.response?.status;
      const toastMessage = status === 401 ? 'Invalid email or password' : error.response?.data?.message || 'Login failed';
      toast.error(toastMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-[22px] mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)] border border-primary/20">
          <svg className="w-9 h-9 text-primary filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-3">Welcome back to Fintriq</h1>
        <p className="text-[#94a3b8] font-bold text-sm uppercase tracking-widest opacity-80">Financial clarity for modern teams</p>
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

        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Password</label>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary btn-glow py-3 mt-2"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
        New to Fintriq?{' '}
        <Link href="/register" className="text-primary hover:underline transition-colors font-bold">
          Create an account
        </Link>
      </div>
    </div>
  );
}
