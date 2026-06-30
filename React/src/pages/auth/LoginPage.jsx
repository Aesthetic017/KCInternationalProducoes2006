import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiMail, FiLock } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(email, password)
    if (!res.success) { setError(res.error); return }
    if (res.user.role === 'admin') navigate('/admin')
    else navigate(redirect || `/${res.user.country || 'uk'}`)
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
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{ width:'100%', maxWidth:400 }}>

        <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:8, color:'#64748B', fontSize:13, marginBottom:24 }}>
          <FiArrowLeft/> Back to Home
        </Link>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:48,height:48,borderRadius:'50%', margin:'0 auto 16px',
            background:'linear-gradient(135deg,#2563EB,#1A4A8A)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontWeight:800,fontSize:16,color:'#fff' }}>KC</div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'#F8FAFC' }}>Welcome Back</h1>
          <p style={{ fontSize:14, color:'#64748B', marginTop:6 }}>Login to your KC International account</p>
        </div>

        <form onSubmit={submit} style={{
          background:'rgba(13,37,69,0.5)', border:'1px solid rgba(148,163,184,0.12)',
          borderRadius:20, padding:'28px 26px', display:'flex', flexDirection:'column', gap:16,
        }}>
          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
              color:'#FCA5A5', fontSize:13, padding:'10px 14px', borderRadius:8 }}>{error}</div>
          )}

          <div style={{ position:'relative' }}>
            <FiMail style={{ position:'absolute', left:14, top:13, color:'#475569' }} size={16}/>
            <input required type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="Email address" style={inputStyle}
              onFocus={e=>e.target.style.borderColor='#3B82F6'} onBlur={e=>e.target.style.borderColor='rgba(148,163,184,0.2)'}/>
          </div>

          <div>
            <div style={{ position:'relative' }}>
              <FiLock style={{ position:'absolute', left:14, top:13, color:'#475569' }} size={16}/>
              <input required type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="Password" style={inputStyle}
                onFocus={e=>e.target.style.borderColor='#3B82F6'} onBlur={e=>e.target.style.borderColor='rgba(148,163,184,0.2)'}/>
            </div>
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <Link to="/forgot-password" style={{ fontSize: 12, color: '#3B82F6' }}>
                Forgot password?
              </Link>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ justifyContent:'center', padding:'12px', fontSize:15 }}>
            Login
          </button>

          <div style={{ textAlign:'center', fontSize:13, color:'#475569' }}>
            Don't have an account? <Link to="/join" style={{ color:'#3B82F6' }}>Join now</Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}