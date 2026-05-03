/**
 * @param {string} path e.g. '/items' (prepends /api)
 * @param {RequestInit & { body?: unknown }} [options]
 */
export async function apiJson(path, options = {}) {
  const url = `/api${path.startsWith('/') ? path : `/${path}`}`
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

  const res = await fetch(url, { ...options, headers, body })
  if (!res.ok) {
    let message = res.statusText
    try {
      const data = await res.json()
      if (data?.error) message = data.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  if (res.status === 204) return null
  return res.json()
}
