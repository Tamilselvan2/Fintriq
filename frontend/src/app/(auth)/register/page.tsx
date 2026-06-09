'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validations/auth';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { authApi } from '@/lib/auth-api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const passwordVal = watch('password');
  const getPasswordStrength = () => {
    if (!passwordVal) return 0;
    let score = 0;
    if (passwordVal.length > 7) score++;
    if (/[A-Z]/.test(passwordVal)) score++;
    if (/[0-9]/.test(passwordVal)) score++;
    if (/[^A-Za-z0-9]/.test(passwordVal)) score++;
    return score;
  };

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    try {
      await authApi.register(data);
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-success/10 rounded-2xl mb-4">
          <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Create Workspace</h1>
        <p className="text-muted-foreground font-medium">Join Fintriq to manage your team's finances.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Organization Name</label>
          <input
            {...register('name')}
            type="text"
            className="w-full px-4 py-2.5 bg-background dark:bg-slate-900/50 border border-border rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Acme Corp"
          />
          {errors.name && <p className="text-danger text-sm mt-1.5 font-medium animate-in fade-in">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Email address</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-2.5 bg-background dark:bg-slate-900/50 border border-border rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-danger text-sm mt-1.5 font-medium animate-in fade-in">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Password</label>
          <input
            {...register('password')}
            type="password"
            className="w-full px-4 py-2.5 bg-background dark:bg-slate-900/50 border border-border rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="••••••••"
          />
          {passwordVal && (
            <div className="mt-2.5 flex gap-1.5 h-1.5 w-full">
              {[...Array(4)].map((_, i) => (
                <div 
                   key={i} 
                   className={`flex-1 rounded-full transition-all duration-500 ${i < getPasswordStrength() ? (getPasswordStrength() > 2 ? 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400') : 'bg-muted'}`} 
                />
              ))}
            </div>
          )}
          {errors.password && <p className="text-danger text-sm mt-1.5 font-medium animate-in fade-in">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Confirm Password</label>
          <input
            {...register('confirmPassword')}
            type="password"
            className="w-full px-4 py-2.5 bg-background dark:bg-slate-900/50 border border-border rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-danger text-sm mt-1.5 font-medium animate-in fade-in">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary btn-glow py-3 mt-6"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner className="h-5 w-5 text-white" />
              Creating Workspace...
            </span>
          ) : 'Create Workspace'}
        </button>
      </form>

      <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline transition-colors font-bold">
          Sign in
        </Link>
      </div>
      
    </div>
  );
}
