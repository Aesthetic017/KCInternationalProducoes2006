import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiMail, FiCheckCircle } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { forgotPassword } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await forgotPassword(email)
    setLoading(false)
    if (!res.success) { setError(res.error); return }
    setSent(true)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px 12px 40px',
    background: 'rgba(13,37,69,0.6)', border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.13) 0%, transparent 65%), #050A14',
      padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 400 }}>

        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#64748B', fontSize: 13, marginBottom: 24 }}>
          <FiArrowLeft /> Back to Login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg,#2563EB,#1A4A8A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 16, color: '#fff' }}>KC</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC' }}>Forgot Password?</h1>
          <p style={{ fontSize: 14, color: '#64748B', marginTop: 6 }}>
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'rgba(13,37,69,0.5)', border: '1px solid rgba(148,163,184,0.12)',
              borderRadius: 20, padding: '32px 26px', textAlign: 'center' }}
          >
            <FiCheckCircle size={40} style={{ color: '#3B82F6', marginBottom: 14 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>Check your inbox</div>
            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
              If an account exists for <strong style={{ color: '#94A3B8' }}>{email}</strong>, a password reset link is on its way. The link expires in 1 hour.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={submit} style={{
            background: 'rgba(13,37,69,0.5)', border: '1px solid rgba(148,163,184,0.12)',
            borderRadius: 20, padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#FCA5A5', fontSize: 13, padding: '10px 14px', borderRadius: 8 }}>{error}</div>
            )}

            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: 14, top: 13, color: '#475569' }} size={16} />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Your registered email" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.2)'} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', padding: '12px', fontSize: 15, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}