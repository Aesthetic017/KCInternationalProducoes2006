import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const AngolaFlag = () => (
  <svg width="80" height="52" viewBox="0 0 900 600" style={{ borderRadius: 8, display: 'block' }}>
    <rect width="900" height="300" fill="#CC0000" />
    <rect y="300" width="900" height="300" fill="#000" />
    <g transform="translate(450,300)">
      <circle r="80" fill="none" stroke="#FFCC00" strokeWidth="18" />
      <path d="M-30,-70 L0,-20 L30,-70 L20,10 L60,40 L10,40 L0,90 L-10,40 L-60,40 L-20,10 Z" fill="#FFCC00" />
      <path d="M-80,20 L80,20" stroke="#FFCC00" strokeWidth="14" strokeLinecap="round" />
    </g>
  </svg>
)
const UKFlag = () => (
  <svg width="80" height="52" viewBox="0 0 900 600" style={{ borderRadius: 8, display: 'block' }}>
    <rect width="900" height="600" fill="#012169" />
    <path d="M0,0 L900,600 M900,0 L0,600" stroke="#fff" strokeWidth="120" />
    <path d="M0,0 L900,600 M900,0 L0,600" stroke="#C8102E" strokeWidth="80" />
    <path d="M450,0 V600 M0,300 H900" stroke="#fff" strokeWidth="180" />
    <path d="M450,0 V600 M0,300 H900" stroke="#C8102E" strokeWidth="120" />
  </svg>
)

// Maps the bare path to a friendly label, used in both languages
const SECTION_LABELS = {
  artists:  { en: 'Artists',  ao: 'Artistas' },
  events:   { en: 'Events',   ao: 'Eventos' },
  shop:     { en: 'Shop',     ao: 'Loja' },
  services: { en: 'Services', ao: 'Serviços' },
}

export default function CountryGate() {
  const navigate = useNavigate()
  const location = useLocation()

  // e.g. "/artists" -> "artists"
  const section = location.pathname.replace('/', '').split('/')[0]
  const label = SECTION_LABELS[section] || { en: section, ao: section }

  const goTo = (country) => navigate(`/${country}/${section}`)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.13) 0%, transparent 65%), #050A14',
    }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#3B82F6', marginBottom: 10 }}>
          {label.en} · {label.ao}
        </div>
        <h1 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, color: '#F8FAFC', marginBottom: 12 }}>
          Where are you located?
        </h1>
        <p style={{ fontSize: 15, color: '#64748B', marginBottom: 40 }}>
          Select your country to see {label.en.toLowerCase()} available in your region.
          <br />Selecione o seu país para ver {label.ao.toLowerCase()} disponíveis na sua região.
        </p>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          <motion.button onClick={() => goTo('ao')}
            whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}
            style={{
              background: 'rgba(13,37,69,0.5)', border: '2px solid rgba(204,0,0,0.3)',
              borderRadius: 18, padding: '20px 32px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 12, cursor: 'pointer', minWidth: 170,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#CC0000' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(204,0,0,0.3)' }}
          >
            <AngolaFlag />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#F8FAFC' }}>🇦🇴 Angola</span>
          </motion.button>

          <motion.button onClick={() => goTo('uk')}
            whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}
            style={{
              background: 'rgba(13,37,69,0.5)', border: '2px solid rgba(1,33,105,0.4)',
              borderRadius: 18, padding: '20px 32px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 12, cursor: 'pointer', minWidth: 170,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82F6' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(1,33,105,0.4)' }}
          >
            <UKFlag />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#F8FAFC' }}>🇬🇧 United Kingdom</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}