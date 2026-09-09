'use client';

import { User, Role } from '@/types/models';
import { useState } from 'react';
import { RoleGate } from '../auth/role-gate';
import { useAuth } from '@/hooks/use-auth';
import { useUpdateMemberRole, useRemoveMember } from '@/hooks/use-organization';
import { toast } from 'sonner';
import { ConfirmDialog } from '../shared/confirm-dialog';
import { ShieldAlert, ShieldCheck, User as UserIcon, Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface TeamTableProps {
  members: User[];
}

export function TeamTable({ members }: TeamTableProps) {
  const { user: currentUser } = useAuth();
  const updateRoleMutation = useUpdateMemberRole();
  const removeMutation = useRemoveMember();
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  if (members.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-8 h-8" />}
        title="No team members"
        description="You don't have any members in your organization yet. Invite members to collaborate."
      />
    );
  }

  return (
    <>
      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-border">
        {members.map((member) => {
          const isSelf = member.id === currentUser?.id;
          
          return (
            <div key={member.id} className="p-4 flex flex-col gap-3 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold border border-border">
                  {member.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {member.email} {isSelf && <span className="text-[10px] text-brand-blue bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full ml-2 font-bold uppercase tracking-wide">You</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  {currentUser?.role === Role.ADMIN && !isSelf ? (
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      <select 
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                        disabled={updateRoleMutation.isPending}
                        className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-border cursor-pointer focus:ring-2 focus:ring-brand-blue/50 transition-colors outline-none"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="ACCOUNTANT">Accountant</option>
                        <option value="USER">User</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-1">
                      {getRoleIcon(member.role)}
                      <span className="text-xs font-bold text-muted-foreground">
                        {member.role}
                      </span>
                    </div>
                  )}
                </div>
                {currentUser?.role === Role.ADMIN && !isSelf && (
                  <button 
                    onClick={() => setDeletingId(member.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/20"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto bg-card rounded-t-2xl">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-4 whitespace-nowrap">Member</th>
              <th className="px-6 py-4 whitespace-nowrap">Role</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => {
              const isSelf = member.id === currentUser?.id;
              
              return (
                <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border-b border-border">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold border border-border">
                        {member.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {member.email} {isSelf && <span className="text-[10px] text-brand-blue bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full ml-2 font-bold uppercase tracking-wide">You</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {currentUser?.role === Role.ADMIN && !isSelf ? (
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        <select 
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                          disabled={updateRoleMutation.isPending}
                          className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-border cursor-pointer focus:ring-2 focus:ring-brand-blue/50 transition-colors outline-none"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="ACCOUNTANT">Accountant</option>
                          <option value="USER">User</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-1">
                        {getRoleIcon(member.role)}
                        <span className="text-xs font-bold text-muted-foreground">
                          {member.role}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {currentUser?.role === Role.ADMIN && !isSelf && (
                      <button 
                        onClick={() => setDeletingId(member.id)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-500/20"
                      >
                        Remove
                      </button>
                    )}
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
