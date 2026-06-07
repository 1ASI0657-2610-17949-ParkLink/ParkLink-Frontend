import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-fg hover:bg-primary-hover active:scale-[0.97] shadow-sm',
  secondary:
    'bg-bg-elevated text-fg border border-border hover:border-border-strong hover:bg-bg-subtle active:scale-[0.97]',
  ghost: 'text-fg-muted hover:text-fg hover:bg-bg-subtle',
  outline:
    'border border-border-strong text-fg hover:bg-bg-subtle hover:border-primary active:scale-[0.97]',
  danger:
    'bg-danger text-white hover:opacity-90 active:scale-[0.97] shadow-sm',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2 rounded-lg',
};

/**
 * Curva de easing custom (Emil Kowalski) — strong ease-out.
 * Empieza rápido, termina suave. Sintaxis de arbitrary value de Tailwind 4
 * (estática, sin template literals) para que el JIT la pueda generar.
 */
const EASE_OUT = 'ease-[cubic-bezier(0.23,1,0.32,1)]';

const baseClasses = [
  'inline-flex items-center justify-center font-medium',
  // Transitions específicas (no `transition-all`) — más performante
  'transition-[transform,background-color,border-color,color,opacity] duration-150',
  EASE_OUT,
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
].join(' ');

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        baseClasses,
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}

interface LinkButtonProps extends Omit<LinkProps, 'className'> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}
