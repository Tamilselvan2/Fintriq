import React from 'react';
import { cn } from '@/lib/utils';

export function Spinner({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <div className={cn("relative inline-block w-5 h-5", className)}>
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="46" fill="none" className="stroke-current opacity-25" strokeWidth="10" />
      </svg>
      <svg 
        className="absolute inset-0 w-full h-full animate-spin" 
        viewBox="0 0 100 100"
        style={{ animationDuration: '1s' }}
        {...props}
      >
        <circle 
          cx="50" 
          cy="50" 
          r="46" 
          fill="none" 
          className="stroke-current opacity-75" 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeDasharray="289" 
          strokeDashoffset="216" 
        />
      </svg>
    </div>
  );
}
