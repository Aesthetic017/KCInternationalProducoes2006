import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import CountryBackground from '../components/CountryBackground.jsx'
import CountryNavbar from '../components/CountryNavbar.jsx'
import ContactForm from '../components/ContactForm.jsx'
import ReviewsSection from '../components/ReviewsSection.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getTheme } from '../theme.js'

export default function AngolaPage() {
  const t = getTheme('ao')
  const { user } = useAuth()

  return (
    <div style={{ minHeight:'100vh', position:'relative', overflowX:'hidden' }}>
      <CountryBackground country="ao" />
      <CountryNavbar country="ao" activePage="/ao" />

      <div style={{ position:'relative', zIndex:2, paddingTop:64 }}>

        <motion.div initial={{opacity:0,y:50}} animate={{opacity:1,y:0}} transition={{duration:0.8}}
          style={{ textAlign:'center', padding:'80px 24px 48px' }}>
          <motion.div initial={{scale:0.4,opacity:0}} animate={{scale:1,opacity:1}}
            transition={{duration:0.7,delay:0.15,type:'spring',stiffness:130}}
            style={{ fontSize:72, lineHeight:1, marginBottom:20 }}>🇦🇴</motion.div>

          <div style={{ fontSize:11, letterSpacing:4, textTransform:'uppercase', color:'rgba(212,160,0,0.6)', marginBottom:12 }}>
            KC International Producoes
          </div>
          <h1 style={{
            fontSize:'clamp(40px,9vw,96px)', fontWeight:800, lineHeight:1.05, marginBottom:16,
            background: t.headingGradient, backgroundSize:'200% auto',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            animation:'shimmer 4s linear infinite',
          }}>ANGOLA</h1>
          <p style={{ fontSize:'clamp(14px,2vw,17px)', color:'rgba(255,215,0,0.55)', maxWidth:480, margin:'0 auto 36px', lineHeight:1.8 }}>
            Serviços, eventos e oportunidades disponíveis em Angola.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/ao/artists" className="btn" style={{ background:t.btnPrimary, color:t.btnPrimaryColor, border:`1px solid ${t.btnPrimaryBorder}`, padding:'13px 30px', fontSize:15, fontWeight:700, boxShadow:t.btnPrimaryShadow, display:'inline-flex', alignItems:'center', gap:8, borderRadius:10 }}>
              Ver Artistas <FiArrowRight/>
            </Link>
            <Link to="/ao/events" className="btn" style={{ background:'transparent', color:t.btnOutlineColor, border:`2px solid ${t.btnOutlineBorder}`, padding:'13px 30px', fontSize:15, fontWeight:700, borderRadius:10 }}>
              Próximos Eventos
            </Link>
          </div>
        </motion.div>

        <div style={{ display:'flex', justifyContent:'center', gap:48, padding:'28px 24px', flexWrap:'wrap',
          borderTop:`1px solid ${t.divider}`, borderBottom:`1px solid ${t.divider}` }}>
          {[['50+','Artistas'],['20+','Eventos'],['2K+','Fãs'],['5+','Anos']].map(([n,l])=>(
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontSize:32, fontWeight:800, color:'#FFD700', lineHeight:1 }}>{n}</div>
              <div style={{ fontSize:11, color:'rgba(212,160,0,0.45)', letterSpacing:2, textTransform:'uppercase', marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'64px 24px', textAlign:'center' }}>
          <p style={{ fontSize:15, color:t.textMuted }}>
            Use the menu above to explore Artistas, Eventos, Loja e Serviços.
          </p>
        </div>

        {/* Admins manage content directly — they don't need to "register interest" */}
        {!user && <ContactForm country="ao" />}

        <ReviewsSection country="ao" />

        <div style={{ padding:'24px', textAlign:'center', borderTop:`1px solid ${t.divider}`, color:t.footerText, fontSize:13 }}>
          © {new Date().getFullYear()} KC International Producoes · Angola
        </div>
      </div>
    </div>
  )
}