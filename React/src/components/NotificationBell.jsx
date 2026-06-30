import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { FiBell, FiShoppingBag, FiXCircle, FiUserPlus, FiMail } from 'react-icons/fi'

const ICONS = {
  new_order: FiShoppingBag,
  cancel_request: FiXCircle,
  new_user: FiUserPlus,
  new_interest: FiMail,
}
const COLORS = {
  new_order: '#3B82F6',
  cancel_request: '#F87171',
  new_user: '#6EE7B7',
  new_interest: '#A78BFA',
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const ref = useRef(null)

  const loadUnreadCount = () => {
    axios.get('/api/notifications/unread-count').then(res => setUnreadCount(res.data.count)).catch(() => {})
  }

  const loadAll = () => {
    setLoading(true)
    axios.get('/api/notifications').then(res => setNotifications(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 20000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleOpen = () => { setOpen(o => !o); if (!open) loadAll() }

  const markAllRead = async () => {
    await axios.put('/api/notifications/read-all')
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const markOneRead = async (id) => {
    await axios.put(`/api/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const toggleExpand = (n) => {
    if (!n.isRead) markOneRead(n._id)
    if (n.type === 'new_interest' || n.type === 'new_booking') setExpandedId(prev => prev === n._id ? null : n._id)
  }

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={handleOpen} style={{
        position: 'relative', background: 'rgba(13,37,69,0.5)',
        border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10,
        width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#94A3B8', cursor: 'pointer',
      }}>
        <FiBell size={17} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700,
            borderRadius: '50%', width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #050A14',
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 46, right: 0, zIndex: 100,
              width: 380, maxHeight: 460, overflowY: 'auto',
              background: '#0A1628', border: '1px solid rgba(148,163,184,0.15)',
              borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{ fontSize: 12, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Mark all read
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#475569', fontSize: 13 }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#475569', fontSize: 13 }}>No notifications yet.</div>
            ) : (
              notifications.map(n => {
                const Icon = ICONS[n.type] || FiBell
                const color = COLORS[n.type] || '#94A3B8'
                const isExpanded = expandedId === n._id
                return (
                  <div key={n._id}>
                    <div
                      onClick={() => toggleExpand(n)}
                      style={{
                        display: 'flex', gap: 12, padding: '12px 16px',
                        borderBottom: isExpanded ? 'none' : '1px solid rgba(148,163,184,0.06)',
                        background: n.isRead ? 'transparent' : 'rgba(37,99,235,0.06)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color, fontSize: 14,
                      }}>
                        <Icon size={14} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: '#E2E8F0', lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>{timeAgo(n.createdAt)}</div>
                      </div>
                      {!n.isRead && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B82F6', flexShrink: 0, marginTop: 5 }} />}
                    </div>

                    {/* Expanded detail for interest submissions */}
                    {isExpanded && n.interest && (
                      <div style={{
                        padding: '12px 16px 14px 60px', borderBottom: '1px solid rgba(148,163,184,0.06)',
                        background: 'rgba(167,139,250,0.04)',
                      }}>
                        <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.7 }}>
                          <div><strong style={{ color: '#CBD5E1' }}>Name:</strong> {n.interest.name}</div>
                          <div><strong style={{ color: '#CBD5E1' }}>Email:</strong> {n.interest.email}</div>
                          {n.interest.phone && <div><strong style={{ color: '#CBD5E1' }}>Phone:</strong> {n.interest.phone}</div>}
                          <div><strong style={{ color: '#CBD5E1' }}>Type:</strong> {n.interest.type}</div>
                          <div style={{ marginTop: 6 }}><strong style={{ color: '#CBD5E1' }}>Message:</strong></div>
                          <div style={{ fontStyle: 'italic', color: '#94A3B8', marginTop: 2 }}>"{n.interest.message}"</div>
                        </div>
                      </div>
                    )}

                    {/* Expanded detail for booking requests — includes contact info so admin can follow up */}
                    {isExpanded && n.booking && (
                      <div style={{
                        padding: '12px 16px 14px 60px', borderBottom: '1px solid rgba(148,163,184,0.06)',
                        background: 'rgba(59,130,246,0.04)',
                      }}>
                        <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.7 }}>
                          <div><strong style={{ color: '#CBD5E1' }}>Customer:</strong> {n.booking.user?.name} (@{n.booking.user?.username})</div>
                          <div><strong style={{ color: '#CBD5E1' }}>Email:</strong> {n.booking.user?.email}</div>
                          {n.booking.user?.phone && <div><strong style={{ color: '#CBD5E1' }}>Phone:</strong> {n.booking.user.phone}</div>}
                          <div><strong style={{ color: '#CBD5E1' }}>Artist:</strong> {n.booking.artist?.name}</div>
                          <div><strong style={{ color: '#CBD5E1' }}>Event type:</strong> {n.booking.eventType}</div>
                          <div><strong style={{ color: '#CBD5E1' }}>Event date:</strong> {n.booking.eventDate}</div>
                          {n.booking.message && (
                            <>
                              <div style={{ marginTop: 6 }}><strong style={{ color: '#CBD5E1' }}>Message:</strong></div>
                              <div style={{ fontStyle: 'italic', color: '#94A3B8', marginTop: 2 }}>"{n.booking.message}"</div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}