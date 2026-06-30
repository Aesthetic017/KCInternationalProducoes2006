import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getTheme } from '../../src/theme.js'
export default function KCTitle({ country }) {
  const t = getTheme(country)
  return (
    <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.6}}
      style={{ textAlign:'center',padding:'28px 24px 18px',
        borderBottom:`1px solid ${t.titleBannerBorder}`,
        background:'rgba(0,0,0,0.35)',backdropFilter:'blur(12px)' }}>
      <Link to="/" style={{display:'inline-block'}}>
        <div style={{fontSize:'clamp(18px,3.5vw,32px)',fontWeight:800,letterSpacing:'3px',color:'#F8FAFC',lineHeight:1,marginBottom:4}}>KC INTERNATIONAL</div>
        <div style={{fontSize:'clamp(10px,1.8vw,16px)',fontWeight:800,letterSpacing:'8px',
          background:t.titleGradient,backgroundSize:'200% auto',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
          animation:'shimmer 3.5s linear infinite'}}>PRODUCOES</div>
      </Link>
    </motion.div>
  )
}