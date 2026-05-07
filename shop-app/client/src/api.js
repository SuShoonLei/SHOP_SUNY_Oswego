/**
 * Optional origin for the Express API when not using the Vite dev/preview proxy
 * (e.g. VITE_API_BASE_URL=http://localhost:3001). Requires CORS on the server.
 */
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const FALLBACK_API_ORIGIN = 'http://localhost:3001'

function apiUrl(path) {
  const p = `/api${path.startsWith('/') ? path : `/${path}`}`
  return API_ORIGIN ? `${API_ORIGIN}${p}` : p
}

function apiUrlWithOrigin(path, origin) {
  const p = `/api${path.startsWith('/') ? path : `/${path}`}`
  return `${origin.replace(/\/$/, '')}${p}`
}

function friendlyHttpError(status, statusText, bodyMessage) {
  if (bodyMessage && String(bodyMessage).trim()) return String(bodyMessage)
  if (status === 404) {
    return (
      'The SHOP API was not found. Start the backend from shop-app/server (npm start), ' +
      'use the same port as VITE_API_PROXY_TARGET (default 3001), and open the site via ' +
      'npm run dev or npm run preview — not as a raw HTML file.'
    )
  }
  if (status === 0 || status >= 502) {
    return 'The SHOP API is unavailable. Check that the server is running and reachable.'
  }
  return statusText || `Request failed (${status})`
}

/**
 * @param {string} path e.g. '/items' (prepends /api)
 * @param {RequestInit & { body?: unknown }} [options]
 */
export async function apiJson(path, options = {}) {
  const method = String(options.method || 'GET').toUpperCase()
  const isReadRequest = method === 'GET' || method === 'HEAD'
  const primaryUrl = apiUrl(path)
  const fallbackUrl =
    !API_ORIGIN && FALLBACK_API_ORIGIN ? apiUrlWithOrigin(path, FALLBACK_API_ORIGIN) : null
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }

  let body = options.body
  if (
    body !== undefined &&
    body !== null &&
    typeof body === 'object' &&
    !(body instanceof FormData) &&
    !(body instanceof Blob)
  ) {
    body = JSON.stringify(body)
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }
  }

  let res
  try {
    res = await fetch(primaryUrl, { ...options, headers, body })
  } catch {}

  if (!res && fallbackUrl) {
    try {
      res = await fetch(fallbackUrl, { ...options, headers, body })
    } catch {}
  }

  if (!res) {
    if (isReadRequest) return []
    throw new Error(
      'Could not connect to the SHOP API. Start the backend in shop-app/server (npm start).'
    )
  }

  if (!res.ok) {
    if (isReadRequest) return []
    let message = ''
    try {
      const data = await res.json()
      if (data?.error) message = data.error
    } catch {
      /* ignore */
    }
    throw new Error(friendlyHttpError(res.status, res.statusText, message))
  }
  if (res.status === 204) return null
  return res.json()
}
