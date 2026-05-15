'use client';

import { useAuth } from '@/hooks/use-auth';
import { Role } from '@/types/models';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export function RoleGate({ children, allowedRoles }: RoleGateProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
