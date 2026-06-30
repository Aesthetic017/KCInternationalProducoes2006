import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiArrowLeft, FiShoppingBag, FiCheck } from 'react-icons/fi'
import CountryBackground from '../../components/CountryBackground.jsx'
import CountryNavbar from '../../components/CountryNavbar.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { getTheme } from '../../theme.js'

export default function ProductDetailPage() {
  const { country, id } = useParams()
  const navigate = useNavigate()
  const t = getTheme(country)
  const isAo = country === 'ao'
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const [selectedSize, setSelectedSize] = useState(null)
  const [sizeError, setSizeError] = useState('')

  useEffect(() => {
    axios.get(`/api/products/${country}`)
      .then(res => setProduct(res.data.find(p => p._id === id)))
      .finally(() => setLoading(false))
  }, [country, id])

  const isClothing = product?.category === 'clothing'
  const availableSizes = (product?.sizes || []).filter(s => s.stock > 0)

  const handleAddToCart = () => {
    if (isClothing) {
      if (!selectedSize) {
        setSizeError(isAo ? 'Selecione um tamanho' : 'Please select a size')
        return
      }
    }
    setSizeError('')

    const result = addItem({
      id: product._id, type: 'product', name: product.name,
      price: product.price, currency: product.currency,
      image: product.image, icon: product.icon, country,
      size: isClothing ? selectedSize : undefined,
    })
    if (result.requiresLogin) {
      navigate(`/login?redirect=/${country}/shop/${id}`)
      return
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#050A14' }} />
  if (!product) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050A14', color: '#64748B' }}>
      {isAo ? 'Produto não encontrado.' : 'Product not found.'}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <CountryBackground country={country} />
      <CountryNavbar country={country} activePage={`/${country}/shop`} />

      <div style={{ position: 'relative', zIndex: 2, paddingTop: 90, maxWidth: 900, margin: '0 auto', padding: '90px 24px 60px' }}>
        <Link to={`/${country}/shop`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: t.backColor, fontSize: 13, marginBottom: 24 }}>
          <FiArrowLeft size={14} /> {isAo ? 'Voltar à Loja' : 'Back to Shop'}
        </Link>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'start' }}
        >
          <div style={{
            aspectRatio: '1', borderRadius: 20, overflow: 'hidden',
            background: `${t.accent}15`, border: `1px solid ${t.cardBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80,
          }}>
            {product.image ? (
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (product.icon || '🛍️')}
          </div>

          <div>
            <h1 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, color: t.text, marginBottom: 12 }}>{product.name}</h1>
            <div style={{ fontSize: 28, fontWeight: 800, color: t.accentAlt, marginBottom: 24 }}>
              {product.currency}{product.price}
            </div>

            {isClothing && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 10 }}>
                  {isAo ? 'Selecione o tamanho' : 'Select size'}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['XS', 'S', 'M', 'L', 'XL'].map(size => {
                    const sizeData = (product.sizes || []).find(s => s.size === size)
                    const inStock = sizeData && sizeData.stock > 0
                    return (
                      <button
                        key={size}
                        disabled={!inStock}
                        onClick={() => { setSelectedSize(size); setSizeError('') }}
                        style={{
                          width: 46, height: 46, borderRadius: 10,
                          background: selectedSize === size ? t.accent : 'transparent',
                          color: !inStock ? t.textMuted : (selectedSize === size ? t.btnPrimaryColor : t.text),
                          border: `1px solid ${selectedSize === size ? t.accent : t.cardBorder}`,
                          fontSize: 14, fontWeight: 600, cursor: inStock ? 'pointer' : 'not-allowed',
                          opacity: inStock ? 1 : 0.35,
                          textDecoration: inStock ? 'none' : 'line-through',
                        }}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
                {sizeError && <div style={{ color: '#FCA5A5', fontSize: 12, marginTop: 8 }}>{sizeError}</div>}
                {availableSizes.length === 0 && (
                  <div style={{ color: '#FCA5A5', fontSize: 13, marginTop: 8 }}>
                    {isAo ? 'Todos os tamanhos esgotados.' : 'All sizes out of stock.'}
                  </div>
                )}
              </div>
            )}

            <button onClick={handleAddToCart} disabled={isClothing && availableSizes.length === 0} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', background: added ? `${t.accent}33` : t.btnPrimary,
              color: t.btnPrimaryColor, border: `1px solid ${t.btnPrimaryBorder}`,
              borderRadius: 12, padding: '15px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              boxShadow: t.btnPrimaryShadow, transition: 'background 0.2s',
              opacity: (isClothing && availableSizes.length === 0) ? 0.5 : 1,
            }}>
              {added ? <><FiCheck /> {isAo ? 'Adicionado!' : 'Added to Cart!'}</> : <><FiShoppingBag /> {isAo ? 'Adicionar ao Carrinho' : 'Add to Cart'}</>}
            </button>

            <p style={{ fontSize: 13, color: t.textMuted, marginTop: 16, lineHeight: 1.7 }}>
              {isAo ? 'Produto oficial KC International. Entrega disponível em Angola.' : 'Official KC International merchandise. Free UK shipping over £50.'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}