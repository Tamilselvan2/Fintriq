'use client';

import { User, Role } from '@/types/models';
import { useState } from 'react';
import { RoleGate } from '../auth/role-gate';
import { useAuth } from '@/hooks/use-auth';
import { useUpdateMemberRole, useRemoveMember } from '@/hooks/use-organization';
import { toast } from 'sonner';
import { ConfirmDialog } from '../shared/confirm-dialog';
import { ShieldAlert, ShieldCheck, User as UserIcon } from 'lucide-react';

interface TeamTableProps {
  members: User[];
  isLoading: boolean;
}

export function TeamTable({ members, isLoading }: TeamTableProps) {
  const { user: currentUser } = useAuth();
  const updateRoleMutation = useUpdateMemberRole();
  const removeMutation = useRemoveMember();
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-14 bg-slate-50 dark:bg-slate-900 border-b border-border"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 border-b border-border bg-white dark:bg-slate-950"></div>
        ))}
      </div>
    );
  }

  const handleRoleChange = async (id: string, newRole: Role) => {
    try {
      await updateRoleMutation.mutateAsync({ id, role: newRole });
      toast.success('Role updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await removeMutation.mutateAsync(deletingId);
      toast.success('Member removed from organization');
      setDeletingId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.ADMIN: return <ShieldAlert size={14} className="text-brand-rose" />;
      case Role.ACCOUNTANT: return <ShieldCheck size={14} className="text-brand-emerald" />;
      default: return <UserIcon size={14} className="text-slate-400" />;
    }
  };

  return (
    <>
      <div className="overflow-x-auto bg-white dark:bg-slate-950 rounded-2xl">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-border text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role & Access</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => {
              const isSelf = member.id === currentUser?.id;
              
              return (
                <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-blue to-emerald-400 flex items-center justify-center text-white font-bold shadow-sm">
                        {member.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {member.email} {isSelf && <span className="text-xs text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full ml-2 font-bold">You</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {/* Render standard badge for non-admins or if it's the current user (don't let user easily downgrade themselves here to avoid being stranded) */}
                    <RoleGate allowedRoles={[Role.ADMIN]}>
                      {!isSelf ? (
                        <div className="flex items-center gap-2">
                          {getRoleIcon(member.role)}
                          <select 
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                            disabled={updateRoleMutation.isPending}
                            className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-brand-blue/50 transition-colors outline-none"
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="ACCOUNTANT">Accountant</option>
                            <option value="USER">User</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-1">
                          {getRoleIcon(member.role)}
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {member.role}
                          </span>
                        </div>
                      )}
                    </RoleGate>
                    
                    {currentUser?.role !== Role.ADMIN && (
                      <div className="flex items-center gap-2 px-1">
                        {getRoleIcon(member.role)}
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {member.role}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <RoleGate allowedRoles={[Role.ADMIN]}>
                      {!isSelf && (
                        <button 
                          onClick={() => setDeletingId(member.id)}
                          className="text-sm font-bold text-brand-rose hover:text-rose-600 transition-colors bg-brand-rose/10 hover:bg-brand-rose/20 px-4 py-2 rounded-xl shadow-sm"
                        >
                          Remove
                        </button>
                      )}
                    </RoleGate>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Remove Team Member"
        description="Are you sure you want to remove this member from your organization? They will lose all access immediately and their sessions will be terminated."
        onConfirm={confirmDelete}
        isConfirming={removeMutation.isPending}
      />
    </>
  );
}
