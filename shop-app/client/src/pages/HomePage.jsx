import { useEffect, useMemo, useState } from 'react'
import { apiJson } from '../api.js'
import ItemCard from '../components/ItemCard.jsx'

function groupByCategory(items) {
  const map = new Map()
  for (const item of items) {
    const cat = item.category || 'Other'
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat).push(item)
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
}

function HomePage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await apiJson('/items')
        if (!cancelled) setItems(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load inventory')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const grouped = useMemo(() => groupByCategory(items), [items])

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-gray-200 bg-gray-100 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Pantry inventory</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Browse what SHOP currently has in stock. Quantities change often — check back before you
          visit. No account needed.
        </p>
      </section>

      {loading ? (
        <p className="text-slate-600" role="status">
          Loading inventory…
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <p className="text-slate-600">No items listed yet.</p>
      ) : null}

      {grouped.map(([category, list]) => (
        <section key={category} aria-labelledby={`cat-${category}`}>
          <h2 id={`cat-${category}`} className="mb-4 text-lg font-semibold text-pantry-900">
            {category}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((item) => (
              <li key={item.item_id}>
                <ItemCard item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default HomePage
