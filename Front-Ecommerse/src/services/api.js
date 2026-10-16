// Único lugar que conoce la URL del back. `||` y no `??`: un .env con VITE_API_URL vacío cae al default.
export const API_URL = (import.meta.env.VITE_API_URL || 'https://localhost:7197').replace(/\/+$/, '')

const NETWORK_ERROR = 'No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.'
const SERVER_ERROR = 'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'

// Mensaje legible del cuerpo de un error: texto plano, ProblemDetails (primer error de validación o title) o { message }.
const messageOf = (body) => {
  if (typeof body === 'string') return body.trim()
  const firstError = body?.errors && Object.values(body.errors).flat()[0]
  return firstError || body?.message || body?.title || ''
}

const fail = (message, status) => Object.assign(new Error(message), { status })

/**
 * Llamada JSON al back. Resuelve con el cuerpo parseado, o `null` si viene vacío (200/204 sin cuerpo).
 * Rechaza con un Error en español y `.status` (0 = sin red; 4xx = mensaje del back; 5xx = mensaje genérico,
 * nunca el cuerpo: en Development trae el stack trace). Un abort rechaza con el AbortError original.
 * `path` lleva el `encodeURIComponent` de sus partes dinámicas.
 */
// shortcut: sin header Authorization (el back todavía no autentica); cuando haya JWT se agrega acá.
export async function api(path, { method = 'GET', body, signal } = {}) {
  let res
  let text
  try {
    res = await fetch(`${API_URL}${path.startsWith('/') ? '' : '/'}${path}`, {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    text = await res.text()
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw fail(NETWORK_ERROR, 0)
  }

  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }
  if (!res.ok) {
    throw fail(res.status >= 500 ? SERVER_ERROR : messageOf(data) || `Error ${res.status}`, res.status)
  }
  return data
}
