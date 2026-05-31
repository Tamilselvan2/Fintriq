'use client';

import { useAuth } from '@/hooks/use-auth';
import { User, Mail, Shield, Building2, Upload, Loader2, Save } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { authApi } from '@/lib/auth-api';
import { toast } from 'sonner';

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.name) {
      setNameInput(user.name);
    }
  }, [user]);

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (nameInput.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    setIsSavingName(true);
    try {
      const updatedUser = await authApi.updateProfile({ name: nameInput.trim() });
      updateUser(updatedUser);
      toast.success('Name updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG and WebP formats are supported');
      return;
    }

    setIsUploading(true);
    try {
      const updatedUser = await authApi.uploadProfilePicture(file);
      updateUser(updatedUser);
      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile picture');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-xl border border-border"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Profile</h3>
        <p className="text-sm text-slate-500">
          Your personal information and account details.
        </p>
      </div>
      
      <div className="bg-white dark:bg-slate-950 border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-xl ring-4 ring-white dark:ring-slate-900 transition-all overflow-hidden bg-gradient-to-tr from-brand-blue to-emerald-400">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()
                )}
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </button>
            </div>
            
            <div className="text-center sm:text-left">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{user.name || 'User'}</h4>
              <p className="text-sm text-slate-500 font-medium mb-3">{user.role}</p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-sm px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isUploading ? 'Uploading...' : 'Change Picture'}
              </button>
            </div>
          </div>

          <div className="h-px bg-border w-full"></div>

          {/* Details Section */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 col-span-full sm:col-span-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-blue" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all text-slate-900 dark:text-slate-100"
                    placeholder="Enter your name"
                  />
                </div>
                <button
                  onClick={handleSaveName}
                  disabled={isSavingName || nameInput.trim() === user.name}
                  className="px-4 py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-sm"
                >
                  {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span className="hidden sm:inline">Save</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-border rounded-xl">
                <Mail size={18} className="text-brand-blue" />
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Role</label>
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-border rounded-xl">
                <Shield size={18} className="text-emerald-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.role}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Organization ID</label>
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-border rounded-xl">
                <Building2 size={18} className="text-slate-400" />
                <span className="text-sm font-mono text-slate-500">{user.orgId}</span>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
