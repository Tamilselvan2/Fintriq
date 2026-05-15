'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validations/auth';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Workspace</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Sign up to manage your organization's finances</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Organization Name</label>
          <input
            {...register('orgName')}
            type="text"
            className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all backdrop-blur-sm"
            placeholder="Acme Corp"
          />
          {errors.orgName && <p className="text-brand-rose text-sm mt-1.5 font-medium animate-in fade-in">{errors.orgName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all backdrop-blur-sm"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-brand-rose text-sm mt-1.5 font-medium animate-in fade-in">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
          <input
            {...register('password')}
            type="password"
            className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all backdrop-blur-sm"
            placeholder="••••••••"
          />
          {passwordVal && (
            <div className="mt-2.5 flex gap-1.5 h-1.5 w-full">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-all duration-500 ${i < getPasswordStrength() ? (getPasswordStrength() > 2 ? 'bg-brand-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]') : 'bg-slate-200 dark:bg-slate-700'}`} 
                />
              ))}
            </div>
          )}
          {errors.password && <p className="text-brand-rose text-sm mt-1.5 font-medium animate-in fade-in">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
          <input
            {...register('confirmPassword')}
            type="password"
            className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all backdrop-blur-sm"
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-brand-rose text-sm mt-1.5 font-medium animate-in fade-in">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="relative w-full py-2.5 px-4 bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-brand-blue/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed overflow-hidden mt-6"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Workspace...
            </span>
          ) : 'Create Workspace'}
        </button>
      </form>

      <div className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-blue hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  );
}
