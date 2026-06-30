import CountryBackground from './CountryBackground.jsx'
import CountryNavbar from './CountryNavbar.jsx'
import KCTitle from './KCTitle.jsx'
import ContactForm from './ContactForm.jsx'
import ReviewsSection from './ReviewsSection.jsx'
import { Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'
import { getTheme } from '../theme.js'

export default function CountryLayout({ country, activePage, children }) {
  const t = getTheme(country)
  const { user } = useAuth()

  return (
    <div style={{ minHeight:'100vh', position:'relative', overflowX:'hidden' }}>
      <CountryBackground country={country} />
      <CountryNavbar country={country} activePage={activePage} />

      <div style={{ position:'relative', zIndex:2, paddingTop:64 }}>
        <KCTitle country={country} />

        <div style={{ padding:'16px 32px 0' }}>
          <Link to={`/${country}`} style={{
            display:'inline-flex', alignItems:'center', gap:8,
            color: t.backColor, fontSize:13, fontWeight:500,
          }}>
            <FiArrowLeft size={14}/>
            {country==='ao' ? 'Voltar' : 'Back'}
          </Link>
        </div>

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'48px 24px 0' }}>
          {children}
        </div>

        {/* Admins manage content directly — they don't need to "register interest" */}
        {!user && <ContactForm country={country} />}

        <ReviewsSection country={country} />

        <div style={{
          padding:'24px 32px', textAlign:'center',
          borderTop:`1px solid ${t.divider}`,
          color: t.footerText, fontSize:13,
        }}>
          © {new Date().getFullYear()} KC International Producoes · {t.flag} {t.label}
        </div>
      </div>
    </div>
  )
}