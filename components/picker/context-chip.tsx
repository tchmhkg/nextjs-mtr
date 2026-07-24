'use client'

type ContextChipProps = Readonly<{
  lineLabel: string
  stationLabel: string
  lineColor: string
  changeLabel: string
  onChange: () => void
  interchangeLabel?: string
  onInterchange?: () => void
}>

export default function ContextChip({
  lineLabel,
  stationLabel,
  lineColor,
  changeLabel,
  onChange,
  interchangeLabel,
  onInterchange,
}: ContextChipProps) {
  return (
    <div className="sticky top-[calc(50px+env(safe-area-inset-top,0px))] z-20 mb-3 flex items-center gap-2 rounded-lg border border-border bg-surface-alt/95 px-3 py-2 shadow-sm backdrop-blur-sm">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: lineColor }}
        aria-hidden
      />
      <div className="min-w-0 flex-1 truncate text-sm">
        <span className="font-medium text-ink">{lineLabel}</span>
        <span className="text-muted"> · </span>
        <span className="text-ink">{stationLabel}</span>
      </div>
      {onInterchange && interchangeLabel ? (
        <button
          type="button"
          onClick={onInterchange}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-accent hover:underline"
        >
          {interchangeLabel}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted hover:text-ink hover:underline"
      >
        {changeLabel}
      </button>
    </div>
  )
}
