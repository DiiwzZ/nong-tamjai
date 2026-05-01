import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-primary text-white hover:opacity-90 active:scale-95',
  secondary: 'bg-muted text-foreground hover:bg-muted/80 active:scale-95',
  ghost: 'hover:bg-accent text-foreground active:scale-95',
  destructive: 'bg-destructive text-white hover:opacity-90 active:scale-95',
  outline: 'border border-border bg-card text-foreground hover:bg-accent active:scale-95',
}

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none select-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
