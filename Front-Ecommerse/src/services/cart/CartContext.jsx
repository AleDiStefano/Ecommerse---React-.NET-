import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { AuthenticationContext } from '../authentication/AuthenticationContext'

export const CartContext = createContext({})

const STORAGE_KEY = 'cart'
const toInt = (n) => Math.max(0, Math.floor(Number(n)) || 0)

// Único lugar donde nace un ítem: exige id y precio finito, y deja la cantidad en 1..stock.
// Devuelve null si no hay nada válido para agregar (producto incompleto o sin stock).
const toItem = (product, quantity) => {
  const price = Number(product?.price)
  const stock = toInt(product?.stock)
  const clamped = Math.min(toInt(quantity), stock)
  if (product?.id == null || !Number.isFinite(price) || clamped < 1) return null
  return { id: product.id, name: String(product.name ?? ''), price, image: product.image ?? '', stock, quantity: clamped }
}

// Lectura segura y revalidada: el storage puede estar corrupto o manipulado.
const readStoredCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(stored) ? stored.map((item) => toItem(item, item?.quantity)).filter(Boolean) : []
  } catch {
    return []
  }
}

export const CartContextListProvider = ({ children }) => {
  const { user } = useContext(AuthenticationContext)
  const [items, setItems] = useState(readStoredCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* sin storage el carrito sigue en memoria */
    }
  }, [items])

  // El carrito es de quien inició sesión: se vacía al cerrarla o al entrar con otra cuenta.
  const userId = user?.id ?? null
  const lastUserId = useRef(userId)
  useEffect(() => {
    if (lastUserId.current !== null && lastUserId.current !== userId) setItems([])
    lastUserId.current = userId
  }, [userId])

  // Devuelve las unidades de ese producto que quedaron en el carrito (con tope en `stock`).
  const addItem = (product, qty = 1) => {
    const existing = items.find((item) => item.id === product?.id)
    const current = existing?.quantity ?? 0
    if (product?.avaible === false) return current
    const next = toItem(product, current + Math.max(1, toInt(qty)))
    if (!next) return current
    setItems(existing ? items.map((item) => (item === existing ? next : item)) : [...items, next])
    return next.quantity
  }

  const setQuantity = (id, qty) =>
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.min(Math.max(1, toInt(qty)), item.stock) } : item)),
    )

  const removeItem = (id) => setItems((prev) => prev.filter((item) => item.id !== id))

  const clear = () => setItems([])

  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, count, total, addItem, setQuantity, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export default CartContextListProvider
