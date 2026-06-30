import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)
export const useCart = () => useContext(CartContext)

const STORAGE_KEY = 'kc_cart'

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  // Load cart from localStorage on mount (only meaningful once a user is present)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // Clear cart automatically on logout
  useEffect(() => {
    if (!user) {
      setItems([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  // item: { id, type ('artist'|'event'|'product'|'service'), name, price, currency, image, country, qty }
  // Returns { success, requiresLogin } so callers can redirect appropriately
  const addItem = (item) => {
    if (!user) return { success: false, requiresLogin: true }

    setItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.type === item.type)
      if (existing) {
        return prev.map(i => i.id === item.id && i.type === item.type ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...item, qty: 1 }]
    })
    return { success: true }
  }

  const removeItem = (id, type) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.type === type)))
  }

  const updateQty = (id, type, qty) => {
    if (qty < 1) return removeItem(id, type)
    setItems(prev => prev.map(i => i.id === id && i.type === type ? { ...i, qty } : i))
  }

  const clearCart = () => setItems([])

  const count = items.reduce((sum, i) => sum + i.qty, 0)
  const total = items.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0)
  const currency = items[0]?.currency || '£'

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, count, total, currency, isLoggedIn: !!user }}>
      {children}
    </CartContext.Provider>
  )
}