import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiArrowLeft, FiUser, FiShoppingBag, FiLock, FiLogOut, FiXCircle, FiCalendar, FiRefreshCw } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'
import { getTheme } from '../theme.js'
import ReturnRequestModal from '../components/ReturnRequestModal.jsx'

export default function AccountPage() {
  const { user, logout, updateProfile, changePassword } = useAuth()
  const navigate = useNavigate()
  const t = getTheme(user?.country || 'uk')
  const isAo = user?.country === 'ao'

  const [tab, setTab] = useState('purchases')
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [returnModalOrder, setReturnModalOrder] = useState(null)

  const [bookings, setBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(true)

  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' })
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [savingNotif, setSavingNotif] = useState(false)
  const [notifMsg, setNotifMsg] = useState('')

  const loadOrders = () => {
    axios.get('/api/orders/my')
      .then(res => setOrders(res.data.filter(o => o.paymentStatus === 'paid')))
      .finally(() => setLoadingOrders(false))
  }

  const loadBookings = () => {
    axios.get('/api/bookings/my')
      .then(res => setBookings(res.data))
      .finally(() => setLoadingBookings(false))
  }

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    setProfileForm({ name: user.name, email: user.email, phone: user.phone })
    setEmailNotifications(user.emailNotifications !== false)
    loadOrders()
    loadBookings()
  }, [user, navigate])

  if (!user) return null

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileMsg(''); setProfileError(''); setSavingProfile(true)
    const res = await updateProfile(profileForm)
    setSavingProfile(false)
    if (!res.success) { setProfileError(res.error); return }
    setProfileMsg(isAo ? 'Perfil atualizado!' : 'Profile updated!')
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    setPwMsg(''); setPwError(''); setSavingPw(true)
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError(isAo ? 'As senhas não coincidem' : 'Passwords do not match')
      setSavingPw(false)
      return
    }
    const res = await changePassword(pwForm.currentPassword, pwForm.newPassword)
    setSavingPw(false)
    if (!res.success) { setPwError(res.error); return }
    setPwMsg(isAo ? 'Senha alterada!' : 'Password changed!')
    setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
  }

  const handleCancelRequest = async (orderId) => {
    const confirmMsg = isAo ? 'Tem a certeza que quer solicitar o cancelamento deste pedido?' : 'Are you sure you want to request cancellation of this order?'
    if (!window.confirm(confirmMsg)) return
    setCancellingId(orderId)
    try {
      await axios.put(`/api/orders/${orderId}/cancel-request`)
      loadOrders()
    } finally {
      setCancellingId(null)
    }
  }

  const handleNotifToggle = async () => {
    const next = !emailNotifications
    setSavingNotif(true)
    setNotifMsg('')
    const res = await updateProfile({ emailNotifications: next })
    setSavingNotif(false)
    if (res.success) {
      setEmailNotifications(next)
      setNotifMsg(next
        ? (isAo ? 'Notificações ativadas!' : 'Notifications turned on!')
        : (isAo ? 'Notificações desativadas.' : 'Notifications turned off.'))
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
    borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none',
  }

  const TABS = [
    { key: 'purchases', label: isAo ? 'Compras' : 'Purchases', icon: FiShoppingBag },
    { key: 'bookings', label: isAo ? 'Reservas' : 'Bookings', icon: FiCalendar },
    { key: 'settings', label: isAo ? 'Configurações' : 'Account Settings', icon: FiUser },
  ]

  const statusBadge = (status) => {
    const map = {
      completed: { bg: 'rgba(16,185,129,0.15)', color: '#6EE7B7', label: isAo ? 'Concluído' : 'Completed' },
      pending: { bg: 'rgba(251,191,36,0.15)', color: '#FCD34D', label: isAo ? 'Pendente' : 'Pending' },
      cancel_requested: { bg: 'rgba(248,113,113,0.15)', color: '#FCA5A5', label: isAo ? 'Cancelamento solicitado' : 'Cancellation requested' },
      cancelled: { bg: 'rgba(148,163,184,0.15)', color: '#94A3B8', label: isAo ? 'Cancelado' : 'Cancelled' },
      return_requested: { bg: 'rgba(167,139,250,0.15)', color: '#C4B5FD', label: isAo ? 'Devolução solicitada' : 'Return requested' },
      returned: { bg: 'rgba(148,163,184,0.15)', color: '#94A3B8', label: isAo ? 'Devolvido' : 'Returned' },
      exchange_requested: { bg: 'rgba(96,165,250,0.15)', color: '#93C5FD', label: isAo ? 'Troca solicitada' : 'Exchange requested' },
      exchanged: { bg: 'rgba(16,185,129,0.15)', color: '#6EE7B7', label: isAo ? 'Trocado' : 'Exchanged' },
    }
    const s = map[status] || map.completed
    return <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 12, background: s.bg, color: s.color }}>{s.label}</span>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050A14', padding: '40px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <Link to={`/${user.country}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 13, marginBottom: 10 }}>
              <FiArrowLeft /> Back
            </Link>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC' }}>
              {isAo ? 'A Minha Conta' : 'My Account'}
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>@{user.username}</p>
          </div>
          <button onClick={() => { logout(); navigate('/') }} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: '1px solid rgba(148,163,184,0.2)',
            color: '#94A3B8', padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
          }}>
            <FiLogOut size={13} /> Logout
          </button>
        </div>

        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(148,163,184,0.1)', marginBottom: 28 }}>
          {TABS.map(tabItem => (
            <button key={tabItem.key} onClick={() => setTab(tabItem.key)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 18px', background: 'transparent',
              borderBottom: tab === tabItem.key ? '2px solid #2563EB' : '2px solid transparent',
              color: tab === tabItem.key ? '#3B82F6' : '#64748B',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>
              <tabItem.icon size={14} /> {tabItem.label}
            </button>
          ))}
        </div>

        {tab === 'purchases' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {loadingOrders ? (
              <div style={{ color: '#64748B', fontSize: 14 }}>Loading...</div>
            ) : orders.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '50px 0', color: '#475569', fontSize: 14,
                background: 'rgba(13,37,69,0.4)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16,
              }}>
                {isAo ? 'Ainda não fez nenhuma compra.' : "You haven't made any purchases yet."}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {orders.map(order => (
                  <div key={order._id} style={{
                    background: 'rgba(13,37,69,0.4)', border: '1px solid rgba(148,163,184,0.1)',
                    borderRadius: 14, padding: '18px 20px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#64748B' }}>
                        {new Date(order.createdAt).toLocaleDateString()} · {order.country === 'ao' ? '🇦🇴' : '🇬🇧'}
                      </span>
                      {statusBadge(order.status)}
                    </div>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#CBD5E1', padding: '4px 0' }}>
                        <span>{item.name} × {item.qty}</span>
                        <span>{item.currency}{(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(148,163,184,0.08)' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>Total</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#3B82F6' }}>{order.currency}{order.total.toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      {order.paymentStatus === 'paid' && order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelRequest(order._id)}
                          disabled={cancellingId === order._id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'transparent', border: '1px solid rgba(248,113,113,0.3)',
                            color: '#FCA5A5', padding: '7px 14px', borderRadius: 8,
                            fontSize: 12, cursor: 'pointer', opacity: cancellingId === order._id ? 0.6 : 1,
                          }}
                        >
                          <FiXCircle size={13} />
                          {cancellingId === order._id
                            ? (isAo ? 'Enviando...' : 'Requesting...')
                            : (isAo ? 'Cancelar Pedido' : 'Cancel Order')}
                        </button>
                      )}

                      {order.status === 'completed' && (
                        <button
                          onClick={() => setReturnModalOrder(order)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'transparent', border: '1px solid rgba(96,165,250,0.3)',
                            color: '#93C5FD', padding: '7px 14px', borderRadius: 8,
                            fontSize: 12, cursor: 'pointer',
                          }}
                        >
                          <FiRefreshCw size={13} />
                          {isAo ? 'Pedir Reembolso ou Troca' : 'Request Refund / Exchange'}
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <ReturnRequestModal
          order={returnModalOrder}
          open={!!returnModalOrder}
          onClose={() => setReturnModalOrder(null)}
          onSuccess={loadOrders}
          isAo={isAo}
        />

        {tab === 'bookings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {loadingBookings ? (
              <div style={{ color: '#64748B', fontSize: 14 }}>Loading...</div>
            ) : bookings.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '50px 0', color: '#475569', fontSize: 14,
                background: 'rgba(13,37,69,0.4)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16,
              }}>
                {isAo ? 'Ainda não solicitou nenhuma reserva de artista.' : "You haven't requested any artist bookings yet."}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {bookings.map(booking => {
                  const statusMap = {
                    pending:   { bg: 'rgba(251,191,36,0.15)', color: '#FCD34D', label: isAo ? 'Pendente' : 'Pending' },
                    confirmed: { bg: 'rgba(16,185,129,0.15)', color: '#6EE7B7', label: isAo ? 'Confirmado' : 'Confirmed' },
                    declined:  { bg: 'rgba(148,163,184,0.15)', color: '#94A3B8', label: isAo ? 'Recusado' : 'Declined' },
                  }
                  const s = statusMap[booking.status] || statusMap.pending
                  return (
                    <div key={booking._id} style={{
                      background: 'rgba(13,37,69,0.4)', border: '1px solid rgba(148,163,184,0.1)',
                      borderRadius: 14, padding: '18px 20px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>{booking.artist?.name}</div>
                          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                            {booking.eventType} · {booking.eventDate}
                          </div>
                        </div>
                        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 12, background: s.bg, color: s.color }}>{s.label}</span>
                      </div>
                      {booking.message && (
                        <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, marginBottom: 10 }}>{booking.message}</p>
                      )}
                      {booking.status === 'confirmed' && booking.quotedPrice > 0 && (
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#3B82F6', marginTop: 6 }}>
                          {isAo ? 'Orçamento: ' : 'Quote: '}{booking.quotedCurrency}{booking.quotedPrice}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {tab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            <form onSubmit={handleProfileSave} style={{
              background: 'rgba(13,37,69,0.4)', border: '1px solid rgba(148,163,184,0.1)',
              borderRadius: 16, padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>
                {isAo ? 'Informações Pessoais' : 'Personal Information'}
              </h3>

              {profileMsg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6EE7B7', fontSize: 13, padding: '9px 13px', borderRadius: 8 }}>{profileMsg}</div>}
              {profileError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontSize: 13, padding: '9px 13px', borderRadius: 8 }}>{profileError}</div>}

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 5 }}>{isAo ? 'Nome' : 'Name'}</label>
                <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 5 }}>Email</label>
                <input type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 5 }}>{isAo ? 'Contacto' : 'Phone'}</label>
                <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
              </div>

              <button type="submit" disabled={savingProfile} className="btn-primary" style={{ justifyContent: 'center', marginTop: 4, opacity: savingProfile ? 0.7 : 1 }}>
                {savingProfile ? 'Saving...' : (isAo ? 'Guardar Alterações' : 'Save Changes')}
              </button>
            </form>

            <form onSubmit={handlePasswordSave} style={{
              background: 'rgba(13,37,69,0.4)', border: '1px solid rgba(148,163,184,0.1)',
              borderRadius: 16, padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiLock size={14} /> {isAo ? 'Alterar Senha' : 'Change Password'}
              </h3>

              {pwMsg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6EE7B7', fontSize: 13, padding: '9px 13px', borderRadius: 8 }}>{pwMsg}</div>}
              {pwError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontSize: 13, padding: '9px 13px', borderRadius: 8 }}>{pwError}</div>}

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 5 }}>{isAo ? 'Senha atual' : 'Current password'}</label>
                <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 5 }}>{isAo ? 'Nova senha' : 'New password'}</label>
                <input type="password" minLength={6} value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 5 }}>{isAo ? 'Confirmar nova senha' : 'Confirm new password'}</label>
                <input type="password" minLength={6} value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} style={inputStyle} />
              </div>

              <button type="submit" disabled={savingPw} className="btn-primary" style={{ justifyContent: 'center', marginTop: 4, opacity: savingPw ? 0.7 : 1 }}>
                {savingPw ? 'Updating...' : (isAo ? 'Atualizar Senha' : 'Update Password')}
              </button>
            </form>

            {/* Email notification preferences */}
            <div style={{
              background: 'rgba(13,37,69,0.4)', border: '1px solid rgba(148,163,184,0.1)',
              borderRadius: 16, padding: '24px 22px',
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>
                {isAo ? 'Notificações por Email' : 'Email Notifications'}
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 16, lineHeight: 1.6 }}>
                {isAo
                  ? 'Receba um email sempre que adicionarmos um novo artista, evento, produto ou serviço.'
                  : "Get an email whenever we add a new artist, event, product, or service."}
              </p>

              {notifMsg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6EE7B7', fontSize: 13, padding: '9px 13px', borderRadius: 8, marginBottom: 14 }}>{notifMsg}</div>}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#CBD5E1' }}>
                  {isAo ? 'Novidades e anúncios' : 'New content announcements'}
                </span>
                <button
                  onClick={handleNotifToggle}
                  disabled={savingNotif}
                  style={{
                    position: 'relative', width: 46, height: 26, borderRadius: 13,
                    background: emailNotifications ? '#2563EB' : 'rgba(148,163,184,0.25)',
                    border: 'none', cursor: 'pointer', transition: 'background 0.2s',
                    opacity: savingNotif ? 0.6 : 1,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3, left: emailNotifications ? 23 : 3,
                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}