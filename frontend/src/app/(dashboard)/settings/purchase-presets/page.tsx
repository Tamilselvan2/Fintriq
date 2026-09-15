'use client';

import { RoleGate } from '@/components/auth/role-gate';
import { Role } from '@/types/models';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useCategories } from '@/hooks/use-categories';
import { useCategoryPresets, useUpdateCategoryPresets, PurchasePresetItem } from '@/hooks/use-presets';
import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Save, Tags } from 'lucide-react';
import { toast } from 'sonner';

export default function PurchasePresetsPage() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  const { data: presets, isLoading: presetsLoading } = useCategoryPresets(selectedCategoryId);
  const updatePresetsMutation = useUpdateCategoryPresets();

  const [items, setItems] = useState<Partial<PurchasePresetItem>[]>([]);

  useEffect(() => {
    if (presets) {
      setItems(presets);
    } else {
      setItems([]);
    }
  }, [presets, selectedCategoryId]);

  const handleAddItem = () => {
    setItems([...items, { name: '', price: '0', isActive: true }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    if (newItems[index].id) {
      newItems[index].isActive = false; // Soft delete
    } else {
      newItems.splice(index, 1);
    }
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof PurchasePresetItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!selectedCategoryId) {
      toast.error('Please select a category first.');
      return;
    }

    const validItems = items.filter(item => item.name && item.name.trim() !== '' && Number(item.price) >= 0);
    
    try {
      await updatePresetsMutation.mutateAsync({
        categoryId: selectedCategoryId,
        items: validItems.map(item => ({
          id: item.id,
          name: item.name!,
          price: Number(item.price),
          isActive: item.isActive !== false,
        })),
      });
      toast.success('Purchase preset saved successfully.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save preset.');
    }
  };

  return (
    <RoleGate allowedRoles={[Role.ADMIN]}>
      <ErrorBoundary>
        <div className="space-y-6 animate-in fade-in duration-500">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tags className="text-brand-blue" />
              Purchase Presets
            </h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Configure predefined items and prices for specific expense categories to make transaction entry faster.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-border rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Select Expense Category</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full sm:max-w-xs px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-border rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  disabled={categoriesLoading}
                >
                  <option value="">-- Choose Category --</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {/* To create a new category, user should use the Transactions page for now, or we can add inline creation later */}
              </div>

              {selectedCategoryId && (
                <div className="mt-8 space-y-4 border-t border-border pt-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Preset Items</h4>
                  </div>

                  {presetsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 p-4">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading items...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.filter(item => item.isActive !== false).length === 0 ? (
                        <p className="text-sm text-slate-500 italic p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-border">
                          No items added yet. Click "Add Item" to start building this preset.
                        </p>
                      ) : (
                        items.map((item, index) => {
                          if (item.isActive === false) return null; // Hide soft-deleted items
                          return (
                            <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-border">
                              <div className="flex-1 w-full">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Item Name</label>
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                  placeholder="e.g. Laptop, Paper, etc."
                                  className="w-full bg-white dark:bg-slate-950 border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                />
                              </div>
                              <div className="w-full sm:w-32">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Price</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.price}
                                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                />
                              </div>
                              <div className="w-full sm:w-auto pt-5 sm:pt-4">
                                <button
                                  onClick={() => handleRemoveItem(index)}
                                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors w-full sm:w-auto flex justify-center"
                                  title="Remove item"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={handleAddItem}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors rounded-lg text-sm font-bold"
                    >
                      <Plus size={16} /> Add Item
                    </button>
                  </div>

                  <div className="pt-4 flex justify-end border-t border-border mt-4">
                    <button
                      onClick={handleSave}
                      disabled={updatePresetsMutation.isPending || presetsLoading}
                      className="flex items-center gap-2 bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:translate-y-px disabled:opacity-50"
                    >
                      {updatePresetsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                      Save Preset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </RoleGate>
  );
}
