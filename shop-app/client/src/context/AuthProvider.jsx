import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './auth-context.js'

const STORAGE_KEY = 'shop_staff_auth'

function readStored() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export default function AuthProvider({ children }) {
  const [isAuthenticated, setAuthenticated] = useState(readStored)

  const login = useCallback((password) => {
    const raw = import.meta.env.VITE_STAFF_PASSWORD
    const expected =
      raw !== undefined && raw !== null && String(raw).length > 0
        ? String(raw)
        : import.meta.env.DEV
          ? 'shopstaff'
          : ''
    if (!expected) {
      console.warn('Set VITE_STAFF_PASSWORD in .env for production staff login.')
    }
    if (!password || !expected || password !== expected) {
      return false
    }
    sessionStorage.setItem(STORAGE_KEY, 'true')
    setAuthenticated(true)
    return true
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
