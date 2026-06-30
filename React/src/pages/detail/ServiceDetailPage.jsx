import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiArrowLeft, FiSettings, FiShoppingBag, FiCheck } from 'react-icons/fi'
import CountryBackground from '../../components/CountryBackground.jsx'
import CountryNavbar from '../../components/CountryNavbar.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { getTheme } from '../../theme.js'

export default function ServiceDetailPage() {
  const { country, id } = useParams()
  const navigate = useNavigate()
  const t = getTheme(country)
  const isAo = country === 'ao'
  const currency = isAo ? 'Kz' : '£'
  const { addItem } = useCart()

  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    axios.get(`/api/services/${country}`)
      .then(res => setService(res.data.find(s => s._id === id)))
      .finally(() => setLoading(false))
  }, [country, id])

  const handleAddToCart = () => {
    const result = addItem({ id: service._id, type: 'service', name: service.title, price: service.price, currency, country })
    if (result.requiresLogin) {
      navigate(`/login?redirect=/${country}/services/${id}`)
      return
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#050A14' }} />
  if (!service) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050A14', color: '#64748B' }}>
      {isAo ? 'Serviço não encontrado.' : 'Service not found.'}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <CountryBackground country={country} />
      <CountryNavbar country={country} activePage={`/${country}/services`} />

      <div style={{ position: 'relative', zIndex: 2, paddingTop: 90, maxWidth: 700, margin: '0 auto', padding: '90px 24px 60px' }}>
        <Link to={`/${country}/services`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: t.backColor, fontSize: 13, marginBottom: 24 }}>
          <FiArrowLeft size={14} /> {isAo ? 'Voltar aos Serviços' : 'Back to Services'}
        </Link>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 20,
            padding: '36px 32px', backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: t.iconBg, border: `1px solid ${t.iconBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.iconColor, fontSize: 26, marginBottom: 20,
          }}>
            <FiSettings />
          </div>

          <h1 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, color: t.text, marginBottom: 16 }}>
            {service.title}
          </h1>

          <p style={{ fontSize: 15, color: t.textMuted, lineHeight: 1.8, marginBottom: 24 }}>
            {service.desc}
          </p>

          <div style={{ fontSize: 28, fontWeight: 800, color: t.accentAlt, marginBottom: 24 }}>
            {service.price > 0 ? `${currency}${service.price}` : (isAo ? 'Sob consulta' : 'Contact us')}
          </div>

          {service.price > 0 ? (
            <button onClick={handleAddToCart} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', background: added ? `${t.accent}33` : t.btnPrimary,
              color: t.btnPrimaryColor, border: `1px solid ${t.btnPrimaryBorder}`,
              borderRadius: 12, padding: '15px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              boxShadow: t.btnPrimaryShadow, transition: 'background 0.2s',
            }}>
              {added ? <><FiCheck /> {isAo ? 'Adicionado!' : 'Added to Cart!'}</> : <><FiShoppingBag /> {isAo ? 'Adicionar ao Carrinho' : 'Add to Cart'}</>}
            </button>
          ) : (
            <p style={{ fontSize: 13, color: t.textMuted }}>
              {isAo ? 'Use o formulário no fundo da página para solicitar um orçamento.' : 'Use the form at the bottom of the page to request a quote.'}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}