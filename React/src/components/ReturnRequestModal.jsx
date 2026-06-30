import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { FiX, FiCheck } from 'react-icons/fi'

export default function ReturnRequestModal({ order, open, onClose, onSuccess, isAo }) {
  const [returnType, setReturnType] = useState('refund')
  const [reason, setReason] = useState('')
  const [exchangeSize, setExchangeSize] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const hasSize = order?.items?.some(i => i.size)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await axios.put(`/api/orders/${order._id}/return-request`, {
        returnType, returnReason: reason, exchangeSize: returnType === 'exchange' ? exchangeSize : undefined,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 13px',
    background: 'rgba(13,37,69,0.6)', border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: 9, color: '#F8FAFC', fontSize: 13, outline: 'none',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <motion.form
            onSubmit={submit}
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            style={{
              background: '#0A1628', border: '1px solid rgba(148,163,184,0.15)',
              borderRadius: 18, padding: '24px 22px', width: '100%', maxWidth: 400,
              display: 'flex', flexDirection: 'column', gap: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>
                {isAo ? 'Solicitar Devolução' : 'Request Return'}
              </h3>
              <button type="button" onClick={onClose} style={{ color: '#64748B', fontSize: 18, padding: 4 }}>
                <FiX />
              </button>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontSize: 12, padding: '8px 12px', borderRadius: 8 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setReturnType('refund')} style={{
                flex: 1, padding: '10px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: returnType === 'refund' ? '#2563EB' : 'transparent',
                color: returnType === 'refund' ? '#fff' : '#94A3B8',
                border: `1px solid ${returnType === 'refund' ? '#2563EB' : 'rgba(148,163,184,0.2)'}`,
              }}>
                {isAo ? 'Reembolso' : 'Refund'}
              </button>
              {hasSize && (
                <button type="button" onClick={() => setReturnType('exchange')} style={{
                  flex: 1, padding: '10px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: returnType === 'exchange' ? '#2563EB' : 'transparent',
                  color: returnType === 'exchange' ? '#fff' : '#94A3B8',
                  border: `1px solid ${returnType === 'exchange' ? '#2563EB' : 'rgba(148,163,184,0.2)'}`,
                }}>
                  {isAo ? 'Troca' : 'Exchange'}
                </button>
              )}
            </div>

            {returnType === 'exchange' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 5 }}>
                  {isAo ? 'Novo tamanho' : 'New size'}
                </label>
                <select required value={exchangeSize} onChange={e => setExchangeSize(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="" disabled style={{ background: '#050A14' }}>{isAo ? 'Selecione...' : 'Select...'}</option>
                  {['XS', 'S', 'M', 'L', 'XL'].map(s => <option key={s} value={s} style={{ background: '#050A14' }}>{s}</option>)}
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 5 }}>
                {isAo ? 'Motivo' : 'Reason'}
              </label>
              <textarea required value={reason} onChange={e => setReason(e.target.value)} rows={3}
                placeholder={isAo ? 'Porque está a devolver este item?' : 'Why are you returning this item?'}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }} />
            </div>

            <button type="submit" disabled={saving} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#2563EB', color: '#fff', border: 'none', borderRadius: 9,
              padding: '11px', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1,
            }}>
              <FiCheck size={14} /> {saving ? (isAo ? 'A enviar...' : 'Sending...') : (isAo ? 'Enviar Pedido' : 'Submit Request')}
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}