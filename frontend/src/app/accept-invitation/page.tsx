'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/auth-api';
import { toast } from 'sonner';
import { Building2, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';

const acceptInvitationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

function AcceptInvitationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AcceptInvitationInput>({
    resolver: zodResolver(acceptInvitationSchema),
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Invalid Link</h2>
          <p className="text-slate-500 mb-6">This invitation link is missing or invalid.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-xl font-bold transition-colors w-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: AcceptInvitationInput) => {
    setIsLoading(true);
    try {
      await authApi.acceptInvitation({
        token,
        name: data.name,
        password: data.password,
      });
      toast.success('Account created successfully! You can now log in.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
            <Building2 className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Accept Invitation</h1>
            <p className="text-slate-500 mt-2 font-medium">Create your account to join the team</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                placeholder="Jane Doe"
              />
              {errors.name && <p className="text-brand-rose text-xs mt-1.5 font-medium">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-brand-rose text-xs mt-1.5 font-medium">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword')}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-brand-rose text-xs mt-1.5 font-medium">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-brand-blue hover:bg-blue-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 group shadow-lg shadow-brand-blue/20 hover:shadow-brand-blue/40 mt-6"
            >
              {isLoading ? (
                <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-5 h-5"></span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4"><span className="animate-spin border-2 border-brand-blue border-t-transparent rounded-full w-8 h-8"></span></div>}>
      <AcceptInvitationInner />
    </Suspense>
  );
}
