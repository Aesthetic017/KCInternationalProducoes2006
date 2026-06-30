import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiSettings, FiArrowRight } from 'react-icons/fi'
import CountryLayout from '../../components/CountryLayout.jsx'
import AdminFab from '../../components/AdminFab.jsx'
import AdminAddModal from '../../components/AdminAddModal.jsx'
import DeleteButton from '../../components/DeleteButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getTheme } from '../../theme.js'

export default function ServicesPage() {
  const { country } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const t = getTheme(country)
  const isAo = country === 'ao'
  const isAdmin = user?.role === 'admin'
  const currency = isAo ? 'Kz' : '£'

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const load = () => {
    axios.get(`/api/services/${country}`)
      .then(res => setServices(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [country])

  const handleAdd = async (form) => {
    await axios.post('/api/services', { ...form, country })
    load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return
    await axios.delete(`/api/services/${id}`)
    setServices(prev => prev.filter(s => s._id !== id))
  }

  return (
    <CountryLayout country={country} activePage={`/${country}/services`}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: t.sectionLabel, marginBottom: 8 }}>
          {isAo ? 'O que oferecemos' : 'What we offer'}
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, color: t.text }}>
          {isAo ? 'Serviços' : 'Services'}
        </h1>
        <p style={{ fontSize: 16, color: t.textMuted, marginTop: 14, maxWidth: 720, lineHeight: 1.75 }}>
          {isAo
            ? 'Organizar um evento pode ser uma tarefa exigente, mas com a Kcinternacional2006 Produções está em boas mãos. Somos especialistas em planeamento e gestão de eventos, oferecendo um serviço completo que cobre cada detalhe. De funções corporativas a celebrações privadas, tratamos de todos os aspetos do seu evento, da conceção à execução. A nossa equipa experiente trabalha de perto consigo para compreender a sua visão e torná-la realidade, garantindo uma experiência tranquila e memorável para si e para os seus convidados. Deixe-nos cuidar dos detalhes, para que possa concentrar-se em aproveitar o momento.'
            : 'Organising an event can be a daunting task, but with KC International Produções, you\u2019re in capable hands. We specialise in event planning and management, offering a comprehensive service that covers every detail. From corporate functions to private celebrations, we handle every aspect of your event from concept to execution. Our experienced team works closely with you to understand your vision and bring it to life, ensuring a seamless and enjoyable experience for you and your guests. Let us take the stress out of planning so you can focus on enjoying the occasion.'}
        </p>
      </motion.div>

      {loading ? (
        <div style={{ color: t.textMuted, fontSize: 14 }}>Loading...</div>
      ) : services.length === 0 ? (
        <div style={{ color: t.textMuted, fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
          {isAo ? 'Nenhum serviço adicionado ainda.' : 'No services added yet.'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {services.map((s, i) => (
            <motion.div key={s._id}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              onClick={() => navigate(`/${country}/services/${s._id}`)}
              style={{
                position: 'relative',
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                borderRadius: 18,
                padding: '22px 22px 20px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'border-color 0.25s, box-shadow 0.25s',
                display: 'flex', flexDirection: 'column', gap: 14,
                minHeight: 200,
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
              {isAdmin && <DeleteButton onClick={() => handleDelete(s._id)} />}

              <div style={{
                width: 46, height: 46, borderRadius: 13,
                background: t.iconBg, border: `1px solid ${t.iconBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: t.iconColor, fontSize: 21,
              }}>
                <FiSettings />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 6 }}>{s.title}</div>
                <div style={{
                  fontSize: 13, color: t.textMuted, lineHeight: 1.65,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                }}>
                  {s.desc}
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 14, borderTop: `1px solid ${t.divider}`,
              }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: t.accentAlt }}>
                  {s.price > 0 ? `${currency}${s.price}` : (isAo ? 'Sob consulta' : 'Contact us')}
                </span>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 12.5, fontWeight: 600, color: t.text,
                }}>
                  <FiArrowRight size={13} />
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
            title={isAo ? 'Adicionar Serviço' : 'Add Service'}
            onSubmit={handleAdd}
            fields={[
              { key: 'title', label: isAo ? 'Título' : 'Title', placeholder: 'e.g. Artist Development' },
              { key: 'desc', label: isAo ? 'Descrição' : 'Description', placeholder: 'Studio time, coaching...' },
              { key: 'price', label: `${isAo ? 'Preço' : 'Price'} (${currency}) — ${isAo ? '0 = sob consulta' : '0 = contact us'}`, type: 'number', required: false, placeholder: '0' },
            ]}
          />
        </>
      )}
    </CountryLayout>
  )
}