import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

const linkBase =
  'rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700 focus-visible:ring-offset-2'

function Navbar() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-pantry-700">
            SUNY Oswego
          </p>
          <NavLink
            to="/"
            className="mt-0.5 block rounded text-xl font-bold text-slate-900 hover:text-pantry-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700 focus-visible:ring-offset-2"
          >
            SHOP
          </NavLink>
          <p className="text-sm text-slate-600">Students Helping Oz Peers · Student food pantry</p>
        </div>
        <nav
          className="flex flex-wrap items-center gap-1 border-t border-gray-100 pt-3 sm:border-0 sm:pt-0"
          aria-label="Main"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-pantry-700 text-white shadow-sm' : 'text-slate-700 hover:bg-gray-100'}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-pantry-700 text-white shadow-sm' : 'text-slate-700 hover:bg-gray-100'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-pantry-700 text-white shadow-sm' : 'text-slate-700 hover:bg-gray-100'}`
            }
          >
            Inventory
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-pantry-700 text-white shadow-sm' : 'text-slate-700 hover:bg-gray-100'}`
            }
          >
            Transactions
          </NavLink>
          <NavLink
            to="/requests"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-pantry-700 text-white shadow-sm' : 'text-slate-700 hover:bg-gray-100'}`
            }
          >
            Requests
          </NavLink>
          <NavLink
            to="/donations"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-pantry-700 text-white shadow-sm' : 'text-slate-700 hover:bg-gray-100'}`
            }
          >
            Donations
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-pantry-700 text-white shadow-sm' : 'text-slate-700 hover:bg-gray-100'}`
            }
          >
            Reports
          </NavLink>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className={`${linkBase} text-slate-700 hover:bg-red-50 hover:text-red-800`}
            >
              Sign out
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-pantry-700 text-white shadow-sm' : 'text-slate-700 hover:bg-gray-100'}`
              }
            >
              Staff login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
