import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'error';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-[12px] font-medium',
        {
          'bg-[#F4F4F5] text-[#71717A]': variant === 'default',
          'bg-[#F0FDF4] text-[#16A34A]': variant === 'success',
          'bg-[#FFFBEB] text-[#D97706]': variant === 'warning',
          'bg-[#FEF2F2] text-[#DC2626]': variant === 'danger' || variant === 'error',
          'bg-[#EFF6FF] text-[#2563EB]': variant === 'info',
        },
        className
      )}
      {...props}
    />
  );
}
