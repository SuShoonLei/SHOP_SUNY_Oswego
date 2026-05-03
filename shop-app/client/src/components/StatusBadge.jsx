const requestStyles = {
  Pending: 'bg-amber-100 text-amber-900 ring-amber-200',
  Fulfilled: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
  'Partially Fulfilled': 'bg-sky-100 text-sky-900 ring-sky-200',
  Cancelled: 'bg-slate-200 text-slate-800 ring-slate-300',
}

/**
 * @param {{ variant: 'request' | 'stock', status?: string, quantity?: number, className?: string }} props
 */
function StatusBadge({ variant, status, quantity, className = '' }) {
  if (variant === 'stock') {
    const q = Number(quantity)
    if (q === 0) {
      return (
        <span
          className={`inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-900 ring-1 ring-inset ring-red-200 ${className}`}
        >
          Out of stock
        </span>
      )
    }
    if (q < 5) {
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-200 ${className}`}
        >
          Low stock
        </span>
      )
    }
    return (
      <span
        className={`inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-pantry-900 ring-1 ring-inset ring-emerald-200 ${className}`}
      >
        In stock
      </span>
    )
  }

  const key = status ?? ''
  const style = requestStyles[key] ?? 'bg-slate-100 text-slate-800 ring-slate-200'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style} ${className}`}
    >
      {key || 'Unknown'}
    </span>
  )
}

export default StatusBadge
