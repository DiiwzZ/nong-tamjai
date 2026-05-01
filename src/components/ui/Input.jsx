import { cn } from '@/lib/utils'

export function Input({ className, label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <input
        className={cn(
          'h-11 w-full rounded-xl border border-border bg-card px-3 text-foreground text-sm placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          'transition-all duration-150',
          error && 'border-destructive focus:ring-destructive/30',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function Textarea({ className, label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <textarea
        className={cn(
          'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-foreground text-sm placeholder:text-muted-foreground resize-none',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          'transition-all duration-150',
          error && 'border-destructive',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
