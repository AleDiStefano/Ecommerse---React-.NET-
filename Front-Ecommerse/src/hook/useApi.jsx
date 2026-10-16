import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'

/**
 * GET con estado: { data, error, loading, setData, reload }. `path` falsy = no pide nada.
 * Mientras `loading`, `data` es null. "No encontrado" = 404 o cuerpo vacío (el back viejo responde 204):
 * en ambos casos queda { data: null, error: null, loading: false }. Cancela el request al desmontar o al cambiar `path`.
 */
export const useApi = (path) => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(Boolean(path))
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setData(null)
    setError(null)
    setLoading(Boolean(path))
    if (!path) return undefined

    const controller = new AbortController()
    const { signal } = controller
    api(path, { signal })
      .then((result) => !signal.aborted && setData(result))
      .catch((e) => !signal.aborted && e.status !== 404 && setError(e))
      .finally(() => !signal.aborted && setLoading(false))
    return () => controller.abort()
  }, [path, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  return { data, error, loading, setData, reload }
}
