import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiJson } from '../api.js'
import StatusBadge from '../components/StatusBadge.jsx'

const FILTERS = ['All', 'Pending', 'Fulfilled', 'Partially Fulfilled', 'Cancelled']

function RequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [updatingId, setUpdatingId] = useState(null)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const data = await apiJson('/requests')
    setRequests(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        await load()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load requests')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  const filtered = useMemo(() => {
    if (filter === 'All') return requests
    return requests.filter((r) => r.status === filter)
  }, [requests, filter])

  async function updateStatus(requestId, status) {
    setMessage('')
    setError('')
    setUpdatingId(requestId)
    try {
      await apiJson(`/requests/${requestId}/status`, {
        method: 'PATCH',
        body: { status },
      })
      setMessage(`Request #${requestId} updated.`)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <p className="text-slate-600" role="status">
        Loading requests…
      </p>
    )
  }
  if (error && requests.length === 0) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800" role="alert">
        {error}
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Requests</h1>
          <p className="mt-1 text-slate-600">Filter and update request status.</p>
        </div>
        <div>
          <label htmlFor="req-filter" className="block text-sm font-medium text-slate-700">
            Status filter
          </label>
          <select
            id="req-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-pantry-700 focus:outline-none focus:ring-2 focus:ring-pantry-700/30"
          >
            {FILTERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
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

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-white">
              <tr className="border-b border-gray-200">
                <th scope="col" className="px-4 py-3 font-semibold text-slate-800">
                  ID
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-800">
                  Student
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-800">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-800">
                  Update
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filtered.map((r) => (
                <tr key={r.request_id}>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-600">#{r.request_id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{r.student_name ?? '—'}</div>
                    <div className="text-xs text-slate-500">{r.student_email ?? ''}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant="request" status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <label htmlFor={`status-${r.request_id}`} className="sr-only">
                      Update status for request {r.request_id}
                    </label>
                    <select
                      id={`status-${r.request_id}`}
                      value={r.status}
                      disabled={updatingId === r.request_id}
                      onChange={(e) => updateStatus(r.request_id, e.target.value)}
                      className="max-w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-pantry-700 focus:outline-none focus:ring-2 focus:ring-pantry-700/30 disabled:opacity-50"
                    >
                      {FILTERS.filter((f) => f !== 'All').map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <p className="border-t border-gray-200 bg-white px-4 py-6 text-center text-slate-600">
            No requests match this filter.
          </p>
        ) : null}
      </section>
    </div>
  )
}

export default RequestsPage
