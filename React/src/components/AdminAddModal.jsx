import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { FiX, FiUpload, FiCheck } from 'react-icons/fi'
import { getTheme } from '../theme.js'

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL']

// fields: [{ key, label, type: 'text'|'number'|'select'|'image'|'url'|'sizes', options?, placeholder? }]
export default function AdminAddModal({ country, open, onClose, fields, onSubmit, title }) {
  const t = getTheme(country)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleSize = (size) => {
    setForm(f => {
      const current = f.sizes || []
      const exists = current.find(s => s.size === size)
      if (exists) {
        return { ...f, sizes: current.filter(s => s.size !== size) }
      }
      return { ...f, sizes: [...current, { size, stock: 0 }] }
    })
  }

  const setSizeStock = (size, stock) => {
    setForm(f => ({
      ...f,
      sizes: (f.sizes || []).map(s => s.size === size ? { ...s, stock: Number(stock) } : s),
    }))
  }

  const handleImageUpload = async (key, file) => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const data = new FormData()
      data.append('image', file)
      const res = await axios.post('/api/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      set(key, res.data.url)
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSubmit(form)
      setForm({})
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
    borderRadius: 10, color: '#F8FAFC', fontSize: 14,
    fontFamily: 'Inter,sans-serif', outline: 'none',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            overflowY: 'auto',
          }}
        >
          <motion.form
            onSubmit={submit}
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            style={{
              background: t.formBg, border: `1px solid ${t.formBorder}`,
              borderRadius: 20, padding: '28px 26px', width: '100%', maxWidth: 440,
              display: 'flex', flexDirection: 'column', gap: 14,
              backdropFilter: 'blur(14px)', maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: t.text }}>{title}</h3>
              <button type="button" onClick={onClose} style={{ color: t.textMuted, fontSize: 18, padding: 4 }}>
                <FiX />
              </button>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontSize: 13, padding: '9px 13px', borderRadius: 8 }}>
                {error}
              </div>
            )}

            {fields.map(f => {
              // Conditionally hide fields based on another field's value (e.g. sizes only for category=clothing)
              if (f.showIf && !f.showIf(form)) return null

              return (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12, color: t.textMuted, marginBottom: 5 }}>{f.label}</label>

                  {f.type === 'select' ? (
                    <select
                      required value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="" disabled style={{ background: '#050A14' }}>Select...</option>
                      {f.options.map(opt => (
                        <option key={opt} value={opt} style={{ background: '#050A14' }}>{opt}</option>
                      ))}
                    </select>

                  ) : f.type === 'sizes' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {ALL_SIZES.map(size => {
                          const active = (form.sizes || []).some(s => s.size === size)
                          return (
                            <button
                              key={size} type="button" onClick={() => toggleSize(size)}
                              style={{
                                padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                                background: active ? t.accent : 'transparent',
                                color: active ? (t.btnPrimaryColor) : t.textMuted,
                                border: `1px solid ${active ? t.accent : t.inputBorder}`,
                                cursor: 'pointer',
                              }}
                            >
                              {size}
                            </button>
                          )
                        })}
                      </div>
                      {(form.sizes || []).length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(form.sizes || []).map(s => (
                            <div key={s.size} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 13, color: t.text, width: 30 }}>{s.size}</span>
                              <input
                                type="number" min="0" value={s.stock}
                                onChange={e => setSizeStock(s.size, e.target.value)}
                                placeholder="Stock qty"
                                style={{ ...inputStyle, padding: '8px 12px' }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  ) : f.type === 'image' ? (
                    <div>
                      <input
                        type="file" accept="image/*"
                        id={`upload-${f.key}`}
                        style={{ display: 'none' }}
                        onChange={e => handleImageUpload(f.key, e.target.files[0])}
                      />
                      <label htmlFor={`upload-${f.key}`} style={{
                        ...inputStyle, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 10,
                        color: form[f.key] ? t.text : t.textMuted,
                      }}>
                        {uploading ? 'Uploading...' : form[f.key] ? (<><FiCheck style={{ color: t.accentAlt }} /> Image uploaded — click to change</>) : (<><FiUpload /> Choose a photo</>)}
                      </label>
                      {form[f.key] && (
                        <img src={form[f.key]} alt="Preview" style={{ marginTop: 10, width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 10, border: `1px solid ${t.inputBorder}` }} />
                      )}
                    </div>

                  ) : (
                    <input
                      required={f.required !== false}
                      type={f.type === 'url' ? 'url' : (f.type || 'text')}
                      value={form[f.key] ?? ''}
                      onChange={e => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                      placeholder={f.placeholder || ''}
                      step={f.type === 'number' ? '0.01' : undefined}
                      style={inputStyle}
                    />
                  )}
                </div>
              )
            })}

            <button type="submit" disabled={saving || uploading} style={{
              marginTop: 6, background: t.btnPrimary, color: t.btnPrimaryColor,
              border: `1px solid ${t.btnPrimaryBorder}`, borderRadius: 10,
              padding: '12px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: t.btnPrimaryShadow, opacity: (saving || uploading) ? 0.7 : 1,
            }}>
              {saving ? 'Saving...' : 'Add'}
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}