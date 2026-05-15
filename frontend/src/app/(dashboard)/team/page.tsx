'use client';

import { RoleGate } from '@/components/auth/role-gate';
import { Role } from '@/types/models';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useMembers } from '@/hooks/use-organization';
import { TeamTable } from '@/components/organization/team-table';
import { InviteMemberModal } from '@/components/organization/invite-member-modal';

export default function TeamPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { data: members = [], isLoading } = useMembers();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Team Management</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage members, update access roles, and secure your organization.</p>
        </div>
        
        <RoleGate allowedRoles={[Role.ADMIN]}>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:translate-y-px"
          >
            <UserPlus size={20} strokeWidth={2.5} />
            <span>Invite Member</span>
          </button>
        </RoleGate>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <TeamTable members={members} isLoading={isLoading} />
      </div>

      <InviteMemberModal 
        isOpen={isInviteModalOpen} 
        onOpenChange={setIsInviteModalOpen} 
      />
    </div>
  );
}
