import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { FiCheck } from 'react-icons/fi'
import { getTheme } from '../theme.js'

export default function CheckoutForm({ country, onSuccess, clearCart }) {
  const stripe = useStripe()
  const elements = useElements()
  const t = getTheme(country || 'uk')
  const isAo = country === 'ao'

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError('')

    // confirmPayment talks directly to Stripe's servers — card details never
    // pass through our own backend at any point.
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message)
      setProcessing(false)
      return
    }

    // If we reach here without a redirect, payment succeeded immediately
    clearCart()
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PaymentElement />

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontSize: 13, padding: '9px 13px', borderRadius: 8 }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={!stripe || processing} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: t.btnPrimary, color: t.btnPrimaryColor,
        border: `1px solid ${t.btnPrimaryBorder}`, borderRadius: 10,
        padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
        boxShadow: t.btnPrimaryShadow, opacity: processing ? 0.7 : 1,
      }}>
        {processing ? (isAo ? 'A processar...' : 'Processing...') : <><FiCheck /> {isAo ? 'Pagar Agora' : 'Pay Now'}</>}
      </button>
    </form>
  )
}
