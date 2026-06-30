import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/artists', label: 'Artists' },
  { to: '/events',  label: 'Events'  },
  { to: '/shop',    label: 'Shop'    },
  { to: '/services',label: 'Services'},
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const location = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setOpen(false), [location])

  const navBg = scrolled
    ? 'rgba(5,10,20,0.92)'
    : 'transparent'
  const navBorder = scrolled
    ? '1px solid rgba(148,163,184,0.1)'
    : '1px solid transparent'

  return (
    <nav style={{
      position:     'fixed',
      top: 0, left: 0, right: 0,
      zIndex:       1000,
      padding:      '0 28px',
      height:       64,
      display:      'flex',
      alignItems:   'center',
      justifyContent:'space-between',
      background:   navBg,
      borderBottom: navBorder,
      backdropFilter: scrolled ? 'blur(18px)' : 'none',
      transition:   'background 0.35s, border-color 0.35s, backdrop-filter 0.35s',
    }}>

      {/* Logo */}
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
        <div style={{
          width:36, height:36, borderRadius:'50%',
          background:'linear-gradient(135deg,#2563EB,#1A4A8A)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:700, fontSize:13, color:'#fff', flexShrink:0,
        }}>KC</div>
        <div>
          <div style={{
            fontSize:15, fontWeight:600,
            color:'#F8FAFC', letterSpacing:1,
            lineHeight:1.1,
          }}>KC International</div>
          <div style={{
            fontSize:9, color:'#64748B',
            letterSpacing:3, textTransform:'uppercase',
          }}>Producoes</div>
        </div>
      </Link>

      {/* Desktop links */}
      <div style={{ display:'flex', gap:28, alignItems:'center' }}>
        {NAV_LINKS.map(l => (
          <Link key={l.to} to={l.to} style={{
            fontSize:14, fontWeight:500,
            color: location.pathname.startsWith(l.to) ? '#3B82F6' : '#94A3B8',
            transition:'color 0.2s',
          }}
          onMouseEnter={e => e.target.style.color='#CBD5E1'}
          onMouseLeave={e => e.target.style.color = location.pathname.startsWith(l.to) ? '#3B82F6' : '#94A3B8'}
          >{l.label}</Link>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display:'flex', gap:10 }}>
        <Link to="/login" className="btn-outline" style={{ padding:'7px 16px', fontSize:13 }}>Login</Link>
        <Link to="/register" className="btn-primary" style={{ padding:'7px 18px', fontSize:13 }}>Join</Link>
      </div>
    </nav>
  )
}