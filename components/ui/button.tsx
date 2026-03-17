import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6366F1]/12 disabled:cursor-not-allowed disabled:opacity-45',
          {
            'bg-[#6366F1] text-white hover:bg-[#4F46E5]': variant === 'primary',
            'bg-white border border-[#D1D5DB] text-[#374151] hover:bg-[#F9F9F9]': variant === 'secondary' || variant === 'outline',
            'text-[#6366F1] hover:bg-[#EEF2FF]': variant === 'ghost',
            'bg-[#EF4444] text-white hover:bg-[#DC2626]': variant === 'danger' || variant === 'destructive',
          },
          {
            'h-[30px] px-3 text-[13px]': size === 'sm',
            'h-[36px] px-4 text-[14px]': size === 'md',
            'h-[42px] px-6 text-[15px]': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
