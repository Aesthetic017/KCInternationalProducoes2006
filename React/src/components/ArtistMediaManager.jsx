import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { FiX, FiUpload, FiCheck, FiVideo, FiMusic, FiTrash2, FiPlus } from 'react-icons/fi'
import { getTheme } from '../theme.js'

export default function ArtistMediaManager({ country, artist, open, onClose, onUpdated }) {
  const t = getTheme(country)
  const isAo = country === 'ao'
  const [kind, setKind] = useState('video')
  const [source, setSource] = useState('link')
  const [url, setUrl] = useState('')
  const [mediaTitle, setMediaTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!artist) return null

  const reset = () => { setUrl(''); setMediaTitle(''); setSource('link'); setError('') }

  const handleFileUpload = async (file) => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const data = new FormData()
      data.append('file', file)
      const res = await axios.post('/api/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setUrl(res.data.url)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const addMedia = async () => {
    if (!url) { setError(isAo ? 'Adicione um link ou carregue um ficheiro' : 'Add a link or upload a file'); return }
    setSaving(true)
    setError('')
    try {
      await axios.post(`/api/artists/${artist._id}/media`, { kind, source, url, title: mediaTitle })
      reset()
      onUpdated()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add media')
    } finally {
      setSaving(false)
    }
  }

  const removeMedia = async (mediaId) => {
    if (!window.confirm(isAo ? 'Remover este item?' : 'Remove this item?')) return
    await axios.delete(`/api/artists/${artist._id}/media/${mediaId}`)
    onUpdated()
  }

  const inputStyle = {
    width: '100%', padding: '10px 13px',
    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
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
          <motion.div
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            style={{
              background: t.formBg, border: `1px solid ${t.formBorder}`, borderRadius: 20,
              padding: '26px 24px', width: '100%', maxWidth: 460, maxHeight: '85vh', overflowY: 'auto',
              backdropFilter: 'blur(14px)', display: 'flex', flexDirection: 'column', gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text }}>
                {isAo ? `Mídia de ${artist.name}` : `${artist.name}'s Media`}
              </h3>
              <button type="button" onClick={onClose} style={{ color: t.textMuted, fontSize: 18, padding: 4 }}>
                <FiX />
              </button>
            </div>

            {/* Existing media list */}
            {artist.media && artist.media.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {artist.media.map(m => (
                  <div key={m._id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'rgba(0,0,0,0.2)', border: `1px solid ${t.inputBorder}`,
                    borderRadius: 9, padding: '8px 12px',
                  }}>
                    {m.kind === 'video' ? <FiVideo size={14} style={{ color: t.accentAlt }} /> : <FiMusic size={14} style={{ color: t.accentAlt }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, color: t.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.title || (m.kind === 'video' ? 'Untitled video' : 'Untitled track')}
                      </div>
                      <div style={{ fontSize: 10.5, color: t.textMuted }}>{m.source === 'upload' ? 'Uploaded file' : 'Link'}</div>
                    </div>
                    <button onClick={() => removeMedia(m._id)} style={{ color: '#FCA5A5', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new media */}
            <div style={{ borderTop: `1px solid ${t.divider}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted }}>
                {isAo ? 'Adicionar Novo' : 'Add New'}
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontSize: 12, padding: '8px 12px', borderRadius: 8 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setKind('video')} style={{
                  flex: 1, padding: '8px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                  background: kind === 'video' ? t.accent : 'transparent',
                  color: kind === 'video' ? t.btnPrimaryColor : t.textMuted,
                  border: `1px solid ${kind === 'video' ? t.accent : t.inputBorder}`,
                }}>
                  <FiVideo size={12} style={{ marginRight: 5 }} /> Video
                </button>
                <button onClick={() => setKind('track')} style={{
                  flex: 1, padding: '8px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                  background: kind === 'track' ? t.accent : 'transparent',
                  color: kind === 'track' ? t.btnPrimaryColor : t.textMuted,
                  border: `1px solid ${kind === 'track' ? t.accent : t.inputBorder}`,
                }}>
                  <FiMusic size={12} style={{ marginRight: 5 }} /> Track
                </button>
              </div>

              <input value={mediaTitle} onChange={e => setMediaTitle(e.target.value)} placeholder={isAo ? 'Título (opcional)' : 'Title (optional)'} style={inputStyle} />

              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setSource('link'); setUrl('') }} style={{
                  flex: 1, padding: '7px', borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                  background: source === 'link' ? t.accent : 'transparent',
                  color: source === 'link' ? t.btnPrimaryColor : t.textMuted,
                  border: `1px solid ${source === 'link' ? t.accent : t.inputBorder}`,
                }}>
                  {kind === 'video' ? 'YouTube link' : 'Streaming link'}
                </button>
                <button onClick={() => { setSource('upload'); setUrl('') }} style={{
                  flex: 1, padding: '7px', borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                  background: source === 'upload' ? t.accent : 'transparent',
                  color: source === 'upload' ? t.btnPrimaryColor : t.textMuted,
                  border: `1px solid ${source === 'upload' ? t.accent : t.inputBorder}`,
                }}>
                  Upload file
                </button>
              </div>

              {source === 'link' ? (
                <input value={url} onChange={e => setUrl(e.target.value)}
                  placeholder={kind === 'video' ? 'https://youtube.com/watch?v=...' : 'https://open.spotify.com/track/...'}
                  style={inputStyle} />
              ) : (
                <div>
                  <input
                    type="file" accept={kind === 'video' ? 'video/*' : 'audio/*'}
                    id="media-manager-upload"
                    style={{ display: 'none' }}
                    onChange={e => handleFileUpload(e.target.files[0])}
                  />
                  <label htmlFor="media-manager-upload" style={{
                    ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    color: url ? t.text : t.textMuted,
                  }}>
                    {uploading ? 'Uploading...' : url ? (<><FiCheck size={13} style={{ color: t.accentAlt }} /> Uploaded</>) : (<><FiUpload size={13} /> Choose {kind === 'video' ? 'video' : 'audio'} file</>)}
                  </label>
                </div>
              )}

              <button onClick={addMedia} disabled={saving || uploading} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: t.btnPrimary, color: t.btnPrimaryColor, border: `1px solid ${t.btnPrimaryBorder}`,
                borderRadius: 9, padding: '10px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                opacity: (saving || uploading) ? 0.7 : 1,
              }}>
                <FiPlus size={14} /> {saving ? (isAo ? 'A adicionar...' : 'Adding...') : (isAo ? 'Adicionar' : 'Add')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}