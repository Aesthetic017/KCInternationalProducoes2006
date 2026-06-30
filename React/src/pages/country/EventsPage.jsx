import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi'
import CountryLayout from '../../components/CountryLayout.jsx'
import AdminFab from '../../components/AdminFab.jsx'
import AdminAddModal from '../../components/AdminAddModal.jsx'
import DeleteButton from '../../components/DeleteButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getTheme } from '../../theme.js'

export default function EventsPage() {
  const { country } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const t = getTheme(country)
  const isAo = country === 'ao'
  const isAdmin = user?.role === 'admin'
  const currency = isAo ? 'Kz' : '£'

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const load = () => {
    axios.get(`/api/events/${country}`)
      .then(res => setEvents(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [country])

  const handleAdd = async (form) => {
    await axios.post('/api/events', { ...form, country })
    load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return
    await axios.delete(`/api/events/${id}`)
    setEvents(prev => prev.filter(e => e._id !== id))
  }

  return (
    <CountryLayout country={country} activePage={`/${country}/events`}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: t.sectionLabel, marginBottom: 8 }}>
          {isAo ? 'Não perca' : "Don't miss out"}
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, color: t.text }}>
          {isAo ? 'Eventos' : 'Events'}
        </h1>
        <p style={{ fontSize: 16, color: t.textMuted, marginTop: 14, maxWidth: 720, lineHeight: 1.75 }}>
          {isAo
            ? 'O riso é uma linguagem universal, e na Kcinternacional2006 Produções dedicamo-nos a oferecer os melhores espetáculos de comédia e eventos ao vivo. Cada evento é cuidadosamente preparado para apresentar uma variedade de estilos e atuações, de comediantes consagrados a novos talentos. Selecionamos a nossa programação com cuidado para garantir uma experiência diversificada que agrade a todos os públicos. Junte-se a nós para uma noite de boa disposição e momentos inesquecíveis com amigos e família.'
            : 'Laughter is a universal language, and at KC International Produções, we are dedicated to delivering outstanding comedy shows and live events. Each show brings together a range of styles and performances, from established names to exciting up-and-coming talent. We carefully curate our lineup to ensure there is always something to appeal to every audience member. Join us for an evening of laughter and unforgettable moments with friends and family.'}
        </p>
      </motion.div>

      {loading ? (
        <div style={{ color: t.textMuted, fontSize: 14 }}>Loading...</div>
      ) : events.length === 0 ? (
        <div style={{ color: t.textMuted, fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
          {isAo ? 'Nenhum evento adicionado ainda.' : 'No events added yet.'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {events.map((e, i) => (
            <motion.div key={e._id}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              onClick={() => navigate(`/${country}/events/${e._id}`)}
              style={{
                position: 'relative',
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                borderRadius: 18,
                padding: '22px 22px 20px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'border-color 0.25s, box-shadow 0.25s',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}
              onMouseEnter={ev => {
                ev.currentTarget.style.borderColor = t.cardBorderHover
                ev.currentTarget.style.boxShadow = `0 12px 32px -8px ${t.accentGlow}`
              }}
              onMouseLeave={ev => {
                ev.currentTarget.style.borderColor = t.cardBorder
                ev.currentTarget.style.boxShadow = 'none'
              }}
            >
              {isAdmin && <DeleteButton onClick={() => handleDelete(e._id)} />}

              {/* Top row — date block + type badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{
                  background: `${t.accent}16`, border: `1px solid ${t.accent}3a`,
                  borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 60,
                }}>
                  <FiCalendar size={13} style={{ color: t.accentAlt, marginBottom: 5 }} />
                  <div style={{ fontSize: 14, fontWeight: 800, color: t.text, lineHeight: 1.2 }}>{e.date}</div>
                </div>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                  background: `${t.accent}1e`, border: `1px solid ${t.accent}40`, color: t.accentAlt,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {e.type}
                </span>
              </div>

              {/* Title + venue */}
              <div>
                <div style={{ fontWeight: 700, color: t.text, fontSize: 17, lineHeight: 1.3, marginBottom: 8 }}>
                  {e.title}
                </div>
                <div style={{ fontSize: 13, color: t.textMuted, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <FiMapPin size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{e.venue}</span>
                </div>
              </div>

              {/* Footer — price + CTA */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${t.divider}`,
              }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: t.text }}>
                  {e.price > 0 ? `${currency}${e.price}` : (isAo ? 'Grátis' : 'Free')}
                </span>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 12.5, fontWeight: 600, color: t.accentAlt,
                }}>
                  {isAo ? 'Ver detalhes' : 'View details'} <FiArrowRight size={13} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isAdmin && (
        <>
          <AdminFab country={country} onClick={() => setModalOpen(true)} />
          <AdminAddModal
            country={country}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title={isAo ? 'Adicionar Evento' : 'Add Event'}
            onSubmit={handleAdd}
            fields={[
              { key: 'title', label: isAo ? 'Título' : 'Title', placeholder: 'e.g. Summer Comedy Night' },
              { key: 'date', label: isAo ? 'Data (ex: 14 JUL)' : 'Date (e.g. 14 JUL)', placeholder: '14 JUL' },
              { key: 'venue', label: isAo ? 'Local' : 'Venue', placeholder: 'e.g. O2 Academy, Liverpool' },
              { key: 'type', label: isAo ? 'Tipo' : 'Type', type: 'select', options: isAo ? ['Comédia', 'Música', 'Privado'] : ['Comedy', 'Music', 'Private'] },
              { key: 'price', label: `${isAo ? 'Preço do bilhete' : 'Ticket price'} (${currency})`, type: 'number', required: false, placeholder: '0' },
            ]}
          />
        </>
      )}
    </CountryLayout>
  )
}