import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiArrowLeft, FiStar, FiPlay, FiInstagram, FiYoutube, FiMusic, FiCalendar } from 'react-icons/fi'
import { SiTiktok, SiSpotify } from 'react-icons/si'
import CountryBackground from '../../components/CountryBackground.jsx'
import CountryNavbar from '../../components/CountryNavbar.jsx'
import BookArtistModal from '../../components/BookArtistModal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { getTheme } from '../../theme.js'

const SOCIAL_ICONS = { instagram: FiInstagram, tiktok: SiTiktok, youtube: FiYoutube, spotify: SiSpotify }

export default function ArtistDetailPage() {
  const { country, id } = useParams()
  const navigate = useNavigate()
  const t = getTheme(country)
  const isAo = country === 'ao'
  const { user } = useAuth()
  const { addItem } = useCart()

  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    axios.get(`/api/artists/${country}`)
      .then(res => setArtist(res.data.find(a => a._id === id)))
      .finally(() => setLoading(false))
  }, [country, id])

  if (loading) return <div style={{ minHeight: '100vh', background: '#050A14' }} />
  if (!artist) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050A14', color: '#64748B' }}>
      {isAo ? 'Artista não encontrado.' : 'Artist not found.'}
    </div>
  )

  const isFixed = artist.bookingType === 'fixed' && artist.bookingPrice > 0

  const handleBookClick = () => {
    if (!user) {
      navigate(`/login?redirect=/${country}/artists/${id}`)
      return
    }
    if (isFixed) {
      const result = addItem({
        id: artist._id, type: 'artist', name: `${isAo ? 'Reserva' : 'Booking'}: ${artist.name}`,
        price: artist.bookingPrice, currency: artist.bookingCurrency, image: artist.image, country,
      })
      if (result.requiresLogin) {
        navigate(`/login?redirect=/${country}/artists/${id}`)
        return
      }
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    } else {
      setBookingOpen(true)
    }
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <CountryBackground country={country} />
      <CountryNavbar country={country} activePage={`/${country}/artists`} />

      <div style={{ position: 'relative', zIndex: 2, paddingTop: 90, maxWidth: 700, margin: '0 auto', padding: '90px 24px 60px' }}>
        <Link to={`/${country}/artists`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: t.backColor, fontSize: 13, marginBottom: 24 }}>
          <FiArrowLeft size={14} /> {isAo ? 'Voltar aos Artistas' : 'Back to Artists'}
        </Link>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: '36px 32px', backdropFilter: 'blur(10px)', textAlign: 'center' }}
        >
          <div style={{
            width: 110, height: 110, borderRadius: '50%', margin: '0 auto 20px', overflow: 'hidden',
            background: artist.image ? 'transparent' : `linear-gradient(135deg,${t.accent},${t.accent}88)`,
            border: `3px solid ${t.cardBorderHover}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 800, color: isAo ? '#FFD700' : '#fff',
          }}>
            {artist.image
              ? <img src={artist.image} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : artist.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>

          {artist.badge && (
            <span style={{ display: 'inline-block', marginBottom: 10, fontSize: 11, padding: '3px 12px', borderRadius: 20, background: `${t.accent}22`, border: `1px solid ${t.accent}44`, color: t.accentAlt }}>
              {artist.badge}
            </span>
          )}

          <h1 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, color: t.text, marginBottom: 8 }}>{artist.name}</h1>
          <div style={{ fontSize: 15, color: t.textMuted, marginBottom: 20 }}>{artist.genre}</div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 14, color: t.textMuted, marginBottom: 24 }}>
            <span><FiStar style={{ marginRight: 5, color: t.accentAlt }} />{artist.rating} {isAo ? 'avaliação' : 'rating'}</span>
            {artist.tracks > 0 && <span><FiPlay style={{ marginRight: 5 }} />{artist.tracks} {isAo ? 'faixas' : 'tracks'}</span>}
          </div>

          {artist.socials && Object.values(artist.socials).some(Boolean) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 28 }}>
              {Object.entries(artist.socials).map(([platform, url]) => {
                if (!url) return null
                const Icon = SOCIAL_ICONS[platform] || FiMusic
                return (
                  <a key={platform} href={url} target="_blank" rel="noreferrer" style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: `${t.accent}1a`, border: `1px solid ${t.accent}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: t.accentAlt, fontSize: 17,
                  }}>
                    <Icon />
                  </a>
                )
              })}
            </div>
          )}

          {/* Booking section */}
          <div style={{ borderTop: `1px solid ${t.divider}`, paddingTop: 24 }}>
            {isFixed && (
              <div style={{ fontSize: 24, fontWeight: 800, color: t.accentAlt, marginBottom: 16 }}>
                {artist.bookingCurrency}{artist.bookingPrice}
                <span style={{ fontSize: 12, fontWeight: 500, color: t.textMuted, marginLeft: 6 }}>
                  {isAo ? 'taxa de reserva' : 'booking fee'}
                </span>
              </div>
            )}

            <button onClick={handleBookClick} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', maxWidth: 320, margin: '0 auto',
              background: added ? `${t.accent}33` : t.btnPrimary,
              color: t.btnPrimaryColor, border: `1px solid ${t.btnPrimaryBorder}`,
              borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: t.btnPrimaryShadow, transition: 'background 0.2s',
            }}>
              <FiCalendar size={16} />
              {added
                ? (isAo ? 'Adicionado ao carrinho!' : 'Added to cart!')
                : isFixed
                  ? (isAo ? 'Reservar Artista' : 'Book Artist')
                  : (isAo ? 'Pedir Reserva / Orçamento' : 'Request Booking / Quote')}
            </button>

            {!isFixed && (
              <p style={{ fontSize: 12, color: t.textMuted, marginTop: 12 }}>
                {isAo ? 'Sem compromisso — receberá um orçamento personalizado.' : "No commitment — you'll receive a custom quote."}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      <BookArtistModal country={country} artist={artist} open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  )
}