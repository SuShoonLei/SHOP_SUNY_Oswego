import { useCallback, useEffect, useState } from 'react'
import { apiJson } from '../api.js'

function emptyLine() {
  return {
    _id: crypto.randomUUID(),
    item_id: '',
    quantity_received: '',
    expiration_date: '',
  }
}

function DonationsPage() {
  const [donations, setDonations] = useState([])
  const [donors, setDonors] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [donorId, setDonorId] = useState('')
  const [donatedAt, setDonatedAt] = useState('')
  const [lines, setLines] = useState([emptyLine(), emptyLine()])

  const load = useCallback(async () => {
    const [d, dr, it] = await Promise.all([
      apiJson('/donations'),
      apiJson('/donors'),
      apiJson('/items'),
    ])
    setDonations(Array.isArray(d) ? d : [])
    setDonors(Array.isArray(dr) ? dr : [])
    setItems(Array.isArray(it) ? it : [])
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        await load()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  function addLine() {
    setLines((prev) => [...prev, emptyLine()])
  }

  function updateLine(i, field, value) {
    setLines((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: value }
      return next
    })
  }

  function removeLine(i) {
    setLines((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setError('')
    const donor_id = Number.parseInt(donorId, 10)
    if (Number.isNaN(donor_id)) {
      setError('Please select a donor.')
      return
    }
    const payloadItems = []
    for (const row of lines) {
      const item_id = Number.parseInt(row.item_id, 10)
      const quantity_received = Number.parseInt(row.quantity_received, 10)
      if (Number.isNaN(item_id) || Number.isNaN(quantity_received)) continue
      if (quantity_received <= 0) continue
      const exp = row.expiration_date?.trim()
      payloadItems.push({
        item_id,
        quantity_received,
        expiration_date: exp || null,
      })
    }
    if (payloadItems.length === 0) {
      setError('Add at least one item with a valid quantity.')
      return
    }
    try {
      await apiJson('/donations', {
        method: 'POST',
        body: {
          donor_id,
          donated_at: donatedAt ? new Date(donatedAt).toISOString() : null,
          items: payloadItems,
        },
      })
      setMessage('Donation recorded.')
      setDonorId('')
      setDonatedAt('')
      setLines([emptyLine(), emptyLine()])
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed')
    }
  }

  if (loading) {
    return (
      <p className="text-slate-600" role="status">
        Loading donations…
      </p>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Donations</h1>
        <p className="mt-1 text-slate-600">Log incoming donations and review history.</p>
      </div>

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900" role="status">
          {message}
        </p>
      ) : null}

      <section className="rounded-xl border border-gray-200 bg-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Log a donation</h2>
        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="donor" className="block text-sm font-medium text-slate-700">
                Donor
              </label>
              <select
                id="donor"
                required
                value={donorId}
                onChange={(e) => setDonorId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-pantry-700 focus:outline-none focus:ring-2 focus:ring-pantry-700/30"
              >
                <option value="">Select donor…</option>
                {donors.map((d) => (
                  <option key={d.donor_id} value={String(d.donor_id)}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="donated-at" className="block text-sm font-medium text-slate-700">
                Received at (optional)
              </label>
              <input
                id="donated-at"
                type="datetime-local"
                value={donatedAt}
                onChange={(e) => setDonatedAt(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-pantry-700 focus:outline-none focus:ring-2 focus:ring-pantry-700/30"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Items received</h3>
              <button
                type="button"
                onClick={addLine}
                className="text-sm font-medium text-pantry-700 underline-offset-2 hover:underline"
              >
                + Add row
              </button>
            </div>
            <div className="space-y-3">
              {lines.map((row, i) => (
                <div
                  key={row._id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end"
                >
                  <div className="min-w-[10rem] flex-1">
                    <label htmlFor={`item-${i}`} className="block text-xs font-medium text-slate-600">
                      Item
                    </label>
                    <select
                      id={`item-${i}`}
                      value={row.item_id}
                      onChange={(e) => updateLine(i, 'item_id', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
                    >
                      <option value="">Select…</option>
                      {items.map((it) => (
                        <option key={it.item_id} value={String(it.item_id)}>
                          {it.item_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-28">
                    <label htmlFor={`qty-${i}`} className="block text-xs font-medium text-slate-600">
                      Qty
                    </label>
                    <input
                      id={`qty-${i}`}
                      type="number"
                      min={1}
                      value={row.quantity_received}
                      onChange={(e) => updateLine(i, 'quantity_received', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
                    />
                  </div>
                  <div className="min-w-[10rem] flex-1">
                    <label htmlFor={`exp-${i}`} className="block text-xs font-medium text-slate-600">
                      Expiration (optional)
                    </label>
                    <input
                      id={`exp-${i}`}
                      type="date"
                      value={row.expiration_date}
                      onChange={(e) => updateLine(i, 'expiration_date', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
                    />
                  </div>
                  {lines.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-800 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-pantry-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pantry-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700 focus-visible:ring-offset-2"
          >
            Submit donation
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Donation history</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-white">
                <tr className="border-b border-gray-200">
                  <th scope="col" className="px-4 py-3 font-semibold text-slate-800">
                    ID
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-slate-800">
                    Donor
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-slate-800">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {donations.map((d) => (
                  <tr key={d.donation_id}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-600">#{d.donation_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{d.donor_name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      <time dateTime={d.donated_at}>
                        {new Date(d.donated_at).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {donations.length === 0 ? (
            <p className="border-t border-gray-200 bg-white px-4 py-6 text-center text-slate-600">
              No donations recorded yet.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default DonationsPage
