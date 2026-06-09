'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionInput } from '@/lib/validations/transaction';
import { Transaction } from '@/types/models';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions';
import { useCategories, useCreateCategory } from '@/hooks/use-categories';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: 'EXPENSE', amount: 0, category: '', description: '', transactionDate: '' }
  });

  const { data: categories = [] } = useCategories();
  const createCategoryMutation = useCreateCategory();
  
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

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
          transactionDate: transaction.transactionDate ? transaction.transactionDate.substring(0, 10) : '',
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
      <DialogContent>
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
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 placeholder-slate-400"
                placeholder="0.00"
              />
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
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Transaction Date <span className="text-slate-400 font-normal">(Optional)</span></label>
            <input
              type="date"
              {...register('transactionDate')}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 placeholder-slate-400"
              placeholder="Leave blank to use today's date"
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
