import { Fragment, useEffect, useMemo, useState } from 'react'
import { apiJson } from '../api.js'

function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [students, setStudents] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [txDetails, setTxDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const [tx, st, vol] = await Promise.all([
          apiJson('/transactions'),
          apiJson('/students'),
          apiJson('/volunteers'),
        ])
        if (cancelled) return
        const listTx = Array.isArray(tx) ? tx : []
        setTransactions(listTx)
        setStudents(Array.isArray(st) ? st : [])
        setVolunteers(Array.isArray(vol) ? vol : [])

        const sorted = [...listTx].sort((a, b) => {
          const da = new Date(a.date_time).getTime()
          const db = new Date(b.date_time).getTime()
          return db - da
        })
        const rows = await Promise.all(
          sorted.map((t) => apiJson(`/transactions/${t.transaction_id}`).catch(() => null))
        )
        if (cancelled) return
        const m = {}
        sorted.forEach((t, i) => {
          if (rows[i]) m[t.transaction_id] = rows[i]
        })
        setTxDetails(m)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const sorted = useMemo(
    () =>
      [...transactions].sort((a, b) => {
        const da = new Date(a.date_time).getTime()
        const db = new Date(b.date_time).getTime()
        return db - da
      }),
    [transactions]
  )

  const studentMap = Object.fromEntries(students.map((s) => [s.student_id, s.name]))
  const volunteerMap = Object.fromEntries(volunteers.map((v) => [v.volunteer_id, v.name]))

  function toggleRow(id) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  if (loading) {
    return (
      <p className="text-slate-600" role="status">
        Loading transactions…
      </p>
    )
  }
  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800" role="alert">
        {error}
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <p className="mt-1 text-slate-600">
          Recent checkouts. Select a row to see items in that visit.
        </p>
      </div>

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
                  Volunteer
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-800">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-800">
                  Item count
                </th>
                <th scope="col" className="w-10 px-4 py-3">
                  <span className="sr-only">Expand</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sorted.map((t) => {
                const open = expandedId === t.transaction_id
                const detail = txDetails[t.transaction_id]
                const count =
                  detail && Array.isArray(detail.items) ? detail.items.length : '—'
                return (
                  <Fragment key={t.transaction_id}>
                    <tr
                      className="cursor-pointer hover:bg-gray-50 focus-within:bg-gray-50"
                      onClick={() => toggleRow(t.transaction_id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleRow(t.transaction_id)
                        }
                      }}
                      tabIndex={0}
                      aria-expanded={open}
                      aria-controls={`tx-detail-${t.transaction_id}`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-600">
                        #{t.transaction_id}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {studentMap[t.student_id] ?? `ID ${t.student_id}`}
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {volunteerMap[t.volunteer_id] ?? `ID ${t.volunteer_id}`}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        <time dateTime={t.date_time}>
                          {new Date(t.date_time).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </time>
                      </td>
                      <td className="px-4 py-3 text-slate-800">{count}</td>
                      <td className="px-4 py-3 text-slate-500" aria-hidden>
                        {open ? '▼' : '▶'}
                      </td>
                    </tr>
                    {open && detail ? (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-4 py-4" id={`tx-detail-${t.transaction_id}`}>
                          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                            <table className="min-w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-200 bg-gray-100 text-left">
                                  <th className="px-3 py-2 font-semibold text-slate-800">Item</th>
                                  <th className="px-3 py-2 font-semibold text-slate-800">Category</th>
                                  <th className="px-3 py-2 font-semibold text-slate-800">Qty</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {detail.items.map((it) => (
                                  <tr key={it.item_id}>
                                    <td className="px-3 py-2 font-medium text-slate-900">{it.item_name}</td>
                                    <td className="px-3 py-2 text-slate-600">{it.category}</td>
                                    <td className="px-3 py-2 text-slate-800">{it.quantity}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {detail.notes ? (
                              <p className="border-t border-gray-200 px-3 py-2 text-xs text-slate-600">
                                <span className="font-semibold text-slate-700">Notes:</span> {detail.notes}
                              </p>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 ? (
          <p className="border-t border-gray-200 bg-white px-4 py-6 text-center text-slate-600">
            No transactions yet.
          </p>
        ) : null}
      </section>
    </div>
  )
}

export default TransactionsPage
