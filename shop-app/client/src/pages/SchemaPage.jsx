const schemaTables = [
  {
    name: 'STUDENT',
    columns: [
      { name: 'student_id', type: 'INT', badges: ['PK'] },
      { name: 'name', type: 'VARCHAR', badges: ['NOT NULL'] },
      { name: 'email', type: 'VARCHAR', badges: ['NOT NULL'] },
      { name: 'phone_number', type: 'VARCHAR', badges: [] },
      { name: 'dietary_restrictions', type: 'TEXT', badges: [] },
    ],
  },
  {
    name: 'CATEGORY',
    columns: [
      { name: 'category_id', type: 'SERIAL', badges: ['PK'] },
      { name: 'category_name', type: 'VARCHAR', badges: ['NOT NULL'] },
      { name: 'description', type: 'TEXT', badges: [] },
    ],
  },
  {
    name: 'ITEM',
    columns: [
      { name: 'item_id', type: 'SERIAL', badges: ['PK'] },
      { name: 'item_name', type: 'VARCHAR', badges: ['NOT NULL'] },
      { name: 'category_id', type: 'INT', badges: ['FK'] },
      { name: 'quantity_available', type: 'INT', badges: ['NOT NULL'] },
    ],
  },
  {
    name: 'DONOR',
    columns: [
      { name: 'donor_id', type: 'SERIAL', badges: ['PK'] },
      { name: 'name', type: 'VARCHAR', badges: ['NOT NULL'] },
      { name: 'email', type: 'VARCHAR', badges: [] },
      { name: 'phone_number', type: 'VARCHAR', badges: [] },
    ],
  },
  {
    name: 'DONATION',
    columns: [
      { name: 'donation_id', type: 'SERIAL', badges: ['PK'] },
      { name: 'donor_id', type: 'INT', badges: ['FK', 'NOT NULL'] },
      { name: 'donated_at', type: 'TIMESTAMP', badges: ['NOT NULL'] },
    ],
  },
  {
    name: 'DONATION_ITEM',
    columns: [
      { name: 'donation_id', type: 'INT', badges: ['PK', 'FK'] },
      { name: 'item_id', type: 'INT', badges: ['PK', 'FK'] },
      { name: 'quantity_received', type: 'INT', badges: ['NOT NULL'] },
      { name: 'expiration_date', type: 'DATE', badges: [] },
    ],
  },
  {
    name: 'REQUEST',
    columns: [
      { name: 'request_id', type: 'SERIAL', badges: ['PK'] },
      { name: 'student_id', type: 'INT', badges: ['FK', 'NOT NULL'] },
      { name: 'status', type: 'VARCHAR', badges: ['NOT NULL'] },
    ],
  },
  {
    name: 'REQUEST_ITEM',
    columns: [
      { name: 'request_id', type: 'INT', badges: ['PK', 'FK'] },
      { name: 'item_id', type: 'INT', badges: ['PK', 'FK'] },
      { name: 'quantity', type: 'INT', badges: ['NOT NULL'] },
    ],
  },
  {
    name: 'TRANSACTION',
    columns: [
      { name: 'transaction_id', type: 'SERIAL', badges: ['PK'] },
      { name: 'student_id', type: 'INT', badges: ['FK', 'NOT NULL'] },
      { name: 'volunteer_id', type: 'INT', badges: ['FK', 'NOT NULL'] },
      { name: 'date_time', type: 'TIMESTAMP', badges: ['NOT NULL'] },
      { name: 'notes', type: 'TEXT', badges: [] },
    ],
  },
  {
    name: 'TRANSACTION_ITEM',
    columns: [
      { name: 'transaction_id', type: 'INT', badges: ['PK', 'FK'] },
      { name: 'item_id', type: 'INT', badges: ['PK', 'FK'] },
      { name: 'quantity', type: 'INT', badges: ['NOT NULL'] },
    ],
  },
  {
    name: 'VOLUNTEER',
    columns: [
      { name: 'volunteer_id', type: 'SERIAL', badges: ['PK'] },
      { name: 'name', type: 'VARCHAR', badges: ['NOT NULL'] },
      { name: 'email', type: 'VARCHAR', badges: ['NOT NULL'] },
      { name: 'phone', type: 'VARCHAR', badges: [] },
      {
        name: 'training_status',
        type: 'VARCHAR CHECK: Not Started/In Progress/Completed',
        badges: [],
      },
    ],
  },
  {
    name: 'VOLUNTEER_SHIFT',
    columns: [
      { name: 'shift_id', type: 'SERIAL', badges: ['PK'] },
      { name: 'volunteer_id', type: 'INT', badges: ['FK', 'NOT NULL'] },
      { name: 'shift_date', type: 'DATE', badges: ['NOT NULL'] },
      { name: 'start_time', type: 'TIME', badges: ['NOT NULL'] },
      { name: 'end_time', type: 'TIME (must be > start_time)', badges: ['NOT NULL'] },
    ],
  },
  {
    name: 'ADMINISTRATOR',
    columns: [
      { name: 'admin_id', type: 'SERIAL', badges: ['PK'] },
      { name: 'name', type: 'VARCHAR', badges: ['NOT NULL'] },
      { name: 'email', type: 'VARCHAR', badges: ['NOT NULL'] },
      { name: 'password', type: 'VARCHAR', badges: ['NOT NULL'] },
      { name: 'phone_number', type: 'VARCHAR', badges: [] },
    ],
  },
  {
    name: 'MANAGES',
    columns: [
      { name: 'admin_id', type: 'INT', badges: ['PK', 'FK'] },
      { name: 'item_id', type: 'INT', badges: ['PK', 'FK'] },
      { name: 'action_type', type: 'VARCHAR CHECK: Add/Update/Remove/Adjust', badges: [] },
      { name: 'action_date', type: 'TIMESTAMP', badges: ['PK', 'NOT NULL'] },
    ],
  },
]

const badgeClassByType = {
  PK: 'bg-pantry-800 text-white',
  FK: 'bg-blue-600 text-white',
  'NOT NULL': 'bg-gray-600 text-white',
}

function SchemaBadge({ type }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeClassByType[type]}`}>
      {type}
    </span>
  )
}

function SchemaPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Database Schema</h1>
        <p className="mt-1 text-slate-600">
          Static ER-style table view for the SHOP system. This page is intentionally read-only.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {schemaTables.map((table) => (
          <article key={table.name} className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <header className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-bold text-pantry-700">{table.name}</h2>
            </header>

            <div className="divide-y divide-gray-100">
              {table.columns.map((column) => (
                <div
                  key={`${table.name}-${column.name}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">{column.name}</p>
                    <p className="text-sm text-slate-600">{column.type}</p>
                  </div>
                  {column.badges.length ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {column.badges.map((badge) => (
                        <SchemaBadge key={`${table.name}-${column.name}-${badge}`} type={badge} />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default SchemaPage
