import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { AuthenticationContext } from '../authentication/AuthenticationContext'

export const PayMethodContext = createContext({})

export const PayMethodContextProvider = ({ children }) => {
  const { user } = useContext(AuthenticationContext)
  const [payMethod, setPayMethod] = useState(null)

  // Mismo criterio que el carrito: los datos de envío son de la sesión que los cargó.
  const userId = user?.id ?? null
  const lastUserId = useRef(userId)
  useEffect(() => {
    if (lastUserId.current !== null && lastUserId.current !== userId) setPayMethod(null)
    lastUserId.current = userId
  }, [userId])

  // Lista blanca: aunque el form pase todo su estado, número de tarjeta y CVV nunca entran al contexto.
  const handlePayMethod = (value) => {
    if (!value) return setPayMethod(null)
    const { nameAndLastName, email, home, postalCode, selectedMethod } = value
    return setPayMethod({ nameAndLastName, email, home, postalCode, selectedMethod })
  }

  return <PayMethodContext.Provider value={{ payMethod, handlePayMethod }}>{children}</PayMethodContext.Provider>
}

export default PayMethodContextProvider
