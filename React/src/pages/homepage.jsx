import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

function AnimatedTitle() {
  const LINE1 = 'KC INTERNATIONAL'
  const LINE2 = 'PRODUCOES'
  const container = { hidden:{}, show:{ transition:{ staggerChildren:0.045, delayChildren:0.2 } } }
  const letter = { hidden:{opacity:0,y:70,rotateX:-90,scale:0.8}, show:{opacity:1,y:0,rotateX:0,scale:1,transition:{type:'spring',damping:14,stiffness:120}} }
  const line2 = { hidden:{}, show:{ transition:{ staggerChildren:0.06, delayChildren:0.9 } } }
  return (
    <div style={{ textAlign:'center', perspective:900 }}>
      <motion.div variants={container} initial="hidden" animate="show"
        style={{ display:'flex', justifyContent:'center', flexWrap:'wrap',
          fontSize:'clamp(36px,9vw,100px)', fontWeight:800, letterSpacing:'4px',
          color:'#F8FAFC', lineHeight:1, marginBottom:8 }}>
        {LINE1.split('').map((ch,i)=>(
          <motion.span key={i} variants={letter} style={{ display:'inline-block', marginRight: ch===' '?'0.25em':0, transformOrigin:'bottom center' }}>
            {ch===' '?'\u00A0':ch}
          </motion.span>
        ))}
      </motion.div>
      <motion.div variants={line2} initial="hidden" animate="show"
        style={{ display:'flex', justifyContent:'center', flexWrap:'wrap',
          fontSize:'clamp(20px,4.5vw,52px)', fontWeight:800, letterSpacing:'12px', lineHeight:1 }}>
        {LINE2.split('').map((ch,i)=>(
          <motion.span key={i} variants={letter} style={{
            display:'inline-block',
            background:'linear-gradient(90deg,#1D4ED8,#60A5FA,#93C5FD,#60A5FA,#1D4ED8)',
            backgroundSize:'300% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            backgroundClip:'text', animation:'shimmer 4s linear infinite', transformOrigin:'bottom center',
          }}>{ch}</motion.span>
        ))}
      </motion.div>
    </div>
  )
}

