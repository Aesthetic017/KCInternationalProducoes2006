import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { FiX, FiUpload, FiCheck, FiVideo, FiMusic, FiTrash2 } from 'react-icons/fi'
import { getTheme } from '../theme.js'

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL']

// fields: [{ key, label, type: 'text'|'number'|'select'|'image'|'url'|'sizes'|'media', options?, placeholder? }]
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
      if (exists) return { ...f, sizes: current.filter(s => s.size !== size) }
      return { ...f, sizes: [...current, { size, stock: 0 }] }
    })
  }

  const setSizeStock = (size, stock) => {
    setForm(f => ({
      ...f,
      sizes: (f.sizes || []).map(s => s.size === size ? { ...s, stock: Number(stock) } : s),
    }))
  }

  const handleFileUpload = async (key, file) => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const data = new FormData()
      data.append('file', file)
      const res = await axios.post('/api/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      set(key, res.data.url)
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed')
    } finally {
      setUploading(false)
    }
  }

  const addMediaItem = (key, kind) => {
    setForm(f => ({
      ...f,
      [key]: [...(f[key] || []), { kind, source: 'link', url: '', title: '' }],
    }))
  }
  const updateMediaItem = (key, index, patch) => {
    setForm(f => ({
      ...f,
      [key]: f[key].map((m, i) => i === index ? { ...m, ...patch } : m),
    }))
  }
  const removeMediaItem = (key, index) => {
    setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== index) }))
  }
  const uploadMediaFile = async (key, index, file) => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const data = new FormData()
      data.append('file', file)
      const res = await axios.post('/api/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      updateMediaItem(key, index, { url: res.data.url })
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed')
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
              borderRadius: 20, padding: '28px 26px', width: '100%', maxWidth: 460,
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

                  ) : f.type === 'media' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" onClick={() => addMediaItem(f.key, 'video')} style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '9px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                          background: 'transparent', color: t.text, border: `1px solid ${t.inputBorder}`,
                        }}>
                          <FiVideo size={13} /> Add video
                        </button>
                        <button type="button" onClick={() => addMediaItem(f.key, 'track')} style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '9px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                          background: 'transparent', color: t.text, border: `1px solid ${t.inputBorder}`,
                        }}>
                          <FiMusic size={13} /> Add track
                        </button>
                      </div>

                      {(form[f.key] || []).map((m, i) => (
                        <div key={i} style={{
                          background: 'rgba(0,0,0,0.2)', border: `1px solid ${t.inputBorder}`,
                          borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: t.text, display: 'flex', alignItems: 'center', gap: 5 }}>
                              {m.kind === 'video' ? <FiVideo size={12} /> : <FiMusic size={12} />}
                              {m.kind === 'video' ? 'Video' : 'Track'}
                            </span>
                            <button type="button" onClick={() => removeMediaItem(f.key, i)} style={{ color: '#FCA5A5', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <FiTrash2 size={13} />
                            </button>
                          </div>

                          <input
                            value={m.title} onChange={e => updateMediaItem(f.key, i, { title: e.target.value })}
                            placeholder={m.kind === 'video' ? 'Video title (optional)' : 'Track title (optional)'}
                            style={{ ...inputStyle, padding: '8px 12px', fontSize: 13 }}
                          />

                          <div style={{ display: 'flex', gap: 6 }}>
                            <button type="button" onClick={() => updateMediaItem(f.key, i, { source: 'link', url: '' })} style={{
                              flex: 1, padding: '6px', borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                              background: m.source === 'link' ? t.accent : 'transparent',
                              color: m.source === 'link' ? t.btnPrimaryColor : t.textMuted,
                              border: `1px solid ${m.source === 'link' ? t.accent : t.inputBorder}`,
                            }}>
                              {m.kind === 'video' ? 'YouTube link' : 'Streaming link'}
                            </button>
                            <button type="button" onClick={() => updateMediaItem(f.key, i, { source: 'upload', url: '' })} style={{
                              flex: 1, padding: '6px', borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                              background: m.source === 'upload' ? t.accent : 'transparent',
                              color: m.source === 'upload' ? t.btnPrimaryColor : t.textMuted,
                              border: `1px solid ${m.source === 'upload' ? t.accent : t.inputBorder}`,
                            }}>
                              Upload file
                            </button>
                          </div>

                          {m.source === 'link' ? (
                            <input
                              value={m.url} onChange={e => updateMediaItem(f.key, i, { url: e.target.value })}
                              placeholder={m.kind === 'video' ? 'https://youtube.com/watch?v=...' : 'https://open.spotify.com/track/... or SoundCloud URL'}
                              style={{ ...inputStyle, padding: '8px 12px', fontSize: 13 }}
                            />
                          ) : (
                            <div>
                              <input
                                type="file" accept={m.kind === 'video' ? 'video/*' : 'audio/*'}
                                id={`media-upload-${f.key}-${i}`}
                                style={{ display: 'none' }}
                                onChange={e => uploadMediaFile(f.key, i, e.target.files[0])}
                              />
                              <label htmlFor={`media-upload-${f.key}-${i}`} style={{
                                ...inputStyle, padding: '8px 12px', fontSize: 13, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8,
                                color: m.url ? t.text : t.textMuted,
                              }}>
                                {uploading ? 'Uploading...' : m.url ? (<><FiCheck style={{ color: t.accentAlt }} size={13} /> Uploaded</>) : (<><FiUpload size={13} /> Choose {m.kind === 'video' ? 'video' : 'audio'} file</>)}
                              </label>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                  ) : f.type === 'image' ? (
                    <div>
                      <input
                        type="file" accept="image/*"
                        id={`upload-${f.key}`}
                        style={{ display: 'none' }}
                        onChange={e => handleFileUpload(f.key, e.target.files[0])}
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