import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiMenuAlt3, HiX } from 'react-icons/hi'
import { FiLogOut, FiShoppingBag, FiUser } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import CartDrawer from './CartDrawer.jsx'
import { getTheme } from '../theme.js'

export default function CountryNavbar({ country, activePage }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const t = getTheme(country)
  const base = `/${country}`

  const LINKS = [
    { to:`${base}/artists`,  label:country==='ao'?'Artistas':'Artists'  },
    { to:`${base}/events`,   label:country==='ao'?'Eventos':'Events'    },
    { to:`${base}/shop`,     label:country==='ao'?'Loja':'Shop'         },
    { to:`${base}/services`, label:country==='ao'?'Serviços':'Services' },
  ]

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>40)
    window.addEventListener('scroll',fn)
    return ()=>window.removeEventListener('scroll',fn)
  },[])

  const isAdmin = user?.role === 'admin'

  return (
    <>
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:1000,height:64,
        display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',
        background:scrolled?'rgba(0,0,0,0.9)':'transparent',
        backdropFilter:scrolled?'blur(20px)':'none',
        borderBottom:scrolled?`1px solid ${t.divider}`:'1px solid transparent',
        transition:'all 0.35s ease' }}>

        <Link to={base} style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{ width:36,height:36,borderRadius:'50%',
            background:`linear-gradient(135deg,${t.accent},${t.accent}99)`,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontWeight:800,fontSize:13,color:country==='ao'?'#FFD700':'#fff',
            boxShadow:`0 0 14px ${t.accentGlow}` }}>KC</div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:'#F8FAFC',letterSpacing:0.5,lineHeight:1.1}}>KC International</div>
            <div style={{fontSize:9,color:t.navbarSubtext,letterSpacing:2,textTransform:'uppercase'}}>{t.flag} {t.label}</div>
          </div>
        </Link>

        <div style={{display:'flex',gap:28,alignItems:'center'}} className="kc-desk-links">
          {LINKS.map(l=>(
            <Link key={l.to} to={l.to} style={{
              fontSize:14,fontWeight:500,
              color:activePage===l.to?t.accentAlt:t.textMuted,
              borderBottom:activePage===l.to?`2px solid ${t.accent}`:'2px solid transparent',
              paddingBottom:2,transition:'color 0.2s'}}
              onMouseEnter={e=>e.currentTarget.style.color=t.text}
              onMouseLeave={e=>e.currentTarget.style.color=activePage===l.to?t.accentAlt:t.textMuted}
            >{l.label}</Link>
          ))}
        </div>

        <div style={{display:'flex',gap:14,alignItems:'center'}}>
          {/* Cart icon — only show for logged-in regular users, not admin */}
          {user && !isAdmin && (
            <button onClick={() => setCartOpen(true)} style={{
              position: 'relative', color: t.textMuted, fontSize: 19, padding: 6,
              transition: 'color 0.2s', background: 'none', border: 'none', cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.color = t.text}
              onMouseLeave={e => e.currentTarget.style.color = t.textMuted}
              aria-label="Open cart"
            >
              <FiShoppingBag />
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -4,
                  background: t.accent, color: country === 'ao' ? '#FFD700' : '#fff',
                  fontSize: 10, fontWeight: 700, borderRadius: '50%',
                  width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{count}</span>
              )}
            </button>
          )}

          {user ? (
            <>
              {isAdmin ? (
                <div style={{display:'flex',alignItems:'center',gap:8,
                  background:`${t.accent}22`,border:`1px solid ${t.accent}44`,
                  borderRadius:20,padding:'5px 14px 5px 8px'}}>
                  <div style={{width:26,height:26,borderRadius:'50%',background:t.accent,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:11,fontWeight:700,color:country==='ao'?'#FFD700':'#fff'}}>
                    {user.name?.charAt(0).toUpperCase()}</div>
                  <span style={{fontSize:13,color:t.text}}>Admin</span>
                </div>
              ) : (
                <Link to="/account" style={{
                  display:'flex',alignItems:'center',gap:8,
                  background:`${t.accent}22`,border:`1px solid ${t.accent}44`,
                  borderRadius:20,padding:'5px 14px 5px 8px', cursor:'pointer',
                }}>
                  <div style={{width:26,height:26,borderRadius:'50%',background:t.accent,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:11,fontWeight:700,color:country==='ao'?'#FFD700':'#fff'}}>
                    {user.name?.charAt(0).toUpperCase()}</div>
                  <span style={{fontSize:13,color:t.text}}>@{user.username}</span>
                  <FiUser size={12} style={{ color: t.textMuted }} />
                </Link>
              )}
              <button onClick={()=>{logout();navigate('/')}} style={{
                display:'flex',alignItems:'center',gap:6,
                background:'transparent',border:`1px solid ${t.divider}`,
                color:t.textMuted,padding:'6px 14px',borderRadius:8,fontSize:13,cursor:'pointer'}}>
                <FiLogOut size={13}/> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{fontSize:13,fontWeight:500,color:t.textMuted,
                border:`1px solid ${t.cardBorder}`,padding:'6px 16px',borderRadius:8}}>Login</Link>
              <Link to={`/join?country=${country}`} style={{fontSize:13,fontWeight:600,
                background:t.btnPrimary,color:t.btnPrimaryColor,
                padding:'7px 18px',borderRadius:8,boxShadow:t.btnPrimaryShadow}}>Join</Link>
            </>
          )}
          <button onClick={()=>setOpen(o=>!o)} className="kc-burger"
            style={{color:t.textMuted,fontSize:22,padding:4,display:'none'}}>
            {open?<HiX/>:<HiMenuAlt3/>}
          </button>
        </div>
      </nav>

      {open && (
        <div style={{position:'fixed',top:64,left:0,right:0,bottom:0,zIndex:999,
          background:'rgba(0,0,0,0.97)',
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:28}}>
          {LINKS.map(l=>(
            <Link key={l.to} to={l.to} onClick={()=>setOpen(false)}
              style={{fontSize:22,fontWeight:700,color:t.text}}>{l.label}</Link>
          ))}
        </div>
      )}

      {user && !isAdmin && <CartDrawer country={country} open={cartOpen} onClose={() => setCartOpen(false)} />}

      <style>{`@media(max-width:768px){.kc-desk-links{display:none!important}.kc-burger{display:flex!important}}`}</style>
    </>
  )
}