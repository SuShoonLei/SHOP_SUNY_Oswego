import { useCallback, useEffect, useRef, useState } from 'react'
import { apiJson } from '../api.js'

function InventoryPage() {
  const nameInputRef = useRef(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newQty, setNewQty] = useState('0')

  const [editingId, setEditingId] = useState(null)
  const [editCategory, setEditCategory] = useState('')
  const [editQty, setEditQty] = useState('')

  const fetchItems = useCallback(async () => {
    const data = await apiJson('/items')
    setItems(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        await fetchItems()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load items')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [fetchItems])

  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(() => setMessage(''), 5000)
    return () => window.clearTimeout(t)
  }, [message])

  async function handleRefresh() {
    setRefreshing(true)
    setError('')
    try {
      await fetchItems()
      setMessage('Inventory refreshed.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh inventory')
    } finally {
      setRefreshing(false)
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    setMessage('')
    setError('')
    const name = newName.trim()
    const category = newCategory.trim()
    const qty = Number.parseInt(String(newQty).trim(), 10)
    if (!name) {
      setError('Please enter an item name.')
      nameInputRef.current?.focus()
      return
    }
    if (!category) {
      setError('Please enter a category.')
      return
    }
    if (Number.isNaN(qty) || qty < 0 || !Number.isFinite(qty)) {
      setError('Quantity must be a whole number, zero or greater.')
      return
    }
    setBusy(true)
    try {
      await apiJson('/items', {
        method: 'POST',
        body: {
          item_name: name,
          category,
          quantity_available: qty,
        },
      })
      setNewName('')
      setNewCategory('')
      setNewQty('0')
      setMessage('Item added.')
      try {
        await fetchItems()
      } catch (reloadErr) {
        setMessage('')
        setError(
          reloadErr instanceof Error
            ? `${reloadErr.message} If the item was created, use “Refresh list” below.`
            : 'Could not reload the list.'
        )
      }
      nameInputRef.current?.focus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add item.')
    } finally {
      setBusy(false)
    }
  }

  function startEdit(row) {
    setError('')
    setMessage('')
    setEditingId(row.item_id)
    setEditCategory(row.category ?? '')
    setEditQty(String(row.quantity_available ?? 0))
  }

  async function saveEdit(itemId) {
    setMessage('')
    setError('')
    const category = editCategory.trim()
    const qty = Number.parseInt(String(editQty).trim(), 10)
    if (!category) {
      setError('Category cannot be empty.')
      return
    }
    if (Number.isNaN(qty) || qty < 0 || !Number.isFinite(qty)) {
      setError('Quantity must be a whole number, zero or greater.')
      return
    }
    setBusy(true)
    try {
      await apiJson(`/items/${itemId}`, {
        method: 'PUT',
        body: {
          category,
          quantity_available: qty,
        },
      })
      setEditingId(null)
      setMessage('Item updated.')
      try {
        await fetchItems()
      } catch (reloadErr) {
        setMessage('')
        setError(
          reloadErr instanceof Error
            ? `${reloadErr.message} If changes were saved, use “Refresh list”.`
            : 'Could not reload the list.'
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update item.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(itemId) {
    if (!window.confirm('Delete this item? This cannot be undone if the database allows it.')) {
      return
    }
    setMessage('')
    setError('')
    setBusy(true)
    try {
      await apiJson(`/items/${itemId}`, { method: 'DELETE' })
      setMessage('Item deleted.')
      try {
        await fetchItems()
      } catch (reloadErr) {
        setMessage('')
        setError(
          reloadErr instanceof Error
            ? `${reloadErr.message} If the item was removed, use “Refresh list”.`
            : 'Could not reload the list.'
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete item.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-slate-600" role="status">
          Loading inventory…
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="mt-1 text-slate-600">Add, edit quantities and categories, or remove items.</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || busy}
          className="shrink-0 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700"
        >
          {refreshing ? 'Refreshing…' : 'Refresh list'}
        </button>
      </div>

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900" role="status">
          {message}
        </p>
      ) : null}

      <section className="rounded-xl border border-gray-200 bg-gray-100 p-6 shadow-sm" aria-labelledby="add-item-heading">
        <h2 id="add-item-heading" className="text-lg font-semibold text-slate-900">
          Add item
        </h2>
        <form className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end" onSubmit={handleAdd} noValidate>
          <div className="min-w-[10rem] flex-1">
            <label htmlFor="inv-name" className="block text-sm font-medium text-slate-700">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="inv-name"
              name="item_name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-pantry-700 focus:outline-none focus:ring-2 focus:ring-pantry-700/30"
              disabled={busy}
            />
          </div>
          <div className="min-w-[8rem] flex-1">
            <label htmlFor="inv-cat" className="block text-sm font-medium text-slate-700">
              Category <span className="text-red-600">*</span>
            </label>
            <input
              id="inv-cat"
              name="category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-pantry-700 focus:outline-none focus:ring-2 focus:ring-pantry-700/30"
              disabled={busy}
            />
          </div>
          <div className="w-28">
            <label htmlFor="inv-qty" className="block text-sm font-medium text-slate-700">
              Quantity
            </label>
            <input
              id="inv-qty"
              name="quantity"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-pantry-700 focus:outline-none focus:ring-2 focus:ring-pantry-700/30"
              disabled={busy}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="rounded-lg bg-pantry-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pantry-900 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700 focus-visible:ring-offset-2"
          >
            {busy ? 'Adding…' : 'Add item'}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm" aria-label="Inventory table">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <caption className="sr-only">Pantry items with id, name, category, quantity, and actions</caption>
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
                        disabled={busy}
                        className="w-full min-w-[8rem] rounded border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100"
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
                        step={1}
                        inputMode="numeric"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        disabled={busy}
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100"
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
                          disabled={busy}
                          className="rounded-lg bg-pantry-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pantry-900 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          disabled={busy}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          disabled={busy}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700 disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.item_id)}
                          disabled={busy}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-60"
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
            No items yet. Use the form above to add your first item.
          </p>
        ) : null}
      </section>
    </div>
  )
}

export default InventoryPage
