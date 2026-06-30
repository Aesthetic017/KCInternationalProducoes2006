import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Elements } from '@stripe/react-stripe-js'
import { FiX, FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiCheck } from 'react-icons/fi'
import { useCart } from '../context/CartContext.jsx'
import { getTheme } from '../theme.js'
import { stripePromise } from '../stripe.js'
import CheckoutForm from './CheckoutForm.jsx'

export default function CartDrawer({ country, open, onClose }) {
  const t = getTheme(country || 'uk')
  const { items, removeItem, updateQty, total, currency, clearCart } = useCart()
  const isAo = country === 'ao'

  const [clientSecret, setClientSecret] = useState(null)
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const startCheckout = async () => {
    setError('')
    setLoadingIntent(true)
    try {
      const { data } = await axios.post('/api/payments/create-intent', {
        items: items.map(i => ({
          itemId: i.id, type: i.type, name: i.name,
          price: i.price, currency: i.currency, qty: i.qty, image: i.image || '',
          size: i.size || '',
        })),
        total, currency, country,
      })
      setClientSecret(data.clientSecret)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start checkout')
    } finally {
      setLoadingIntent(false)
    }
  }

  const handleSuccess = () => {
    setDone(true)
    setClientSecret(null)
    setTimeout(() => { setDone(false); onClose() }, 2000)
  }

  const handleClose = () => {
    setClientSecret(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 2001,
              width: '100%', maxWidth: 420,
              background: t.formBg, backdropFilter: 'blur(16px)',
              borderLeft: `1px solid ${t.formBorder}`,
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px', borderBottom: `1px solid ${t.divider}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiShoppingBag style={{ color: t.accentAlt }} />
                <h3 style={{ fontSize: 17, fontWeight: 700, color: t.text }}>
                  {clientSecret ? (isAo ? 'Pagamento' : 'Payment') : (isAo ? 'Carrinho' : 'Your Cart')}
                </h3>
              </div>
              <button onClick={handleClose} style={{ color: t.textMuted, fontSize: 20, padding: 4 }}>
                <FiX />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px' }}>
              {done ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <FiCheck size={44} style={{ color: t.accentAlt, marginBottom: 14 }} />
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>
                    {isAo ? 'Pagamento confirmado!' : 'Payment confirmed!'}
                  </div>
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                  <CheckoutForm country={country} onSuccess={handleSuccess} clearCart={clearCart} />
                </Elements>
              ) : items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: t.textMuted, fontSize: 14 }}>
                  {isAo ? 'O seu carrinho está vazio.' : 'Your cart is empty.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {items.map(item => (
                    <div key={`${item.type}-${item.id}-${item.size || ''}`} style={{
                      display: 'flex', gap: 12, alignItems: 'center',
                      background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                      borderRadius: 12, padding: 12,
                    }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                        background: `${t.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                      }}>
                        {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (item.icon || '🛍️')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>
                          <span style={{ textTransform: 'capitalize' }}>{item.type}</span>
                          {item.size && <span> · Size {item.size}</span>}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: t.accentAlt, marginTop: 4 }}>{item.currency}{item.price}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => updateQty(item.id, item.type, item.size, item.qty - 1)} style={{
                          width: 22, height: 22, borderRadius: 6, background: `${t.accent}22`, color: t.text,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                        }}><FiMinus /></button>
                        <span style={{ fontSize: 13, color: t.text, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.type, item.size, item.qty + 1)} style={{
                          width: 22, height: 22, borderRadius: 6, background: `${t.accent}22`, color: t.text,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                        }}><FiPlus /></button>
                      </div>
                      <button onClick={() => removeItem(item.id, item.type, item.size)} style={{ color: '#FCA5A5', fontSize: 14, padding: 4 }}>
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div style={{ marginTop: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontSize: 13, padding: '10px 14px', borderRadius: 8 }}>
                  {error}
                </div>
              )}
            </div>

            {items.length > 0 && !done && !clientSecret && (
              <div style={{ padding: '18px 22px', borderTop: `1px solid ${t.divider}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 14, color: t.textMuted }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: t.text }}>{currency}{total.toFixed(2)}</span>
                </div>
                <button onClick={startCheckout} disabled={loadingIntent} style={{
                  width: '100%', background: t.btnPrimary, color: t.btnPrimaryColor,
                  border: `1px solid ${t.btnPrimaryBorder}`, borderRadius: 10,
                  padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: t.btnPrimaryShadow, opacity: loadingIntent ? 0.7 : 1,
                }}>
                  {loadingIntent ? (isAo ? 'A preparar...' : 'Preparing...') : (isAo ? 'Continuar para Pagamento' : 'Continue to Payment')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}