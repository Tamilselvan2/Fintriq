'use client';

import { ReactNode } from 'react';
import { User, Building, Shield, SlidersHorizontal, ChevronDown, Tags } from 'lucide-react';
import { SidebarNav } from './components/sidebar-nav';
import { useRouter, usePathname } from 'next/navigation';

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Organization',
    href: '/settings/organization',
    icon: Building,
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Shield,
  },
  {
    title: 'Preferences',
    href: '/settings/preferences',
    icon: SlidersHorizontal,
  },
  {
    title: 'Purchase Presets',
    href: '/settings/purchase-presets',
    icon: Tags,
  },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="space-y-6 pb-16 md:block animate-in fade-in duration-500">
      <div className="space-y-0.5">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Settings</h2>
        <p className="text-slate-500 font-medium">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          {/* Mobile Navigation Dropdown */}
          <div className="block lg:hidden mb-6 relative">
            <select
              className="w-full bg-white dark:bg-slate-950 border border-border text-slate-900 dark:text-white text-sm font-semibold rounded-xl px-4 py-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue relative z-10"
              onChange={(e) => {
                router.push(e.target.value);
              }}
              value={pathname}
            >
              {sidebarNavItems.map((item) => (
                <option key={item.href} value={item.href}>
                  {item.title}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-20">
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block">
            <SidebarNav items={sidebarNavItems} />
          </div>
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
