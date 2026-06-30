import { motion } from 'framer-motion'
import { getTheme } from '../theme.js'
export default function CountryBackground({ country }) {
  const t = getTheme(country)
  return (
    <>
      <div style={{ position:'fixed',inset:0,zIndex:0,background:t.background }}/>
      <div style={{ position:'fixed',inset:0,zIndex:1,pointerEvents:'none',opacity:0.04,
        backgroundImage:`radial-gradient(circle,${t.dotColor} 1px,transparent 1px)`,
        backgroundSize:'36px 36px' }}/>
      {t.crossOverlay && (
        <div style={{ position:'fixed',inset:0,zIndex:1,pointerEvents:'none',opacity:0.05 }}>
          <div style={{ position:'absolute',top:'50%',left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#fff 20%,#fff 80%,transparent)',transform:'translateY(-50%)' }}/>
          <div style={{ position:'absolute',left:'50%',top:0,bottom:0,width:2,background:'linear-gradient(180deg,transparent,#fff 20%,#fff 80%,transparent)',transform:'translateX(-50%)' }}/>
          <div style={{ position:'absolute',inset:0,background:'linear-gradient(45deg,transparent 48.5%,rgba(255,255,255,0.5) 49.5%,transparent 50.5%)' }}/>
          <div style={{ position:'absolute',inset:0,background:'linear-gradient(-45deg,transparent 48.5%,rgba(255,255,255,0.5) 49.5%,transparent 50.5%)' }}/>
        </div>
      )}
      <div style={{ position:'fixed',inset:0,zIndex:1,pointerEvents:'none',overflow:'hidden' }}>
        {[0,1,2,3].map(i=>(
          <motion.div key={i} animate={{x:['-120%','220%']}}
            transition={{duration:6+i*1.8,repeat:Infinity,delay:i*1.5,ease:'linear'}}
            style={{ position:'absolute',top:`${12+i*22}%`,left:0,width:'40%',height:'1px',
              background:`linear-gradient(90deg,transparent,${t.streakColor},transparent)`,
              transform:'rotate(-6deg)' }}/>
        ))}
      </div>
    </>
  )
}