import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiStar, FiPlay, FiInstagram, FiYoutube, FiMusic, FiFilm } from 'react-icons/fi'
import { SiTiktok, SiSpotify } from 'react-icons/si'
import CountryLayout from '../../components/CountryLayout.jsx'
import AdminFab from '../../components/AdminFab.jsx'
import AdminAddModal from '../../components/AdminAddModal.jsx'
import DeleteButton from '../../components/DeleteButton.jsx'
import ArtistMediaManager from '../../components/ArtistMediaManager.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getTheme } from '../../theme.js'

const SOCIAL_ICONS = { instagram: FiInstagram, tiktok: SiTiktok, youtube: FiYoutube, spotify: SiSpotify }

export default function ArtistsPage() {
  const { country } = useParams()
  const { user } = useAuth()
  const t = getTheme(country)
  const isAo = country === 'ao'
  const isAdmin = user?.role === 'admin'

  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [mediaManagerArtist, setMediaManagerArtist] = useState(null)

  const load = () => {
    axios.get(`/api/artists/${country}`)
      .then(res => setArtists(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [country])

  const handleAdd = async (form) => {
    const { instagram, tiktok, youtube, spotify, ...rest } = form
    await axios.post('/api/artists', {
      ...rest, country,
      socials: { instagram, tiktok, youtube, spotify },
      bookingCurrency: isAo ? 'Kz' : '£',
    })
    load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this artist?')) return
    await axios.delete(`/api/artists/${id}`)
    setArtists(prev => prev.filter(a => a._id !== id))
  }

  return (
    <CountryLayout country={country} activePage={`/${country}/artists`}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: t.sectionLabel, marginBottom: 8 }}>
          {isAo ? 'O nosso elenco' : 'Our roster'}
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, color: t.text }}>
          {isAo ? 'Artistas' : 'Artists'}
        </h1>
        <p style={{ fontSize: 16, color: t.textMuted, marginTop: 14, maxWidth: 720, lineHeight: 1.75 }}>
          {isAo
            ? 'Na Kcinternacional2006 Produções, orgulhamo-nos de trabalhar com um elenco diversificado de artistas talentosos, desde nomes consagrados a novas vozes em ascensão. Cada artista é cuidadosamente selecionado pela sua qualidade artística e capacidade de cativar o público. Explore os perfis abaixo para conhecer o seu trabalho, ouvir as suas músicas e reservar a sua próxima atuação.'
            : 'At KC International Produções, we take pride in representing a diverse roster of talented performers, from established names to exciting rising stars. Each artist is carefully selected for their artistry and ability to captivate an audience. Browse the profiles below to discover their work, listen to their music, and book them for your next event.'}
        </p>
      </motion.div>

      {loading ? (
        <div style={{ color: t.textMuted, fontSize: 14 }}>Loading...</div>
      ) : artists.length === 0 ? (
        <div style={{ color: t.textMuted, fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
          {isAo ? 'Nenhum artista adicionado ainda.' : 'No artists added yet.'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 20,
        }}>
          {artists.map((a, i) => (
            <motion.div key={a._id}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -8 }}
              style={{
                position: 'relative',
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                borderRadius: 18,
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                transition: 'border-color 0.25s, box-shadow 0.25s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = t.cardBorderHover
                e.currentTarget.style.boxShadow = `0 12px 32px -8px ${t.accentGlow}`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = t.cardBorder
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {isAdmin && <DeleteButton onClick={() => handleDelete(a._id)} />}
              {isAdmin && (
                <button
                  onClick={(e) => { e.stopPropagation(); setMediaManagerArtist(a) }}
                  title="Manage videos & tracks"
                  style={{
                    position: 'absolute', top: 10, left: 10, zIndex: 5,
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.55)', border: `1px solid ${t.accent}66`,
                    color: t.accentAlt, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, cursor: 'pointer',
                  }}
                >
                  <FiFilm size={13} />
                </button>
              )}

              {/* Photo area — portrait crop, not a tiny circle */}
              <Link to={`/${country}/artists/${a._id}`} style={{ display: 'block' }}>
                <div style={{
                  width: '100%', aspectRatio: '1 / 1', position: 'relative', overflow: 'hidden',
                  background: a.image ? '#000' : `linear-gradient(135deg, ${t.accent}, ${t.accent}88)`,
                }}>
                  {a.image ? (
                    <img src={a.image} alt={a.name} style={{
                      width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top',
                      display: 'block',
                    }} />
                  ) : (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 36, fontWeight: 800, color: isAo ? '#FFD700' : '#fff',
                    }}>
                      {a.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                  )}

                  {a.badge && (
                    <span style={{
                      position: 'absolute', top: 10, left: 10,
                      fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: 'rgba(0,0,0,0.55)', border: `1px solid ${t.accent}66`,
                      color: t.accentAlt, backdropFilter: 'blur(4px)',
                    }}>
                      {a.badge}
                    </span>
                  )}

                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                    background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.65))',
                  }} />
                </div>

                <div style={{ padding: '14px 16px 6px' }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: t.text, marginBottom: 3 }}>{a.name}</div>
                  <div style={{ fontSize: 12.5, color: t.textMuted, marginBottom: 10 }}>{a.genre}</div>

                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: t.textMuted }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiStar size={11} style={{ color: t.accentAlt }} />{a.rating}
                    </span>
                    {a.tracks > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiPlay size={11} />{a.tracks}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Social links — outside the Link to avoid nested anchors */}
              {a.socials && Object.values(a.socials).some(Boolean) && (
                <div style={{ display: 'flex', gap: 8, padding: '4px 16px 16px' }}>
                  {Object.entries(a.socials).map(([platform, url]) => {
                    if (!url) return null
                    const Icon = SOCIAL_ICONS[platform] || FiMusic
                    return (
                      <a key={platform} href={url} target="_blank" rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: `${t.accent}1a`, border: `1px solid ${t.accent}33`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: t.accentAlt, fontSize: 12,
                        }}>
                        <Icon size={12} />
                      </a>
                    )
                  })}
                </div>
              )}
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
            title={isAo ? 'Adicionar Artista' : 'Add Artist'}
            onSubmit={handleAdd}
            fields={[
              { key: 'image', label: isAo ? 'Foto do artista' : 'Artist photo', type: 'image', required: false },
              { key: 'name', label: isAo ? 'Nome do artista' : 'Artist name', placeholder: 'e.g. Jay Draco' },
              { key: 'genre', label: isAo ? 'Género' : 'Genre', placeholder: 'e.g. Hip-Hop · R&B' },
              { key: 'badge', label: isAo ? 'Etiqueta (opcional)' : 'Badge (optional)', required: false, placeholder: 'e.g. Featured, New, Rising' },
              { key: 'rating', label: isAo ? 'Avaliação (0-5)' : 'Rating (0-5)', type: 'number', placeholder: '4.8' },
              { key: 'tracks', label: isAo ? 'Nº de faixas' : 'Number of tracks', type: 'number', placeholder: '10' },
              { key: 'instagram', label: 'Instagram URL', type: 'url', required: false, placeholder: 'https://instagram.com/...' },
              { key: 'tiktok', label: 'TikTok URL', type: 'url', required: false, placeholder: 'https://tiktok.com/@...' },
              { key: 'youtube', label: 'YouTube URL', type: 'url', required: false, placeholder: 'https://youtube.com/...' },
              { key: 'spotify', label: 'Spotify URL', type: 'url', required: false, placeholder: 'https://open.spotify.com/...' },
              { key: 'bookingType', label: isAo ? 'Tipo de reserva' : 'Booking type', type: 'select', options: ['quote', 'fixed'] },
              { key: 'bookingPrice', label: isAo ? `Preço fixo (se aplicável)` : 'Fixed price (if applicable)', type: 'number', required: false, placeholder: '0' },
              { key: 'media', label: isAo ? 'Vídeos e Faixas (opcional)' : 'Videos & Tracks (optional)', type: 'media', required: false },
            ]}
          />
        </>
      )}

      <ArtistMediaManager
        country={country}
        artist={mediaManagerArtist}
        open={!!mediaManagerArtist}
        onClose={() => setMediaManagerArtist(null)}
        onUpdated={() => {
          load()
          // Keep the modal's view in sync by refetching the specific artist after a change
          axios.get(`/api/artists/${country}`).then(res => {
            const updated = res.data.find(x => x._id === mediaManagerArtist?._id)
            if (updated) setMediaManagerArtist(updated)
          })
        }}
      />
    </CountryLayout>
  )
}