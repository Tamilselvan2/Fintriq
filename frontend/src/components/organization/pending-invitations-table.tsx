import { useState } from 'react';
import { usePendingInvitations, useResendInvitation } from '@/hooks/use-organization';
import { Mail, Send, Clock, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function PendingInvitationsTable() {
  const { data: invitations = [], isLoading } = usePendingInvitations();
  const resendMutation = useResendInvitation();

  const [resendingId, setResendingId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="p-10 text-center text-slate-500">Loading pending invitations...</div>;
  }

  if (invitations.length === 0) {
    return null;
  }

  const handleResend = async (id: string) => {
    setResendingId(id);
    try {
      await resendMutation.mutateAsync(id);
      toast.success('Invitation resent successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend invitation');
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Pending Invitations</h3>
      <div className="bg-white dark:bg-slate-950 border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sent Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <Mail size={18} className="text-slate-400" />
                      </div>
                      <div className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                        {invitation.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Shield size={14} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {invitation.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                      <Clock size={12} />
                      Pending
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(invitation.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleResend(invitation.id)}
                        disabled={resendingId === invitation.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Resend Invitation"
                      >
                        {resendingId === invitation.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Resend
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
