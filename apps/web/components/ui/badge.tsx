import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-500 text-white',
        secondary: 'border-transparent bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
        destructive: 'border-transparent bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        outline: 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300',
        success: 'border-transparent bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        warning: 'border-transparent bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
