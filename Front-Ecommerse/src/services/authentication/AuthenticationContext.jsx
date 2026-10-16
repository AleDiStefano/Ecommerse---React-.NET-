import { createContext, useCallback, useState } from 'react'
import { api } from '../api'

export const AuthenticationContext = createContext({})

const STORAGE_KEY = 'user'
const BAD_CREDENTIALS = 'Email o contraseña incorrectos'

// Lectura segura: un valor corrupto en localStorage deja la app como anónima en vez de en blanco.
const readStoredUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEY))?.userSession
    return user && user.id != null && Number.isInteger(user.userType) ? user : null
  } catch {
    return null
  }
}

export const AuthenticationContextProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser)

  // Resuelve con el user; lanza Error (mensaje en español) si las credenciales no valen o el back no responde.
  const login = useCallback(async (email, password) => {
    try {
      await api('/api/User/validate', { method: 'POST', body: { userEmail: email, userPassword: password } })
    } catch (e) {
      // 401 = credenciales; 400 = falta un campo. Red caída y 5xx conservan su propio mensaje.
      throw e.status === 401 || e.status === 400 ? new Error(BAD_CREDENTIALS) : e
    }
    const data = await api(`/api/User/email/${encodeURIComponent(email)}`)
    if (!data) throw new Error('No pudimos iniciar tu sesión. Intentá de nuevo.')

    // Campos explícitos: el back viejo devuelve también `password`, que nunca debe quedar en el storage.
    const { id, name, lastName, userName, adress, userType } = data
    const userSession = { id, name, lastName, email: data.email, userName, adress, userType }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ userSession }))
    } catch {
      /* sin storage la sesión dura hasta recargar la página */
    }
    setUser(userSession)
    return userSession
  }, [])

  // No recarga ni navega: el llamador hace navigate('/') (ver NavBar: navega primero y cierra después).
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* idem */
    }
    setUser(null)
  }, [])

  return <AuthenticationContext.Provider value={{ user, login, logout }}>{children}</AuthenticationContext.Provider>
}

export default AuthenticationContextProvider
