import { useCallback, useEffect, useState } from 'react'
import { apiJson } from '../api.js'

const detailsClass =
  'group rounded-xl border border-gray-200 bg-gray-100 shadow-sm open:ring-2 open:ring-pantry-700/20'

const summaryClass =
  'flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-4 py-3 font-semibold text-slate-900 marker:hidden hover:bg-gray-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700 [&::-webkit-details-marker]:hidden'

function ReportTable({ columns, rows, emptyMessage }) {
  if (!rows?.length) {
    return <p className="text-sm text-slate-600">{emptyMessage}</p>
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((c) => (
              <th key={c.key} scope="col" className="px-3 py-2 font-semibold text-slate-800">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.key}>
              {columns.map((c) => (
                <td key={c.key} className="whitespace-nowrap px-3 py-2 text-slate-700">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SqlQueryBlock({ query }) {
  const [showSql, setShowSql] = useState(false)

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setShowSql((v) => !v)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700"
      >
        {showSql ? 'Hide SQL' : 'View SQL'}
      </button>
      {showSql ? (
        <div className="mt-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-pantry-700">SQL Query</p>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-white">
            <code>{query}</code>
          </pre>
        </div>
      ) : null}
    </div>
  )
}

function ReportsPage() {
  const [students, setStudents] = useState([])
  const [studentId, setStudentId] = useState('')

  const [lowStock, setLowStock] = useState([])
  const [topRequested, setTopRequested] = useState([])
  const [volunteerActivity, setVolunteerActivity] = useState([])
  const [donationSummary, setDonationSummary] = useState([])
  const [neverRequested, setNeverRequested] = useState([])
  const [unscheduledVolunteers, setUnscheduledVolunteers] = useState([])
  const [studentTx, setStudentTx] = useState([])

  const [loadingMain, setLoadingMain] = useState(true)
  const [loadingStudent, setLoadingStudent] = useState(false)
  const [error, setError] = useState('')
  const [reportsTick, setReportsTick] = useState(0)

  const loadMainReports = useCallback(async () => {
    const [ls, tr, va, ds, nr, uv, stList] = await Promise.all([
      apiJson('/reports/low-stock'),
      apiJson('/reports/top-requested'),
      apiJson('/reports/volunteer-activity'),
      apiJson('/reports/donation-summary'),
      apiJson('/reports/never-requested'),
      apiJson('/reports/unscheduled-volunteers'),
      apiJson('/students'),
    ])
    setLowStock(Array.isArray(ls) ? ls : [])
    setTopRequested(Array.isArray(tr) ? tr : [])
    setVolunteerActivity(Array.isArray(va) ? va : [])
    setDonationSummary(Array.isArray(ds) ? ds : [])
    setNeverRequested(Array.isArray(nr) ? nr : [])
    setUnscheduledVolunteers(Array.isArray(uv) ? uv : [])
    const list = Array.isArray(stList) ? stList : []
    setStudents(list)
    setStudentId((prev) => {
      if (prev && list.some((s) => String(s.student_id) === prev)) return prev
      return list[0] ? String(list[0].student_id) : ''
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingMain(true)
      setError('')
      try {
        await loadMainReports()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load reports')
      } finally {
        if (!cancelled) setLoadingMain(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadMainReports])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!studentId) {
        if (!cancelled) setStudentTx([])
        return
      }
      setLoadingStudent(true)
      try {
        const data = await apiJson(`/reports/student-transactions/${studentId}`)
        if (!cancelled) setStudentTx(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load student report')
          setStudentTx([])
        }
      } finally {
        if (!cancelled) setLoadingStudent(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [studentId, reportsTick])

  async function refreshAll() {
    setError('')
    setLoadingMain(true)
    try {
      await loadMainReports()
      setReportsTick((t) => t + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refresh failed')
    } finally {
      setLoadingMain(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="mt-1 text-slate-600">
            SQL-backed summaries for pantry planning. Open a section to review data.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshAll}
          disabled={loadingMain}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700 disabled:opacity-50"
        >
          Refresh all
        </button>
      </div>

      {loadingMain ? (
        <p className="text-slate-600" role="status">
          Loading reports…
        </p>
      ) : null}

      <div className="space-y-4">
        <details className={detailsClass}>
          <summary className={summaryClass}>
            <span>Low stock items</span>
            <span className="text-xs font-normal text-slate-500">WHERE + ORDER BY</span>
          </summary>
          <div className="border-t border-gray-200 px-4 pb-4 pt-3">
            <p className="mb-3 text-xs text-slate-500">SQL pattern: WHERE + ORDER BY</p>
            <SqlQueryBlock
              query={`SELECT * FROM ITEM WHERE quantity_available < 5
ORDER BY quantity_available ASC;`}
            />
            <ReportTable
              columns={[
                { key: 'item_id', label: 'ID' },
                { key: 'item_name', label: 'Name' },
                { key: 'category', label: 'Category' },
                { key: 'quantity_available', label: 'Qty' },
              ]}
              rows={lowStock.map((r) => ({ ...r, key: r.item_id }))}
              emptyMessage="No items below 5 units."
            />
          </div>
        </details>

        <details className={detailsClass}>
          <summary className={summaryClass}>
            <span>Top 5 requested items</span>
            <span className="text-xs font-normal text-slate-500">JOIN · GROUP BY · SUM · LIMIT</span>
          </summary>
          <div className="border-t border-gray-200 px-4 pb-4 pt-3">
            <p className="mb-3 text-xs text-slate-500">SQL pattern: JOIN · GROUP BY · SUM · LIMIT</p>
            <SqlQueryBlock
              query={`SELECT i.item_id, i.item_name, SUM(ri.quantity) AS total_requested
FROM REQUEST_ITEM ri
JOIN ITEM i ON ri.item_id = i.item_id
GROUP BY i.item_id, i.item_name
ORDER BY total_requested DESC
LIMIT 5;`}
            />
            <ReportTable
              columns={[
                { key: 'item_id', label: 'ID' },
                { key: 'item_name', label: 'Item' },
                {
                  key: 'total_requested',
                  label: 'Total requested',
                  render: (r) => String(r.total_requested),
                },
              ]}
              rows={topRequested.map((r) => ({ ...r, key: r.item_id }))}
              emptyMessage="No request line items in the database."
            />
          </div>
        </details>

        <details className={detailsClass}>
          <summary className={summaryClass}>
            <span>Volunteer activity</span>
            <span className="text-xs font-normal text-slate-500">JOIN · GROUP BY · COUNT</span>
          </summary>
          <div className="border-t border-gray-200 px-4 pb-4 pt-3">
            <p className="mb-3 text-xs text-slate-500">SQL pattern: JOIN · GROUP BY · COUNT</p>
            <SqlQueryBlock
              query={`SELECT v.volunteer_id, v.name, COUNT(t.transaction_id) AS transaction_count
FROM VOLUNTEER v
LEFT JOIN TRANSACTION t ON v.volunteer_id = t.volunteer_id
GROUP BY v.volunteer_id, v.name
ORDER BY transaction_count DESC;`}
            />
            <ReportTable
              columns={[
                { key: 'name', label: 'Volunteer' },
                {
                  key: 'transaction_count',
                  label: 'Transactions processed',
                  render: (r) => String(r.transaction_count),
                },
              ]}
              rows={volunteerActivity.map((r) => ({ ...r, key: r.volunteer_id }))}
              emptyMessage="No volunteers on file."
            />
          </div>
        </details>

        <details className={detailsClass}>
          <summary className={summaryClass}>
            <span>Student checkout history</span>
            <span className="text-xs font-normal text-slate-500">Multi-table JOIN</span>
          </summary>
          <div className="space-y-4 border-t border-gray-200 px-4 pb-4 pt-3">
            <p className="text-xs text-slate-500">SQL pattern: Multi-table JOIN</p>
            <SqlQueryBlock
              query={`SELECT t.transaction_id, t.date_time, t.notes,
       i.item_id, i.item_name, i.category_id, ti.quantity
FROM TRANSACTION t
JOIN TRANSACTION_ITEM ti ON t.transaction_id = ti.transaction_id
JOIN ITEM i ON ti.item_id = i.item_id
WHERE t.student_id = $1
ORDER BY t.date_time DESC;`}
            />
            <div>
              <label htmlFor="report-student" className="block text-sm font-medium text-slate-700">
                Student
              </label>
              <select
                id="report-student"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="mt-1 max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-pantry-700 focus:outline-none focus:ring-2 focus:ring-pantry-700/30"
              >
                {students.length === 0 ? (
                  <option value="">No students</option>
                ) : (
                  students.map((s) => (
                    <option key={s.student_id} value={String(s.student_id)}>
                      {s.name} ({s.student_id})
                    </option>
                  ))
                )}
              </select>
            </div>
            {loadingStudent ? (
              <p className="text-sm text-slate-600" role="status">
                Loading transactions…
              </p>
            ) : null}
            {!loadingStudent && studentTx.length === 0 ? (
              <p className="text-sm text-slate-600">No transactions for this student.</p>
            ) : null}
            {!loadingStudent &&
              studentTx.map((tx) => (
                <article
                  key={tx.transaction_id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">
                      Transaction #{tx.transaction_id}
                    </h3>
                    <time className="text-sm text-slate-600" dateTime={tx.date_time}>
                      {new Date(tx.date_time).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </time>
                  </div>
                  {tx.notes ? (
                    <p className="mt-2 text-sm text-slate-600">
                      <span className="font-medium text-slate-800">Notes:</span> {tx.notes}
                    </p>
                  ) : null}
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left">
                          <th className="py-1.5 pr-4 font-semibold text-slate-800">Item</th>
                          <th className="py-1.5 pr-4 font-semibold text-slate-800">Category</th>
                          <th className="py-1.5 font-semibold text-slate-800">Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {tx.items.map((it) => (
                          <tr key={it.item_id}>
                            <td className="py-1.5 pr-4 text-slate-800">{it.item_name}</td>
                            <td className="py-1.5 pr-4 text-slate-600">{it.category}</td>
                            <td className="py-1.5 text-slate-800">{it.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              ))}
          </div>
        </details>

        <details className={detailsClass}>
          <summary className={summaryClass}>
            <span>Donation summary by donor</span>
            <span className="text-xs font-normal text-slate-500">JOIN · GROUP BY · COUNT · SUM</span>
          </summary>
          <div className="border-t border-gray-200 px-4 pb-4 pt-3">
            <p className="mb-3 text-xs text-slate-500">SQL pattern: JOIN · GROUP BY · COUNT · SUM</p>
            <SqlQueryBlock
              query={`SELECT d.donor_id, dn.name AS donor_name,
       COUNT(DISTINCT d.donation_id) AS donation_count,
       SUM(di.quantity_received) AS total_items_donated
FROM DONATION d
JOIN DONOR dn ON d.donor_id = dn.donor_id
JOIN DONATION_ITEM di ON d.donation_id = di.donation_id
GROUP BY d.donor_id, dn.name
ORDER BY total_items_donated DESC;`}
            />
            <ReportTable
              columns={[
                { key: 'donor_name', label: 'Donor' },
                {
                  key: 'donation_count',
                  label: 'Donations',
                  render: (r) => String(r.donation_count),
                },
                {
                  key: 'total_items_donated',
                  label: 'Items donated (units)',
                  render: (r) => String(r.total_items_donated),
                },
              ]}
              rows={donationSummary.map((r) => ({ ...r, key: r.donor_id }))}
              emptyMessage="No donors on file."
            />
          </div>
        </details>

        <details className={detailsClass}>
          <summary className={summaryClass}>
            <span>Items never requested</span>
            <span className="text-xs font-normal text-slate-500">LEFT JOIN · IS NULL</span>
          </summary>
          <div className="border-t border-gray-200 px-4 pb-4 pt-3">
            <p className="mb-3 text-sm text-slate-600">
              Items that exist in inventory but have never appeared in any student request. Uses
              LEFT JOIN with IS NULL.
            </p>
            <p className="mb-3 text-xs text-slate-500">SQL pattern: LEFT JOIN + WHERE IS NULL</p>
            <SqlQueryBlock
              query={`SELECT i.item_id, i.item_name
FROM ITEM i
LEFT JOIN REQUEST_ITEM ri ON i.item_id = ri.item_id
WHERE ri.item_id IS NULL;`}
            />
            <ReportTable
              columns={[
                { key: 'item_id', label: 'ID' },
                { key: 'item_name', label: 'Item' },
                { key: 'category_id', label: 'Category ID' },
              ]}
              rows={neverRequested.map((r) => ({ ...r, key: r.item_id }))}
              emptyMessage="Every inventory item has appeared in at least one request."
            />
          </div>
        </details>

        <details className={detailsClass}>
          <summary className={summaryClass}>
            <span>Volunteers with no shifts scheduled</span>
            <span className="text-xs font-normal text-slate-500">LEFT JOIN · IS NULL</span>
          </summary>
          <div className="border-t border-gray-200 px-4 pb-4 pt-3">
            <p className="mb-3 text-sm text-slate-600">
              Volunteers on record who have no shifts scheduled. Uses LEFT JOIN with IS NULL.
            </p>
            <p className="mb-3 text-xs text-slate-500">SQL pattern: LEFT JOIN + WHERE IS NULL</p>
            <SqlQueryBlock
              query={`SELECT v.volunteer_id, v.name, v.training_status
FROM VOLUNTEER v
LEFT JOIN VOLUNTEER_SHIFT vs ON v.volunteer_id = vs.volunteer_id
WHERE vs.volunteer_id IS NULL;`}
            />
            <ReportTable
              columns={[
                { key: 'volunteer_id', label: 'ID' },
                { key: 'name', label: 'Volunteer' },
                { key: 'training_status', label: 'Training status' },
              ]}
              rows={unscheduledVolunteers.map((r) => ({ ...r, key: r.volunteer_id }))}
              emptyMessage="All volunteers currently have at least one shift scheduled."
            />
          </div>
        </details>
      </div>
    </div>
  )
}

export default ReportsPage
