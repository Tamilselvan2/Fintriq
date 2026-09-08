'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calculator as CalculatorIcon, Delete } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { evaluateExpression } from '@/lib/calculator';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CalculatorProps {
  onUseResult: (result: number) => void;
  className?: string;
}

export function Calculator({ onUseResult, className }: CalculatorProps) {
  const [expression, setExpression] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);

  const currentResult = evaluateExpression(expression);

  // Auto-scroll expression display
  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [expression]);

  const handlePress = (val: string) => {
    setExpression((prev) => {
      // Prevent multiple decimals in current number
      if (val === '.') {
        const parts = prev.split(/[\+\-\*\/]/);
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.includes('.')) return prev;
      }
      
      // Handle operators
      if (['+', '-', '*', '/'].includes(val)) {
        if (!prev && val !== '-') return prev; // allow negative start if desired, but typically no
        if (prev) {
          const lastChar = prev[prev.length - 1];
          if (['+', '-', '*', '/'].includes(lastChar)) {
            return prev.slice(0, -1) + val;
          }
        }
      }
      
      return prev + val;
    });
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setExpression('');
  };

  const handleUseResult = () => {
    if (currentResult !== null && isFinite(currentResult) && currentResult > 0) {
      onUseResult(currentResult);
      setIsOpen(false);
      setExpression('');
    }
  };

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setExpression('');
    }
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open amount calculator"
          className={cn(
            "flex items-center justify-center p-2 text-slate-400 hover:text-brand-blue transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800",
            className
          )}
        >
          <CalculatorIcon className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4" align="end" sideOffset={8}>
        <div className="space-y-4">
          {/* Display */}
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-right overflow-hidden flex flex-col justify-end">
            <div 
              ref={displayRef}
              className="text-xs font-mono text-slate-500 h-5 overflow-x-auto whitespace-nowrap scrollbar-hide flex items-center justify-end" 
              aria-label="Expression"
            >
              {expression.replace(/\*/g, '×').replace(/\//g, '÷') || '0'}
            </div>
            <div 
              className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate mt-1"
              aria-label="Result"
            >
              {currentResult !== null ? formatCurrency(currentResult) : '—'}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2">
            <button type="button" onClick={handleClear} aria-label="Clear calculator" className="col-span-2 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg transition-colors text-sm">AC</button>
            <button type="button" onClick={handleBackspace} aria-label="Backspace" className="py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg transition-colors flex items-center justify-center"><Delete className="w-4 h-4" /></button>
            <button type="button" onClick={() => handlePress('/')} aria-label="Divide" className="py-3 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue font-semibold rounded-lg transition-colors text-lg">÷</button>
            
            <button type="button" onClick={() => handlePress('7')} className="py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors text-lg">7</button>
            <button type="button" onClick={() => handlePress('8')} className="py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors text-lg">8</button>
            <button type="button" onClick={() => handlePress('9')} className="py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors text-lg">9</button>
            <button type="button" onClick={() => handlePress('*')} aria-label="Multiply" className="py-3 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue font-semibold rounded-lg transition-colors text-lg">×</button>
            
            <button type="button" onClick={() => handlePress('4')} className="py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors text-lg">4</button>
            <button type="button" onClick={() => handlePress('5')} className="py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors text-lg">5</button>
            <button type="button" onClick={() => handlePress('6')} className="py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors text-lg">6</button>
            <button type="button" onClick={() => handlePress('-')} aria-label="Subtract" className="py-3 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue font-semibold rounded-lg transition-colors text-lg">-</button>
            
            <button type="button" onClick={() => handlePress('1')} className="py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors text-lg">1</button>
            <button type="button" onClick={() => handlePress('2')} className="py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors text-lg">2</button>
            <button type="button" onClick={() => handlePress('3')} className="py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors text-lg">3</button>
            <button type="button" onClick={() => handlePress('+')} aria-label="Add" className="py-3 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue font-semibold rounded-lg transition-colors text-lg">+</button>
            
            <button type="button" onClick={() => handlePress('00')} className="py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors text-lg">00</button>
            <button type="button" onClick={() => handlePress('0')} className="py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors text-lg">0</button>
            <button type="button" onClick={() => handlePress('.')} aria-label="Decimal" className="py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors text-lg">.</button>
            <button type="button" onClick={handleUseResult} aria-label="Use Result" disabled={currentResult === null || !isFinite(currentResult) || currentResult <= 0} className="py-3 bg-brand-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:hover:bg-brand-blue flex items-center justify-center text-sm">Use</button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
