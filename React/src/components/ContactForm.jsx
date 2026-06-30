import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiCheck, FiMail } from 'react-icons/fi'
import { getTheme } from '../theme.js'

const TYPES = {
  uk: ['General', 'Artist booking', 'Event enquiry', 'Service enquiry', 'Other'],
  ao: ['Geral', 'Reserva de artista', 'Pergunta sobre evento', 'Pergunta sobre serviço', 'Outro'],
}

export default function ContactForm({ country }) {
  const t = getTheme(country || 'uk')
  const isAo = country === 'ao'
  const types = TYPES[isAo ? 'ao' : 'uk']

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState(types[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(isAo ? 'Por favor preencha o nome, o email e a mensagem.' : 'Please fill in your name, email, and message.')
      return
    }
    setSubmitting(true)
    try {
      await axios.post('/api/interest', {
        name: name.trim(), email: email.trim(), phone: phone.trim(),
        message: message.trim(), type, country,
      })
      setDone(true)
      setName(''); setEmail(''); setPhone(''); setMessage(''); setType(types[0])
    } catch (err) {
      setError(err.response?.data?.message || (isAo ? 'Falha ao enviar.' : 'Failed to submit.'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
    borderRadius: 10, color: t.text, fontSize: 14, outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ maxWidth: 1100, margin: '64px auto 0', padding: '0 24px' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: t.sectionLabel, marginBottom: 8 }}>
          {isAo ? 'Fale connosco' : 'Get in touch'}
        </div>
        <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, color: t.text }}>
          {isAo ? 'Registe o seu interesse' : 'Register your interest'}
        </h2>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{
          background: t.formBg, border: `1px solid ${t.formBorder}`, borderRadius: 18,
          padding: '28px 26px', maxWidth: 520, margin: '0 auto 56px',
        }}
      >
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <FiCheck size={32} style={{ color: t.accentAlt, marginBottom: 10 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>
              {isAo ? 'Obrigado! Entraremos em contacto em breve.' : 'Thank you! We will be in touch soon.'}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiMail /> {isAo ? 'Contacte-nos' : 'Contact us'}
            </h3>

            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder={isAo ? 'O seu nome' : 'Your name'}
              style={inputStyle} maxLength={60}
            />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={isAo ? 'O seu email' : 'Your email'}
              style={inputStyle}
            />
            <input
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder={isAo ? 'Telefone (opcional)' : 'Phone (optional)'}
              style={inputStyle}
            />

            <select value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {types.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>

            <textarea
              value={message} onChange={e => setMessage(e.target.value)}
              placeholder={isAo ? 'Como podemos ajudar?' : 'How can we help?'}
              rows={4} maxLength={600}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontSize: 13, padding: '9px 13px', borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} style={{
              background: t.btnPrimary, color: t.btnPrimaryColor,
              border: `1px solid ${t.btnPrimaryBorder}`, borderRadius: 10,
              padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: t.btnPrimaryShadow, opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? (isAo ? 'A enviar...' : 'Submitting...') : (isAo ? 'Enviar' : 'Submit')}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}