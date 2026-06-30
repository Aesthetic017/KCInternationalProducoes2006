import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiLock, FiCheck } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'

const AngolaFlag = () => (
  <svg width="70" height="46" viewBox="0 0 900 600" style={{borderRadius:8,display:'block'}}>
    <rect width="900" height="300" fill="#CC0000"/>
    <rect y="300" width="900" height="300" fill="#000"/>
    <g transform="translate(450,300)">
      <circle r="70" fill="none" stroke="#FFCC00" strokeWidth="16"/>
      <path d="M-25,-60 L0,-15 L25,-60 L18,8 L50,35 L8,35 L0,75 L-8,35 L-50,35 L-18,8 Z" fill="#FFCC00"/>
    </g>
  </svg>
)
const UKFlag = () => (
  <svg width="70" height="46" viewBox="0 0 900 600" style={{borderRadius:8,display:'block'}}>
    <rect width="900" height="600" fill="#012169"/>
    <path d="M0,0 L900,600 M900,0 L0,600" stroke="#fff" strokeWidth="100"/>
    <path d="M0,0 L900,600 M900,0 L0,600" stroke="#C8102E" strokeWidth="66"/>
    <path d="M450,0 V600 M0,300 H900" stroke="#fff" strokeWidth="150"/>
    <path d="M450,0 V600 M0,300 H900" stroke="#C8102E" strokeWidth="100"/>
  </svg>
)

export default function JoinPage() {
  const [params] = useSearchParams()
  const preselected = params.get('country')
  const [country, setCountry] = useState(preselected === 'ao' || preselected === 'uk' ? preselected : null)
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' })
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k,v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!country) { setError('Please select your country first'); return }
    const res = await register({ ...form, country })
    if (!res.success) { setError(res.error); return }
    navigate(`/${country}`)
  }

  const inputStyle = {
    width:'100%', padding:'12px 14px 12px 40px',
    background:'rgba(13,37,69,0.6)', border:'1px solid rgba(148,163,184,0.2)',
    borderRadius:10, color:'#F8FAFC', fontSize:14, outline:'none',
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.13) 0%, transparent 65%), #050A14',
      padding:24 }}>
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{ width:'100%', maxWidth:440 }}>

        <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:8, color:'#64748B', fontSize:13, marginBottom:24 }}>
          <FiArrowLeft/> Back to Home
        </Link>

        <div style={{ textAlign:'center', marginBottom:28 }}>
          <h1 style={{ fontSize:26, fontWeight:800, color:'#F8FAFC' }}>Join the Roster</h1>
          <p style={{ fontSize:14, color:'#64748B', marginTop:6 }}>Create your KC International account</p>
        </div>

        {/* STEP 1 — Country picker */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:13, color:'#94A3B8', marginBottom:12, textAlign:'center' }}>
            1. Select your country
          </div>
          <div style={{ display:'flex', gap:14, justifyContent:'center' }}>
            <button onClick={()=>setCountry('ao')} style={{
              background: country==='ao' ? 'rgba(204,0,0,0.15)' : 'rgba(13,37,69,0.5)',
              border: country==='ao' ? '2px solid #CC0000' : '2px solid rgba(148,163,184,0.15)',
              borderRadius:16, padding:'16px 22px', display:'flex', flexDirection:'column',
              alignItems:'center', gap:10, cursor:'pointer', flex:1,
            }}>
              <AngolaFlag/>
              <span style={{ fontSize:13, fontWeight:600, color: country==='ao' ? '#FCA5A5' : '#94A3B8' }}>🇦🇴 Angola</span>
              {country==='ao' && <FiCheck style={{ color:'#FCA5A5' }}/>}
            </button>
            <button onClick={()=>setCountry('uk')} style={{
              background: country==='uk' ? 'rgba(37,99,235,0.15)' : 'rgba(13,37,69,0.5)',
              border: country==='uk' ? '2px solid #3B82F6' : '2px solid rgba(148,163,184,0.15)',
              borderRadius:16, padding:'16px 22px', display:'flex', flexDirection:'column',
              alignItems:'center', gap:10, cursor:'pointer', flex:1,
            }}>
              <UKFlag/>
              <span style={{ fontSize:13, fontWeight:600, color: country==='uk' ? '#93C5FD' : '#94A3B8' }}>🇬🇧 UK</span>
              {country==='uk' && <FiCheck style={{ color:'#93C5FD' }}/>}
            </button>
          </div>
        </div>

        {/* STEP 2 — Form, only enabled once country is chosen */}
        <AnimatePresence>
          {country && (
            <motion.form
              onSubmit={submit}
              initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
              style={{
                background:'rgba(13,37,69,0.5)', border:'1px solid rgba(148,163,184,0.12)',
                borderRadius:20, padding:'26px 24px', display:'flex', flexDirection:'column', gap:14,
                overflow:'hidden',
              }}
            >
              <div style={{ fontSize:13, color:'#94A3B8', marginBottom:2 }}>2. Your details</div>

              {error && (
                <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
                  color:'#FCA5A5', fontSize:13, padding:'10px 14px', borderRadius:8 }}>{error}</div>
              )}

              <div style={{ position:'relative' }}>
                <FiUser style={{ position:'absolute', left:14, top:13, color:'#475569' }} size={16}/>
                <input required value={form.name} onChange={e=>set('name',e.target.value)}
                  placeholder="Full name" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#3B82F6'} onBlur={e=>e.target.style.borderColor='rgba(148,163,184,0.2)'}/>
              </div>

              <div style={{ position:'relative' }}>
                <FiMail style={{ position:'absolute', left:14, top:13, color:'#475569' }} size={16}/>
                <input required type="email" value={form.email} onChange={e=>set('email',e.target.value)}
                  placeholder="Email address" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#3B82F6'} onBlur={e=>e.target.style.borderColor='rgba(148,163,184,0.2)'}/>
              </div>

              <div style={{ position:'relative' }}>
                <FiPhone style={{ position:'absolute', left:14, top:13, color:'#475569' }} size={16}/>
                <input required value={form.phone} onChange={e=>set('phone',e.target.value)}
                  placeholder={country==='ao' ? '+244 9XX XXX XXX' : '+44 7XXX XXXXXX'} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#3B82F6'} onBlur={e=>e.target.style.borderColor='rgba(148,163,184,0.2)'}/>
              </div>

              <div style={{ position:'relative' }}>
                <FiLock style={{ position:'absolute', left:14, top:13, color:'#475569' }} size={16}/>
                <input required type="password" minLength={6} value={form.password} onChange={e=>set('password',e.target.value)}
                  placeholder="Create password" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#3B82F6'} onBlur={e=>e.target.style.borderColor='rgba(148,163,184,0.2)'}/>
              </div>

              <div style={{ fontSize:11, color:'#475569' }}>
                Your username will be generated automatically from your name.
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent:'center', padding:'12px', fontSize:15 }}>
                Create Account
              </button>

              <div style={{ textAlign:'center', fontSize:13, color:'#475569' }}>
                Already have an account? <Link to="/login" style={{ color:'#3B82F6' }}>Login</Link>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}