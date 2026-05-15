'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isConfirming?: boolean;
}

export function ConfirmDialog({ isOpen, onOpenChange, title, description, onConfirm, isConfirming }: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{description}</p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isConfirming}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-rose hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {isConfirming && <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-4 h-4"></span>}
            Confirm Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
