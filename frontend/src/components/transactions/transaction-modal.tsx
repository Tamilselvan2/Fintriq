'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionInput } from '@/lib/validations/transaction';
import { Transaction } from '@/types/models';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions';
import { useEffect } from 'react';
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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: 'EXPENSE', amount: 0, category: '', description: '' }
  });

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        reset({
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description || '',
        });
      } else {
        reset({ type: 'EXPENSE', amount: 0, category: '', description: '' });
      }
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
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
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
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50 placeholder-slate-400"
                placeholder="0.00"
              />
              {errors.amount && <p className="text-brand-rose text-xs mt-1.5 font-medium">{errors.amount.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
            <input
              type="text"
              placeholder="e.g. Software, Payroll, Travel"
              {...register('category')}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50 placeholder-slate-400"
            />
            {errors.category && <p className="text-brand-rose text-xs mt-1.5 font-medium">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Add details about this transaction..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-none placeholder-slate-400"
            />
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
