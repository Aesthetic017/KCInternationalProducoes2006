import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import CountryBackground from '../components/CountryBackground.jsx'
import CountryNavbar from '../components/CountryNavbar.jsx'
import ContactForm from '../components/ContactForm.jsx'
import ReviewsSection from '../components/ReviewsSection.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getTheme } from '../theme.js'

export default function UKPage() {
  const t = getTheme('uk')
  const { user } = useAuth()

  return (
    <div style={{ minHeight:'100vh', position:'relative', overflowX:'hidden' }}>
      <CountryBackground country="uk" />
      <CountryNavbar country="uk" activePage="/uk" />

      <div style={{ position:'relative', zIndex:2, paddingTop:64 }}>

        <motion.div initial={{opacity:0,y:50}} animate={{opacity:1,y:0}} transition={{duration:0.8}}
          style={{ textAlign:'center', padding:'80px 24px 48px' }}>
          <motion.div initial={{scale:0.4,opacity:0}} animate={{scale:1,opacity:1}}
            transition={{duration:0.7,delay:0.15,type:'spring',stiffness:130}}
            style={{ fontSize:72, lineHeight:1, marginBottom:20 }}>🇬🇧</motion.div>

          <div style={{ fontSize:11, letterSpacing:4, textTransform:'uppercase', color:'rgba(200,16,46,0.65)', marginBottom:12 }}>
            KC International Producoes
          </div>
          <h1 style={{
            fontSize:'clamp(32px,7vw,88px)', fontWeight:800, lineHeight:1.05, marginBottom:16,
            background: t.headingGradient, backgroundSize:'200% auto',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            animation:'shimmer 5s linear infinite',
          }}>UNITED KINGDOM</h1>
          <p style={{ fontSize:'clamp(14px,2vw,17px)', color:'rgba(180,200,255,0.5)', maxWidth:480, margin:'0 auto 36px', lineHeight:1.8 }}>
            Services, events and opportunities available across the United Kingdom.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/uk/artists" className="btn" style={{ background:t.btnPrimary, color:t.btnPrimaryColor, border:`1px solid ${t.btnPrimaryBorder}`, padding:'13px 30px', fontSize:15, fontWeight:700, boxShadow:t.btnPrimaryShadow, display:'inline-flex', alignItems:'center', gap:8, borderRadius:10 }}>
              Explore Artists <FiArrowRight/>
            </Link>
            <Link to="/uk/events" className="btn" style={{ background:'transparent', color:t.btnOutlineColor, border:`2px solid ${t.btnOutlineBorder}`, padding:'13px 30px', fontSize:15, fontWeight:700, borderRadius:10 }}>
              Upcoming Events
            </Link>
          </div>
        </motion.div>

        <div style={{ display:'flex', justifyContent:'center', gap:48, padding:'28px 24px', flexWrap:'wrap',
          borderTop:`1px solid ${t.divider}`, borderBottom:`1px solid ${t.divider}` }}>
          {[['50+','Artists'],['200+','Events'],['5K+','Fans'],['10+','Years']].map(([n,l])=>(
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontSize:32, fontWeight:800, color:'#fff', lineHeight:1 }}>{n}</div>
              <div style={{ fontSize:11, color:'rgba(180,200,255,0.35)', letterSpacing:2, textTransform:'uppercase', marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ maxWidth:820, margin:'0 auto', padding:'64px 24px' }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(200,16,46,0.6)', marginBottom: 8, textAlign:'center' }}>
            Liverpool-based entertainment
          </div>
          <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: t.text, textAlign:'center', marginBottom: 20 }}>
            About Us
          </h2>
          <p style={{ fontSize: 15, color: t.textMuted, lineHeight: 1.85, marginBottom: 16 }}>
            Welcome to KC International Produções, your premier source for outstanding entertainment in Liverpool. We specialise in bringing vibrant live performances, comedy shows, and memorable events to life. With years of experience behind us, we are passionate about delivering quality, engaging entertainment for our audience. Our team works tirelessly to curate a diverse range of performances that captivate and inspire — whether you're looking for a night of laughter or an unforgettable live music experience, we have something for everyone.
          </p>
          <p style={{ fontSize: 15, color: t.textMuted, lineHeight: 1.85 }}>
            We believe in the power of performance and connection. Our commitment is to not only meet but exceed your entertainment needs with creativity and flair. We pride ourselves on collaborating with talented artists, ensuring every show is unique and memorable. Our events are tailored for a variety of audiences, making us the go-to choice for entertainment in Liverpool — and we're devoted to enhancing the local culture and community through everything we produce. Come and discover the joy of live entertainment with us.
          </p>
        </div>

        {/* Admins manage content directly — they don't need to "register interest" */}
        {!user && <ContactForm country="uk" />}

        <ReviewsSection country="uk" />

        <div style={{ padding:'24px', textAlign:'center', borderTop:`1px solid ${t.divider}`, color:t.footerText, fontSize:13 }}>
          © {new Date().getFullYear()} KC International Producoes · Liverpool, UK
        </div>
      </div>
    </div>
  )
}