const AngolaFlag = () => (
  <svg width="80" height="52" viewBox="0 0 900 600" style={{ borderRadius:8, display:'block' }}>
    <rect width="900" height="300" fill="#CC0000"/>
    <rect y="300" width="900" height="300" fill="#000"/>
    <g transform="translate(450,300)">
      <circle r="80" fill="none" stroke="#FFCC00" strokeWidth="18"/>
      <path d="M-30,-70 L0,-20 L30,-70 L20,10 L60,40 L10,40 L0,90 L-10,40 L-60,40 L-20,10 Z" fill="#FFCC00"/>
      <path d="M-80,20 L80,20" stroke="#FFCC00" strokeWidth="14" strokeLinecap="round"/>
    </g>
  </svg>
)
const UKFlag = () => (
  <svg width="80" height="52" viewBox="0 0 900 600" style={{ borderRadius:8, display:'block' }}>
    <rect width="900" height="600" fill="#012169"/>
    <path d="M0,0 L900,600 M900,0 L0,600" stroke="#fff" strokeWidth="120"/>
    <path d="M0,0 L900,600 M900,0 L0,600" stroke="#C8102E" strokeWidth="80"/>
    <path d="M450,0 V600 M0,300 H900" stroke="#fff" strokeWidth="180"/>
    <path d="M450,0 V600 M0,300 H900" stroke="#C8102E" strokeWidth="120"/>
  </svg>
)

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      {/* Simple top bar — login/join only, no Artists/Events/Shop/Services here */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 28px' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:'50%',
            background:'linear-gradient(135deg,#2563EB,#1A4A8A)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:800, fontSize:13, color:'#fff' }}>KC</div>
          <span style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>KC International</span>
        </Link>

        {!user && (
          <div style={{ display:'flex', gap:10 }}>
            <Link to="/login" className="btn-outline" style={{ padding:'8px 18px', fontSize:13 }}>Login</Link>
            <Link to="/join" className="btn-primary" style={{ padding:'8px 20px', fontSize:13 }}>Join</Link>
          </div>
        )}
      </nav>

      {/* Title */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px',
        background:'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.13) 0%, transparent 65%)' }}>
        <AnimatedTitle/>
        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1.7,duration:0.7}}
          style={{ fontSize:'clamp(14px,1.8vw,17px)', color:'#64748B', maxWidth:520, margin:'28px auto 0', lineHeight:1.8, textAlign:'center' }}>
          Artist development · Live events · Merchandise · Comedy &amp; music shows.
          <br/>Connecting cultures across Angola and the United Kingdom.
        </motion.p>

        {/* Dashboard button — admin only, sits between subtitle and flags */}
        {user?.role === 'admin' && (
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:1.9,duration:0.5}}
            style={{ marginTop:36, display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <button
              onClick={() => navigate('/admin')}
              style={{
                background:'linear-gradient(135deg,#1D4ED8,#2563EB)',
                border:'none', borderRadius:12, padding:'12px 32px',
                fontSize:14, fontWeight:700, color:'#fff', cursor:'pointer',
                boxShadow:'0 4px 20px rgba(37,99,235,0.35)',
                transition:'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(37,99,235,0.5)' }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 20px rgba(37,99,235,0.35)' }}
            >
              ⚙️ Admin Dashboard
            </button>
            <span style={{ fontSize:11, color:'#475569', letterSpacing:1 }}>or pick a region below to browse</span>
          </motion.div>
        )}

        {/* Flag selector */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:2,duration:0.6}}
          style={{ marginTop: user?.role === 'admin' ? 28 : 48, display:'flex', flexDirection:'column', alignItems:'center', gap:18 }}>
          <div style={{ fontSize:12, letterSpacing:2, textTransform:'uppercase', color:'#3B82F6' }}>
            {user?.role === 'admin' ? 'Select a region to manage' : 'Where are you located?'}
          </div>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap', justifyContent:'center' }}>

            <motion.button onClick={() => navigate('/angola')}
              whileHover={{ scale:1.05, y:-3 }} whileTap={{ scale:0.97 }}
              style={{
                background:'rgba(13,37,69,0.5)', border:'2px solid rgba(204,0,0,0.3)',
                borderRadius:18, padding:'20px 32px', display:'flex', flexDirection:'column',
                alignItems:'center', gap:12, cursor:'pointer', minWidth:170,
                transition:'border-color 0.25s, box-shadow 0.25s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#CC0000'; e.currentTarget.style.boxShadow='0 0 32px rgba(204,0,0,0.22)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(204,0,0,0.3)'; e.currentTarget.style.boxShadow='none'}}
            >
              <AngolaFlag/>
              <span style={{ fontSize:14, fontWeight:600, color:'#F8FAFC' }}>🇦🇴 Angola</span>
            </motion.button>

            <motion.button onClick={() => navigate('/uk')}
              whileHover={{ scale:1.05, y:-3 }} whileTap={{ scale:0.97 }}
              style={{
                background:'rgba(13,37,69,0.5)', border:'2px solid rgba(1,33,105,0.4)',
                borderRadius:18, padding:'20px 32px', display:'flex', flexDirection:'column',
                alignItems:'center', gap:12, cursor:'pointer', minWidth:170,
                transition:'border-color 0.25s, box-shadow 0.25s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#3B82F6'; e.currentTarget.style.boxShadow='0 0 32px rgba(37,99,235,0.22)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(1,33,105,0.4)'; e.currentTarget.style.boxShadow='none'}}
            >
              <UKFlag/>
              <span style={{ fontSize:14, fontWeight:600, color:'#F8FAFC' }}>🇬🇧 United Kingdom</span>
            </motion.button>

          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer style={{ background:'#030712', borderTop:'1px solid rgba(148,163,184,0.07)', padding:'28px 24px', textAlign:'center' }}>
        <div style={{ fontSize:14, fontWeight:800, color:'#F8FAFC', letterSpacing:1 }}>KC International Producoes</div>
        <div style={{ fontSize:12, color:'#1E293B', marginTop:6 }}>© {new Date().getFullYear()} · Liverpool, UK · Angola</div>
      </footer>
    </div>
  )
}