import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiStar, FiUser, FiCheck } from 'react-icons/fi'
import { getTheme } from '../theme.js'

const MAX_STARS = 5

function StarRow({ value, size = 16 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: MAX_STARS }).map((_, i) => (
        <FiStar
          key={i}
          size={size}
          style={{
            color: i < value ? '#FBBF24' : 'rgba(148,163,184,0.3)',
            fill: i < value ? '#FBBF24' : 'none',
          }}
        />
      ))}
    </div>
  )
}

function StarPicker({ value, onChange, t }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: MAX_STARS }).map((_, i) => {
          const starValue = i + 1
          const filled = starValue <= (hover || value)
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(starValue)}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(0)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
              aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
            >
              <FiStar size={26} style={{ color: filled ? '#FBBF24' : 'rgba(148,163,184,0.35)', fill: filled ? '#FBBF24' : 'none', transition: 'color 0.15s' }} />
            </button>
          )
        })}
      </div>
      <span style={{ fontSize: 11, color: t.textMuted }}>
        out of {MAX_STARS} stars
      </span>
    </div>
  )
}

export default function ReviewsSection({ country }) {
  const t = getTheme(country || 'uk')
  const isAo = country === 'ao'

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [stars, setStars] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const load = () => {
    axios.get(`/api/reviews/${country}`)
      .then(res => setReviews(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (country) load() }, [country])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !message.trim() || stars < 1) {
      setError(isAo ? 'Por favor preencha o nome, a mensagem e selecione uma classificação.' : 'Please fill in your name, message, and select a star rating.')
      return
    }
    setSubmitting(true)
    try {
      await axios.post('/api/reviews', { name: name.trim(), message: message.trim(), stars, country })
      setDone(true)
      setName('')
      setMessage('')
      setStars(0)
    } catch (err) {
      setError(err.response?.data?.message || (isAo ? 'Falha ao enviar a avaliação.' : 'Failed to submit review.'))
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
          {isAo ? 'Palavras gentis de clientes satisfeitos' : 'Kind words from satisfied customers'}
        </div>
        <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, color: t.text }}>
          {isAo ? 'Avaliações' : 'Reviews'}
        </h2>
      </motion.div>

      {/* Testimonial cards */}
      {loading ? (
        <div style={{ color: t.textMuted, fontSize: 14, textAlign: 'center' }}>
          {isAo ? 'A carregar...' : 'Loading...'}
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ color: t.textMuted, fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
          {isAo ? 'Ainda não há avaliações. Seja o primeiro a partilhar a sua experiência!' : 'No reviews yet — be the first to share your experience!'}
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16, marginBottom: 44,
        }}>
          {reviews.map((r, i) => (
            <motion.div key={r._id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: Math.min(i, 6) * 0.05 }}
              style={{
                background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                borderRadius: 16, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16,
              }}
            >
              <p style={{ fontSize: 14, color: t.textBody, lineHeight: 1.7, flex: 1 }}>
                {r.message}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: `1px solid ${t.divider}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: t.iconBg,
                    border: `1px solid ${t.iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: t.iconColor, fontSize: 14,
                  }}>
                    <FiUser />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: t.text, fontStyle: 'italic' }}>{r.name}</span>
                </div>
                <StarRow value={r.stars} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Leave a review */}
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
              {isAo ? 'Obrigado pela sua avaliação!' : 'Thank you for your review!'}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 2 }}>
              {isAo ? 'Deixe a sua avaliação' : 'Leave a rating'}
            </h3>

            <StarPicker value={stars} onChange={setStars} t={t} />

            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder={isAo ? 'O seu nome' : 'Your name'}
              style={inputStyle} maxLength={60}
            />
            <textarea
              value={message} onChange={e => setMessage(e.target.value)}
              placeholder={isAo ? 'Conte-nos sobre a sua experiência...' : 'Tell us about your experience...'}
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
              {submitting ? (isAo ? 'A enviar...' : 'Submitting...') : (isAo ? 'Enviar Avaliação' : 'Submit Review')}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}