# 🛒 SHOP — Students Helping Oz Peers

A full-stack web application for the **SUNY Oswego student food pantry** that manages inventory, transactions, donations, and student requests.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite), React Router v6, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Language | JavaScript (ES6+) |

---

## Project Structure

```
shop-app/
├── client/
│   └── src/
│       ├── context/
│       │   ├── AuthProvider.jsx     # Auth context provider
│       │   └── useAuth.js           # Auth hook
│       ├── layouts/
│       │   └── RootLayout.jsx       # Shared page shell with Navbar
│       ├── pages/
│       │   ├── HomePage.jsx         # Public inventory browser
│       │   ├── LoginPage.jsx        # Staff login
│       │   ├── AdminDashboard.jsx   # Summary stats + recent transactions
│       │   ├── InventoryPage.jsx    # Add / edit / delete items
│       │   ├── TransactionsPage.jsx # Expandable checkout history
│       │   ├── RequestsPage.jsx     # Filter and update request status
│       │   ├── DonationsPage.jsx    # Log donations + history
│       │   └── ReportsPage.jsx      # SQL-backed reports
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ItemCard.jsx
│       │   ├── StatusBadge.jsx
│       │   └── ProtectedRoute.jsx
│       ├── api.js                   # Shared fetch helper
│       ├── App.jsx                  # Route definitions
│       └── main.jsx                 # App entry point
│
├── server/
│   ├── routes/
│   │   ├── items.js
│   │   ├── students.js
│   │   ├── transactions.js
│   │   ├── requests.js
│   │   ├── donations.js
│   │   ├── volunteers.js
│   │   └── reports.js
│   ├── db/
│   │   ├── db.js          # PostgreSQL connection pool
│   │   ├── schema.sql     # All 13 table definitions
│   │   └── seed.sql       # Sample data
│   └── server.js
│
└── README.md
```

---

## Pages

| Page | Route | Access |
|------|-------|--------|
| Inventory browser | `/` | Public |
| Staff login | `/login` | Public |
| Admin dashboard | `/dashboard` | Staff only |
| Inventory manager | `/inventory` | Staff only |
| Transactions | `/transactions` | Staff only |
| Requests | `/requests` | Staff only |
| Donations | `/donations` | Staff only |
| Reports | `/reports` | Staff only |

> The home page is intentionally public — no login required — to reduce stigma for students.

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 14+

### 1. Clone the repo

```bash
git clone https://github.com/your-username/suny-oswego-shop.git
cd suny-oswego-shop
```

### 2. Set up the database

```bash
psql -U your_user -d your_db -f server/db/schema.sql
psql -U your_user -d your_db -f server/db/seed.sql
```

### 3. Configure environment variables

```bash
cp server/.env.example server/.env
```

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shop_db
DB_USER=your_user
DB_PASSWORD=your_password
PORT=5000
```

Add this to `client/.env` for the staff login password:

```env
VITE_STAFF_PASSWORD=shopstaff
```

### 4. Install and run

```bash
# Backend
cd server
npm install
npm start

# Frontend (new terminal)
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | All inventory items |
| POST | `/api/items` | Add item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |
| GET | `/api/transactions` | All transactions |
| GET | `/api/transactions/:id` | Transaction with items |
| POST | `/api/transactions` | New checkout (decrements inventory) |
| GET | `/api/requests` | All requests |
| PATCH | `/api/requests/:id/status` | Update request status |
| GET | `/api/donations` | All donations |
| POST | `/api/donations` | Log donation (increments inventory) |
| GET | `/api/reports/low-stock` | Items with qty < 5 |
| GET | `/api/reports/top-requested` | Top 5 most requested items |
| GET | `/api/reports/volunteer-activity` | Transactions per volunteer |
| GET | `/api/reports/student-transactions/:id` | Full checkout history for a student |
| GET | `/api/reports/donation-summary` | Donation totals per donor |

---

## Features

- 📦 Public inventory browser — no login required
- 🔒 Staff-only routes protected via `ProtectedRoute` + `AuthProvider`
- 🛒 Checkout logging that auto-decrements inventory
- 🎁 Donation logging that auto-increments inventory
- 📋 Request tracking with filterable status updates
- 📊 Five SQL-backed reports with expandable sections
- 📱 Responsive layout with Tailwind CSS

---
