'use client';

import { useAuth } from '@/hooks/use-auth';
import { useOrganization, useUpdateOrganization } from '@/hooks/use-organization';

export default function PreferencesPage() {
  const { isAdmin } = useAuth();
  const { data: org } = useOrganization();
  const updateOrgMutation = useUpdateOrganization();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Preferences</h3>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage your application preferences.</p>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">

          {/* Other Preferences Placeholders */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Regional & Density</h4>
            
            <div className="space-y-4">
              {isAdmin && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Organization Currency</p>
                    <p className="text-xs text-slate-500 mt-1">Set the currency symbol used across the organization.</p>
                  </div>
                  <select 
                    value={org?.currency || 'INR'}
                    onChange={(e) => {
                      const newCurrency = e.target.value;
                      updateOrgMutation.mutate({ name: org?.name || '', currency: newCurrency }, {
                        onSuccess: () => {
                          localStorage.setItem('fintriq_currency', newCurrency);
                          window.location.reload();
                        }
                      });
                    }}
                    disabled={updateOrgMutation.isPending}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-border rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue/50 outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Timezone</p>
                  <p className="text-xs text-slate-500 mt-1">Used for calculating daily and monthly reports.</p>
                </div>
                <select disabled className="px-3 py-2 bg-white dark:bg-slate-800 border border-border rounded-lg text-sm font-medium text-slate-900 dark:text-white opacity-60 cursor-not-allowed">
                  <option>UTC (System Default)</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
