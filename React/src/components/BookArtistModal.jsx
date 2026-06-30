import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { FiX, FiCalendar, FiCheck } from 'react-icons/fi'
import { getTheme } from '../theme.js'

export default function BookArtistModal({ country, artist, open, onClose }) {
  const t = getTheme(country)
  const isAo = country === 'ao'
  const [form, setForm] = useState({ eventDate: '', eventType: '', message: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const EVENT_TYPES = isAo
    ? ['Casamento', 'Festa privada', 'Evento corporativo', 'Festival', 'Outro']
    : ['Wedding', 'Private party', 'Corporate event', 'Festival', 'Other']

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
    borderRadius: 10, color: '#F8FAFC', fontSize: 14,
    fontFamily: 'Inter,sans-serif', outline: 'none',
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await axios.post('/api/bookings', { ...form, artistId: artist._id, country })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send booking request')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setSent(false)
    setForm({ eventDate: '', eventType: '', message: '' })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            style={{
              background: t.formBg, border: `1px solid ${t.formBorder}`,
              borderRadius: 20, padding: '28px 26px', width: '100%', maxWidth: 420,
              backdropFilter: 'blur(14px)', maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <FiCheck size={44} style={{ color: t.accentAlt, marginBottom: 14 }} />
                <div style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 8 }}>
                  {isAo ? 'Pedido enviado!' : 'Request sent!'}
                </div>
                <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.6, marginBottom: 20 }}>
                  {isAo
                    ? `Entraremos em contacto sobre a reserva de ${artist.name} em breve.`
                    : `We'll be in touch about booking ${artist.name} soon.`}
                </p>
                <button onClick={handleClose} style={{
                  background: t.btnPrimary, color: t.btnPrimaryColor,
                  border: `1px solid ${t.btnPrimaryBorder}`, borderRadius: 10,
                  padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}>
                  {isAo ? 'Fechar' : 'Close'}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: t.text }}>
                      {isAo ? `Reservar ${artist.name}` : `Book ${artist.name}`}
                    </h3>
                    <p style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>
                      {isAo ? 'Receberá um orçamento personalizado.' : "You'll receive a custom quote."}
                    </p>
                  </div>
                  <button type="button" onClick={handleClose} style={{ color: t.textMuted, fontSize: 18, padding: 4 }}>
                    <FiX />
                  </button>
                </div>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontSize: 13, padding: '9px 13px', borderRadius: 8 }}>
                    {error}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: t.textMuted, marginBottom: 5 }}>
                    {isAo ? 'Data do evento' : 'Event date'}
                  </label>
                  <input required value={form.eventDate} onChange={e => set('eventDate', e.target.value)}
                    placeholder={isAo ? 'ex: 14 de Agosto, 2026' : 'e.g. August 14, 2026'} style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: t.textMuted, marginBottom: 5 }}>
                    {isAo ? 'Tipo de evento' : 'Event type'}
                  </label>
                  <select required value={form.eventType} onChange={e => set('eventType', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="" disabled style={{ background: '#050A14' }}>{isAo ? 'Selecione...' : 'Select...'}</option>
                    {EVENT_TYPES.map(type => <option key={type} value={type} style={{ background: '#050A14' }}>{type}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: t.textMuted, marginBottom: 5 }}>
                    {isAo ? 'Detalhes adicionais (opcional)' : 'Additional details (optional)'}
                  </label>
                  <textarea value={form.message} onChange={e => set('message', e.target.value)}
                    placeholder={isAo ? 'Duração, local, orçamento esperado...' : 'Duration, location, expected budget...'}
                    rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
                </div>

                <button type="submit" disabled={saving} style={{
                  marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: t.btnPrimary, color: t.btnPrimaryColor,
                  border: `1px solid ${t.btnPrimaryBorder}`, borderRadius: 10,
                  padding: '12px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: t.btnPrimaryShadow, opacity: saving ? 0.7 : 1,
                }}>
                  <FiCalendar size={15} />
                  {saving ? (isAo ? 'A enviar...' : 'Sending...') : (isAo ? 'Enviar Pedido de Reserva' : 'Send Booking Request')}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}