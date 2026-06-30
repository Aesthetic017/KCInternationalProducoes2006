import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'

export default function UnsubscribePage() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading') // loading | success | error
  const [email, setEmail] = useState('')

  useEffect(() => {
    axios.get(`/api/unsubscribe/${token}`)
      .then(res => { setEmail(res.data.email); setStatus('success') })
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.13) 0%, transparent 65%), #050A14',
      padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>

        <div style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 20px',
          background: 'linear-gradient(135deg,#2563EB,#1A4A8A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 16, color: '#fff' }}>KC</div>

        <div style={{
          background: 'rgba(13,37,69,0.5)', border: '1px solid rgba(148,163,184,0.12)',
          borderRadius: 20, padding: '36px 28px',
        }}>
          {status === 'loading' && (
            <p style={{ color: '#64748B', fontSize: 14 }}>Processing your request...</p>
          )}

          {status === 'success' && (
            <>
              <FiCheckCircle size={44} style={{ color: '#6EE7B7', marginBottom: 16 }} />
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#F8FAFC', marginBottom: 10 }}>
                You've been unsubscribed
              </h1>
              <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.6 }}>
                <strong style={{ color: '#CBD5E1' }}>{email}</strong> will no longer receive new artist, event, shop, or service announcements from KC International Producoes.
              </p>
              <p style={{ fontSize: 13, color: '#64748B', marginTop: 16 }}>
                Changed your mind? You can re-enable this anytime from your account settings.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <FiXCircle size={44} style={{ color: '#FCA5A5', marginBottom: 16 }} />
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#F8FAFC', marginBottom: 10 }}>
                Link not valid
              </h1>
              <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.6 }}>
                This unsubscribe link is invalid or has already been used.
              </p>
            </>
          )}

          <Link to="/" style={{ display: 'inline-block', marginTop: 24, fontSize: 13, color: '#3B82F6' }}>
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}