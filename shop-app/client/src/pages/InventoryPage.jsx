import { useCallback, useEffect, useState } from 'react'
import { apiJson } from '../api.js'

function InventoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newQty, setNewQty] = useState('0')

  const [editingId, setEditingId] = useState(null)
  const [editCategory, setEditCategory] = useState('')
  const [editQty, setEditQty] = useState('')

  const load = useCallback(async () => {
    setError('')
    const data = await apiJson('/items')
    setItems(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await load()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load items')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  async function handleAdd(e) {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      const qty = Number.parseInt(newQty, 10)
      await apiJson('/items', {
        method: 'POST',
        body: {
          item_name: newName.trim(),
          category: newCategory.trim(),
          quantity_available: Number.isNaN(qty) ? 0 : qty,
        },
      })
      setNewName('')
      setNewCategory('')
      setNewQty('0')
      setMessage('Item added.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add failed')
    }
  }

  function startEdit(row) {
    setEditingId(row.item_id)
    setEditCategory(row.category)
    setEditQty(String(row.quantity_available))
  }

  async function saveEdit(itemId) {
    setMessage('')
    setError('')
    const qty = Number.parseInt(editQty, 10)
    if (Number.isNaN(qty) || qty < 0) {
      setError('Quantity must be a non-negative integer.')
      return
    }
    try {
      await apiJson(`/items/${itemId}`, {
        method: 'PUT',
        body: {
          category: editCategory.trim(),
          quantity_available: qty,
        },
      })
      setEditingId(null)
      setMessage('Item updated.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function handleDelete(itemId) {
    if (!window.confirm('Delete this item? This cannot be undone if the database allows it.')) {
      return
    }
    setMessage('')
    setError('')
    try {
      await apiJson(`/items/${itemId}`, { method: 'DELETE' })
      setMessage('Item deleted.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  if (loading) {
    return (
      <p className="text-slate-600" role="status">
        Loading inventory…
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <p className="mt-1 text-slate-600">Add, edit quantities and categories, or remove items.</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900" role="status">
          {message}
        </p>
      ) : null}

      <section className="rounded-xl border border-gray-200 bg-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Add item</h2>
        <form className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end" onSubmit={handleAdd}>
          <div className="min-w-[10rem] flex-1">
            <label htmlFor="inv-name" className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="inv-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-pantry-700 focus:outline-none focus:ring-2 focus:ring-pantry-700/30"
              required
            />
          </div>
          <div className="min-w-[8rem] flex-1">
            <label htmlFor="inv-cat" className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <input
              id="inv-cat"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-pantry-700 focus:outline-none focus:ring-2 focus:ring-pantry-700/30"
              required
            />
          </div>
          <div className="w-28">
            <label htmlFor="inv-qty" className="block text-sm font-medium text-slate-700">
              Quantity
            </label>
            <input
              id="inv-qty"
              type="number"
              min={0}
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-pantry-700 focus:outline-none focus:ring-2 focus:ring-pantry-700/30"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-pantry-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pantry-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700 focus-visible:ring-offset-2"
          >
            Add item
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-white">
              <tr className="border-b border-gray-200">
                <th scope="col" className="px-4 py-3 font-semibold text-slate-800">
                  ID
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-800">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-800">
                  Category
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-800">
                  Quantity
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-800">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map((row) => (
                <tr key={row.item_id}>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-600">{row.item_id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.item_name}</td>
                  <td className="px-4 py-3">
                    {editingId === row.item_id ? (
                      <input
                        aria-label={`Category for ${row.item_name}`}
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full min-w-[8rem] rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    ) : (
                      row.category
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === row.item_id ? (
                      <input
                        aria-label={`Quantity for ${row.item_name}`}
                        type="number"
                        min={0}
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    ) : (
                      row.quantity_available
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {editingId === row.item_id ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(row.item_id)}
                          className="rounded-lg bg-pantry-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pantry-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.item_id)}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 ? (
          <p className="border-t border-gray-200 bg-white px-4 py-6 text-center text-slate-600">
            No items yet.
          </p>
        ) : null}
      </section>
    </div>
  )
}

export default InventoryPage
