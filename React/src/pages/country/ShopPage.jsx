import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiShoppingBag } from 'react-icons/fi'
import CountryLayout from '../../components/CountryLayout.jsx'
import AdminFab from '../../components/AdminFab.jsx'
import AdminAddModal from '../../components/AdminAddModal.jsx'
import DeleteButton from '../../components/DeleteButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getTheme } from '../../theme.js'

export default function ShopPage() {
  const { country } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const t = getTheme(country)
  const isAo = country === 'ao'
  const isAdmin = user?.role === 'admin'
  const defaultCurrency = isAo ? 'Kz' : '£'

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const load = () => {
    axios.get(`/api/products/${country}`)
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [country])

  const handleAdd = async (form) => {
    await axios.post('/api/products', { ...form, country, currency: defaultCurrency })
    load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await axios.delete(`/api/products/${id}`)
    setProducts(prev => prev.filter(p => p._id !== id))
  }

  const totalStock = (p) => p.category === 'clothing' ? (p.sizes || []).reduce((sum, s) => sum + s.stock, 0) : null

  return (
    <CountryLayout country={country} activePage={`/${country}/shop`}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: t.sectionLabel, marginBottom: 8 }}>
          {isAo ? 'Loja oficial' : 'Official store'}
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, color: t.text }}>
          {isAo ? 'Loja' : 'Shop'}
        </h1>
        <p style={{ fontSize: 16, color: t.textMuted, marginTop: 8 }}>
          {isAo ? 'Roupa, música e cartões-presente.' : 'Clothing, music, and gift cards.'}
        </p>
      </motion.div>

      {loading ? (
        <div style={{ color: t.textMuted, fontSize: 14 }}>Loading...</div>
      ) : products.length === 0 ? (
        <div style={{ color: t.textMuted, fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
          {isAo ? 'Nenhum produto adicionado ainda.' : 'No products added yet.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
          {products.map((p, i) => {
            const stock = totalStock(p)
            const outOfStock = stock !== null && stock <= 0
            return (
              <motion.div key={p._id}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/${country}/shop/${p._id}`)}
                style={{
                  position: 'relative', background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                  borderRadius: 18, overflow: 'hidden', backdropFilter: 'blur(10px)', cursor: 'pointer',
                  transition: 'border-color 0.25s, box-shadow 0.25s', display: 'flex', flexDirection: 'column',
                  opacity: outOfStock ? 0.6 : 1,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = t.cardBorderHover; e.currentTarget.style.boxShadow = `0 12px 32px -8px ${t.accentGlow}` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.boxShadow = 'none' }}
              >
                {isAdmin && <DeleteButton onClick={() => handleDelete(p._id)} />}

                <div style={{
                  width: '100%', aspectRatio: '4 / 3', position: 'relative',
                  background: p.image ? `linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.35) 100%), ${t.accent}10` : `linear-gradient(135deg, ${t.accent}18, ${t.accent}05)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  {p.image ? (
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: `${t.accent}1a`, border: `1px solid ${t.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                      {p.icon || <FiShoppingBag style={{ color: t.iconColor }} />}
                    </div>
                  )}
                  {outOfStock && (
                    <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(0,0,0,0.7)', color: '#FCA5A5' }}>
                      {isAo ? 'Esgotado' : 'Out of stock'}
                    </span>
                  )}
                </div>

                <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <div style={{ fontWeight: 700, color: t.text, fontSize: 14.5, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {p.name}
                  </div>
                  <div style={{ fontWeight: 800, color: t.accentAlt, fontSize: 17, marginTop: 'auto' }}>
                    {p.currency}{p.price}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {isAdmin && (
        <>
          <AdminFab country={country} onClick={() => setModalOpen(true)} />
          <AdminAddModal
            country={country}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title={isAo ? 'Adicionar Produto' : 'Add Product'}
            onSubmit={handleAdd}
            fields={[
              { key: 'image', label: isAo ? 'Foto do produto' : 'Product photo', type: 'image', required: false },
              { key: 'name', label: isAo ? 'Nome do produto' : 'Product name', placeholder: 'e.g. Classic Tee' },
              { key: 'icon', label: isAo ? 'Emoji (se não houver foto)' : 'Emoji icon (if no photo)', required: false, placeholder: '👕' },
              { key: 'price', label: `${isAo ? 'Preço' : 'Price'} (${defaultCurrency})`, type: 'number', placeholder: '24.99' },
              { key: 'category', label: isAo ? 'Categoria' : 'Category', type: 'select', options: ['clothing', 'other'] },
              { key: 'sizes', label: isAo ? 'Tamanhos e Stock' : 'Sizes & Stock', type: 'sizes', required: false, showIf: (form) => form.category === 'clothing' },
            ]}
          />
        </>
      )}
    </CountryLayout>
  )
}