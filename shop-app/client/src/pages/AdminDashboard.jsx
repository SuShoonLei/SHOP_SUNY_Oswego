import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiJson } from '../api.js'

function startOfWeek(d) {
  const x = new Date(d)
  const day = x.getDay()
  const diff = (day + 6) % 7
  x.setDate(x.getDate() - diff)
  x.setHours(0, 0, 0, 0)
  return x
}

function AdminDashboard() {
  const [items, setItems] = useState([])
  const [transactions, setTransactions] = useState([])
  const [students, setStudents] = useState([])
  const [detailCounts, setDetailCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const [it, tx, st] = await Promise.all([
          apiJson('/items'),
          apiJson('/transactions'),
          apiJson('/students'),
        ])
        if (cancelled) return
        const listTx = Array.isArray(tx) ? tx : []
        const listIt = Array.isArray(it) ? it : []
        const listSt = Array.isArray(st) ? st : []
        setItems(listIt)
        setTransactions(listTx)
        setStudents(listSt)

        const sorted = [...listTx].sort((a, b) => {
          const da = new Date(a.date_time).getTime()
          const db = new Date(b.date_time).getTime()
          return db - da
        })
        const recent = sorted.slice(0, 8)
        const counts = {}
        await Promise.all(
          recent.map(async (t) => {
            try {
              const row = await apiJson(`/transactions/${t.transaction_id}`)
              counts[t.transaction_id] = Array.isArray(row?.items) ? row.items.length : 0
            } catch {
              counts[t.transaction_id] = 0
            }
          })
        )
        if (!cancelled) setDetailCounts(counts)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const studentMap = useMemo(() => {
    const m = new Map()
    for (const s of students) m.set(s.student_id, s.name)
    return m
  }, [students])

  const weekStart = useMemo(() => startOfWeek(new Date()), [])

  const txThisWeek = useMemo(() => {
    return transactions.filter((t) => {
      const dt = new Date(t.date_time)
      return !Number.isNaN(dt.getTime()) && dt >= weekStart
    }).length
  }, [transactions, weekStart])

  const lowStockCount = useMemo(
    () => items.filter((i) => Number(i.quantity_available) < 5).length,
    [items]
  )

  const recentWithCounts = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      const da = new Date(a.date_time).getTime()
      const db = new Date(b.date_time).getTime()
      return db - da
    })
    return sorted.slice(0, 8)
  }, [transactions])

  if (loading) {
    return (
      <p className="text-slate-600" role="status">
        Loading dashboard…
      </p>
    )
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
        <p className="mt-1 text-slate-600">Overview for pantry operations this week.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-gray-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Total items</p>
          <p className="mt-2 text-3xl font-bold text-pantry-900">{items.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Transactions this week</p>
          <p className="mt-2 text-3xl font-bold text-pantry-900">{txThisWeek}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Low stock items</p>
          <p className="mt-2 text-3xl font-bold text-amber-900">{lowStockCount}</p>
          <p className="mt-2 text-xs text-slate-500">Fewer than 5 units on hand</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">All-time transactions</p>
          <p className="mt-2 text-3xl font-bold text-pantry-900">{transactions.length}</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-gray-100 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Recent transactions</h2>
          <Link
            to="/transactions"
            className="rounded text-sm font-medium text-pantry-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700"
          >
            View all
          </Link>
        </div>
        {recentWithCounts.length === 0 ? (
          <p className="mt-4 text-slate-600">No transactions yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {recentWithCounts.map((t) => (
              <li key={t.transaction_id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div>
                  <span className="font-mono text-sm text-slate-500">#{t.transaction_id}</span>
                  <span className="mx-2 text-slate-300" aria-hidden>
                    ·
                  </span>
                  <span className="font-medium text-slate-900">
                    {studentMap.get(t.student_id) ?? `Student ${t.student_id}`}
                  </span>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <time dateTime={t.date_time}>
                    {new Date(t.date_time).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </time>
                  <div className="text-xs text-slate-500">
                    {detailCounts[t.transaction_id] ?? '—'} item types
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default AdminDashboard
