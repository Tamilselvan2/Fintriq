'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inviteMemberSchema, InviteMemberInput } from '@/lib/validations/organization';
import { Role } from '@/types/models';
import { useInviteMember } from '@/hooks/use-organization';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

interface InviteMemberModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberModal({ isOpen, onOpenChange }: InviteMemberModalProps) {
  const inviteMutation = useInviteMember();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: '', role: Role.USER }
  });

  const onSubmit = async (data: InviteMemberInput) => {
    try {
      await inviteMutation.mutateAsync(data);
      toast.success('Member invited successfully');
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to invite member');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
            <input 
              type="email"
              {...register('email')}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50 placeholder-slate-400"
              placeholder="colleague@example.com"
            />
            {errors.email && <p className="text-brand-rose text-xs mt-1.5 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Role</label>
            <select 
              {...register('role')}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            >
              <option value="USER">User (Read Only)</option>
              <option value="ACCOUNTANT">Accountant (Manage Data)</option>
              <option value="ADMIN">Admin (Full Access)</option>
            </select>
            {errors.role && <p className="text-brand-rose text-xs mt-1.5 font-medium">{errors.role.message}</p>}
          </div>



          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={inviteMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-blue hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {inviteMutation.isPending && <Spinner className="w-4 h-4 text-white" />}
              Send Invitation
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
