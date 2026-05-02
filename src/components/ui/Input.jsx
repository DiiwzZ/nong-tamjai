import { useId } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, label, error, id: externalId, ...props }) {
  const autoId = useId()
  const id = externalId || autoId

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'h-11 w-full rounded-xl border border-border bg-card px-3 text-foreground text-[16px] placeholder:text-muted-foreground',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary',
          'transition-[border-color,background-color,box-shadow] duration-150',
          error && 'border-destructive focus-visible:ring-destructive/30',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function Textarea({ className, label, error, id: externalId, ...props }) {
  const autoId = useId()
  const id = externalId || autoId

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-foreground text-[16px] placeholder:text-muted-foreground resize-none',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary',
          'transition-[border-color,background-color,box-shadow] duration-150',
          error && 'border-destructive',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
