import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiArrowLeft, FiCalendar, FiMapPin, FiShoppingBag, FiCheck } from 'react-icons/fi'
import CountryBackground from '../../components/CountryBackground.jsx'
import CountryNavbar from '../../components/CountryNavbar.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { getTheme } from '../../theme.js'

export default function EventDetailPage() {
  const { country, id } = useParams()
  const navigate = useNavigate()
  const t = getTheme(country)
  const isAo = country === 'ao'
  const currency = isAo ? 'Kz' : '£'
  const { addItem } = useCart()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    axios.get(`/api/events/${country}`)
      .then(res => setEvent(res.data.find(e => e._id === id)))
      .finally(() => setLoading(false))
  }, [country, id])

  const handleAddToCart = () => {
    const result = addItem({
      id: event._id, type: 'event', name: `${event.title} — ${isAo ? 'Bilhete' : 'Ticket'}`,
      price: event.price, currency, country,
    })
    if (result.requiresLogin) {
      navigate(`/login?redirect=/${country}/events/${id}`)
      return
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#050A14' }} />
  if (!event) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050A14', color: '#64748B' }}>
      {isAo ? 'Evento não encontrado.' : 'Event not found.'}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <CountryBackground country={country} />
      <CountryNavbar country={country} activePage={`/${country}/events`} />

      <div style={{ position: 'relative', zIndex: 2, paddingTop: 90, maxWidth: 700, margin: '0 auto', padding: '90px 24px 60px' }}>
        <Link to={`/${country}/events`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: t.backColor, fontSize: 13, marginBottom: 24 }}>
          <FiArrowLeft size={14} /> {isAo ? 'Voltar aos Eventos' : 'Back to Events'}
        </Link>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 20,
            padding: '36px 32px', backdropFilter: 'blur(10px)',
          }}
        >
          <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: `${t.accent}22`, border: `1px solid ${t.accent}44`, color: t.accentAlt }}>
            {event.type}
          </span>

          <h1 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, color: t.text, margin: '16px 0 20px' }}>
            {event.title}
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: t.textMuted, fontSize: 15 }}>
              <FiCalendar style={{ color: t.accentAlt }} /> {event.date}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: t.textMuted, fontSize: 15 }}>
              <FiMapPin style={{ color: t.accentAlt }} /> {event.venue}
            </div>
          </div>

          <div style={{ fontSize: 28, fontWeight: 800, color: t.accentAlt, marginBottom: 24 }}>
            {event.price > 0 ? `${currency}${event.price}` : (isAo ? 'Grátis' : 'Free')}
          </div>

          {event.price > 0 && (
            <button onClick={handleAddToCart} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', background: added ? `${t.accent}33` : t.btnPrimary,
              color: t.btnPrimaryColor, border: `1px solid ${t.btnPrimaryBorder}`,
              borderRadius: 12, padding: '15px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              boxShadow: t.btnPrimaryShadow, transition: 'background 0.2s',
            }}>
              {added ? <><FiCheck /> {isAo ? 'Adicionado!' : 'Added to Cart!'}</> : <><FiShoppingBag /> {isAo ? 'Adicionar Bilhete' : 'Add Ticket to Cart'}</>}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  )
}