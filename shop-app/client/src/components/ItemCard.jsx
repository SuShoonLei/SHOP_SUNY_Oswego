import StatusBadge from './StatusBadge.jsx'

/**
 * @param {{ item: { item_id: number, item_name: string, category: string, quantity_available: number } }} props
 */
function ItemCard({ item }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-gray-200 bg-gray-100 p-4 shadow-sm transition hover:border-pantry-700/30 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">{item.item_name}</h3>
        <StatusBadge variant="stock" quantity={item.quantity_available} />
      </div>
      <p className="mt-3">
        <span className="inline-flex rounded-md bg-pantry-700/10 px-2 py-0.5 text-xs font-medium text-pantry-900 ring-1 ring-pantry-700/20">
          {item.category}
        </span>
      </p>
      <p className="mt-auto pt-4 text-sm text-slate-600">
        <span className="font-medium text-slate-800">{item.quantity_available}</span> available
      </p>
    </article>
  )
}

export default ItemCard
