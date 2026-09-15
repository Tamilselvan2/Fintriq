import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/auth-api';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    profileImageUrl?: string | null;
  };
  className?: string;
  fallbackClassName?: string;
}

export function Avatar({ user, className, fallbackClassName }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const { data: signedUrl, isLoading } = useQuery({
    queryKey: ['avatar', user.id],
    queryFn: () => authApi.getAvatarUrl(user.id),
    enabled: !!user.profileImageUrl && !user.profileImageUrl.startsWith('http'),
    staleTime: 4 * 60 * 1000, // Cache for 4 minutes
    retry: 1,
  });

  const finalUrl = user.profileImageUrl?.startsWith('http') 
    ? user.profileImageUrl 
    : signedUrl;

  const getInitials = () => {
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return <User size={18} />;
  };

  if (!user.profileImageUrl || imageError || (!finalUrl && !isLoading)) {
    return (
      <div className={cn("flex items-center justify-center bg-brand-blue text-white font-bold overflow-hidden", fallbackClassName, className)}>
        {getInitials()}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-slate-100 dark:bg-slate-800", className)}>
      {finalUrl && (
        <img 
          src={finalUrl} 
          alt={user.name || 'User Avatar'} 
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
      {(!finalUrl || isLoading) && (
        <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />
      )}
    </div>
  );
}
