import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (login(password)) {
      navigate(from, { replace: true })
    } else {
      setError('Invalid password. Please try again or contact a SHOP administrator.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-gray-200 bg-pantry-700 px-4 py-6 text-white">
        <div className="mx-auto max-w-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/90">
            SUNY Oswego · SHOP
          </p>
          <h1 className="mt-1 text-2xl font-bold">Staff sign in</h1>
          <p className="mt-2 text-sm text-white/90">
            Sign in to manage inventory, donations, and requests.
          </p>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="rounded-xl border border-gray-200 bg-gray-100 p-6 shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="staff-password" className="block text-sm font-medium text-slate-800">
                Staff password
              </label>
              <input
                id="staff-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-pantry-700 focus:outline-none focus:ring-2 focus:ring-pantry-700/40"
                required
              />
            </div>
            {error ? <p className="text-sm text-slate-600">{error}</p> : null}
            <button
              type="submit"
              className="w-full rounded-lg bg-pantry-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pantry-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-pantry-700 focus-visible:ring-offset-2"
            >
              Sign in
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            <Link to="/" className="font-medium text-pantry-700 underline-offset-2 hover:underline">
              Back to public site
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
