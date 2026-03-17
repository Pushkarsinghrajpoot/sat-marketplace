import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-[38px] w-full rounded-md border border-[#D1D5DB] bg-white px-3 text-[14px] text-[#09090B] placeholder:text-[#A1A1AA] focus-visible:outline-none focus-visible:border-[#6366F1] focus-visible:ring-3 focus-visible:ring-[#6366F1]/12 disabled:cursor-not-allowed disabled:opacity-50 transition-all file:border-0 file:bg-transparent file:text-[14px] file:font-medium',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
