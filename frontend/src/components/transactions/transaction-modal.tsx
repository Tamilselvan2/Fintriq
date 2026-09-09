'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionInput } from '@/lib/validations/transaction';
import { Transaction } from '@/types/models';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions';
import { useCategories, useCreateCategory } from '@/hooks/use-categories';
import { useCategoryPresets } from '@/hooks/use-presets';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Calculator } from './calculator';
import { Minus, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TransactionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
}

export function TransactionModal({ isOpen, onOpenChange, transaction }: TransactionModalProps) {
  const isEditMode = !!transaction;

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, reset, setValue, watch, getValues, formState: { errors } } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: 'EXPENSE', amount: 0, category: '', description: '', transactionDate: '' }
  });

  const { data: categories = [] } = useCategories();
  const createCategoryMutation = useCreateCategory();
  
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const selectedType = watch('type');
  const selectedCategoryName = watch('category');
  const hasDate = watch('transactionDate');
  const selectedCategory = useMemo(() => categories.find(c => c.name === selectedCategoryName), [categories, selectedCategoryName]);
  
  const { data: presets = [] } = useCategoryPresets(selectedType === 'EXPENSE' ? selectedCategory?.id : undefined);
  const [presetQuantities, setPresetQuantities] = useState<Record<string, number>>({});
  const [hasParsedInitial, setHasParsedInitial] = useState(false);

  useEffect(() => {
    setPresetQuantities({});
    setHasParsedInitial(false);
  }, [selectedCategoryName, selectedType]);

  useEffect(() => {
    if (isOpen && transaction && presets.length > 0 && !hasParsedInitial) {
      const initialQuantities: Record<string, number> = {};
      const desc = transaction.description || '';
      
      presets.forEach(p => {
        const safeName = p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(\\d+)x\\s+${safeName}`, 'i');
        const match = desc.match(regex);
        if (match) {
           initialQuantities[p.id] = parseInt(match[1], 10);
        }
      });
      
      setPresetQuantities(initialQuantities);
      setHasParsedInitial(true);
    }
  }, [isOpen, transaction, presets, hasParsedInitial]);

  const updatePresetQuantity = (itemId: string, delta: number) => {
    const currentQty = presetQuantities[itemId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    
    const newQuantities = { ...presetQuantities, [itemId]: newQty };
    setPresetQuantities(newQuantities);

    let oldAmount = 0;
    let newAmount = 0;
    const newItemsList: string[] = [];
    
    presets.forEach(p => {
      const oldQty = presetQuantities[p.id] || 0;
      const newQtyLocal = p.id === itemId ? newQty : oldQty;
      
      if (oldQty > 0) {
        oldAmount += oldQty * Number(p.price);
      }
      if (newQtyLocal > 0) {
        newAmount += newQtyLocal * Number(p.price);
        newItemsList.push(`${newQtyLocal}x ${p.name}`);
      }
    });

    const amountDelta = newAmount - oldAmount;
    const currentFormAmount = Number(getValues('amount')) || 0;
    const nextFormAmount = Math.max(0, currentFormAmount + amountDelta);

    setValue('amount', Number(nextFormAmount.toFixed(2)), { shouldValidate: true, shouldDirty: true });
    
    // Use zero-width spaces to invisibly tag our auto-generated string
    const ZWS = '\u200B';
    const newPresetStr = newItemsList.length > 0 ? `${ZWS}${newItemsList.join(', ')}${ZWS}` : '';
    let currentDesc = getValues('description') || '';
    
    // Strip out the previous auto-generated string perfectly every time
    currentDesc = currentDesc.replace(/\u200B.*?\u200B\n?/g, '');
    
    // Also clean up legacy formats from earlier versions if they exist
    currentDesc = currentDesc.replace(/Purchased: .*?(?:\n|$)/g, '');
    currentDesc = currentDesc.trim();
    
    // Append the new one
    if (newPresetStr) {
      currentDesc = currentDesc ? `${currentDesc}\n${newPresetStr}` : newPresetStr;
    }
    
    setValue('description', currentDesc, { shouldValidate: true, shouldDirty: true });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await createCategoryMutation.mutateAsync(newCategoryName);
      setIsCreatingCategory(false);
      setNewCategoryName('');
      setValue('category', newCat.name, { shouldValidate: true });
      toast.success('Category created');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        reset({
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description || '',
          transactionDate: transaction.transactionDate ? format(new Date(transaction.transactionDate), "yyyy-MM-dd'T'HH:mm") : '',
        });
      } else {
        reset({ type: 'EXPENSE', amount: 0, category: '', description: '', transactionDate: '' });
      }
      setIsCreatingCategory(false);
      setNewCategoryName('');
    }
  }, [isOpen, transaction, reset]);

  const onSubmit = async (data: TransactionInput) => {
    try {
      const formattedData = {
        ...data,
        type: data.type as Transaction['type'],
        transactionDate: data.transactionDate ? new Date(data.transactionDate).toISOString() : data.transactionDate,
      };

      if (isEditMode && transaction) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          data: formattedData,
        });

        toast.success('Transaction updated successfully');
      } else {
        await createMutation.mutateAsync(formattedData);

        toast.success('Transaction created successfully');
      }

      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to save transaction'
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Type</label>
              <select
                {...register('type')}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
              {errors.type && <p className="text-brand-rose text-xs mt-1.5 font-medium">{errors.type.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Amount ($)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  className="w-full pl-4 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 placeholder-slate-400"
                  placeholder="0.00"
                />
                <div className="absolute right-1 top-1 bottom-1 flex items-center">
                  <Calculator 
                    initialValue={watch('amount')}
                    onUseResult={(val) => setValue('amount', val, { shouldValidate: true, shouldDirty: true })} 
                  />
                </div>
              </div>
              {errors.amount && <p className="text-brand-rose text-xs mt-1.5 font-medium">{errors.amount.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
            
            {isCreatingCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={createCategoryMutation.isPending}
                  className="px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {createCategoryMutation.isPending && <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-3 h-3"></span>}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCategory(false);
                    setNewCategoryName('');
                  }}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                {...register('category')}
                onChange={(e) => {
                  if (e.target.value === 'CREATE_NEW') {
                    setIsCreatingCategory(true);
                    setValue('category', ''); // Clear form value while creating
                  } else {
                    setValue('category', e.target.value, { shouldValidate: true });
                  }
                }}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              >
                <option value="">Select a category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                <option value="CREATE_NEW" className="font-bold text-brand-blue">+ Create New Category</option>
              </select>
            )}
            
            {errors.category && !isCreatingCategory && <p className="text-brand-rose text-xs mt-1.5 font-medium">{errors.category.message}</p>}
          </div>

          {presets.length > 0 && selectedType === 'EXPENSE' && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-brand-blue/20">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-brand-blue flex items-center gap-2">
                Purchase Presets
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {presets.map(item => {
                  const qty = presetQuantities[item.id] || 0;
                  return (
                    <div key={item.id} className="flex items-center justify-between bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-border">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</span>
                        <span className="text-xs font-semibold text-slate-500">${Number(item.price).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          type="button" 
                          onClick={() => updatePresetQuantity(item.id, -1)}
                          disabled={qty === 0}
                          className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-4 text-center text-sm font-bold">{qty}</span>
                        <button 
                          type="button" 
                          onClick={() => updatePresetQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue hover:bg-brand-blue/20 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Add details about this transaction..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-none placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Transaction Date & Time <span className="text-slate-400 font-normal">(Optional)</span></label>
            <input
              type="datetime-local"
              {...register('transactionDate')}
              className={cn(
                "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50",
                hasDate ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
              )}
            />
            {errors.transactionDate && <p className="text-brand-rose text-xs mt-1.5 font-medium">{errors.transactionDate.message}</p>}
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
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-blue hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isSubmitting && <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-4 h-4"></span>}
              {isEditMode ? 'Save Changes' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
