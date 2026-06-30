import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { FiUsers, FiLogOut, FiArrowLeft, FiShoppingBag, FiTrendingUp, FiCalendar, FiCheck, FiX, FiMic, FiTag, FiSettings, FiStar } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'
import NotificationBell from '../../components/NotificationBell.jsx'

const CATEGORY_TABS = [
  { key: 'event',   label: 'Events',   icon: FiCalendar },
  { key: 'product', label: 'Products', icon: FiTag },
  { key: 'service', label: 'Services', icon: FiSettings },
  { key: 'artist',  label: 'Artists',  icon: FiMic },
]

const STATUS_STYLE = {
  completed:          { bg: 'rgba(16,185,129,0.15)', color: '#6EE7B7', label: 'Completed' },
  pending:            { bg: 'rgba(251,191,36,0.15)', color: '#FCD34D', label: 'Pending' },
  cancel_requested:   { bg: 'rgba(248,113,113,0.15)', color: '#FCA5A5', label: 'Cancel requested' },
  cancelled:          { bg: 'rgba(148,163,184,0.15)', color: '#94A3B8', label: 'Cancelled' },
  return_requested:   { bg: 'rgba(167,139,250,0.15)', color: '#C4B5FD', label: 'Return requested' },
  returned:           { bg: 'rgba(148,163,184,0.15)', color: '#94A3B8', label: 'Returned' },
  exchange_requested: { bg: 'rgba(96,165,250,0.15)', color: '#93C5FD', label: 'Exchange requested' },
  exchanged:          { bg: 'rgba(16,185,129,0.15)', color: '#6EE7B7', label: 'Exchanged' },
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('event')
  const [reviews, setReviews] = useState([])

  const loadStats = () => {
    axios.get('/api/orders/admin/stats').then(res => setStats(res.data)).catch(() => {})
  }

  const loadReviews = () => {
    axios.get('/api/reviews/admin/all').then(res => setReviews(res.data)).catch(() => {})
  }

  useEffect(() => {
    if (!user) return
    if (user.role !== 'admin') { navigate('/login'); return }

    Promise.all([
      axios.get('/api/users'),
      axios.get('/api/orders/admin/stats'),
      axios.get('/api/reviews/admin/all'),
    ])
      .then(([usersRes, statsRes, reviewsRes]) => {
        setUsers(usersRes.data)
        setStats(statsRes.data)
        setReviews(reviewsRes.data)
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [user, navigate])

  if (!user || user.role !== 'admin') return null

  const aoUsers = users.filter(u => u.country === 'ao')
  const ukUsers = users.filter(u => u.country === 'uk')
  const pendingReviews = reviews.filter(r => !r.approved)

  const resolveCancel = async (orderId, approve) => {
    await axios.put(`/api/orders/${orderId}/resolve-cancel`, { approve })
    loadStats()
  }

  const resolveReturn = async (orderId, approve) => {
    await axios.put(`/api/orders/${orderId}/resolve-return`, { approve })
    loadStats()
  }

  const approveReview = async (id) => {
    await axios.put(`/api/reviews/${id}/approve`)
    loadReviews()
  }

  const rejectReview = async (id) => {
    if (!window.confirm('Reject and delete this review?')) return
    await axios.delete(`/api/reviews/${id}`)
    loadReviews()
  }

  const cardStyle = {
    background: 'rgba(13,37,69,0.5)', border: '1px solid rgba(148,163,184,0.12)',
    borderRadius: 16, padding: '20px',
  }

  const currentItems = stats?.byType?.[activeCategory] || []

  return (
    <div style={{ minHeight: '100vh', background: '#050A14', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 13, marginBottom: 10 }}>
              <FiArrowLeft /> Home
            </Link>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC' }}>Admin Dashboard</h1>
            <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>KC International Producoes</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <NotificationBell />
            <button onClick={() => { logout(); navigate('/') }} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 }}>
            {error}
          </div>
        )}

        {stats && stats.cancelRequests > 0 && (
          <div style={{
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 14, padding: '14px 18px', marginBottom: 24,
          }}>
            <span style={{ fontSize: 14, color: '#FCA5A5' }}>
              ⚠️ {stats.cancelRequests} order{stats.cancelRequests !== 1 ? 's' : ''} pending cancellation review — see Recent Orders below
            </span>
          </div>
        )}

        {/* ── Pending reviews ── */}
        {pendingReviews.length > 0 && (
          <div style={{ background: 'rgba(13,37,69,0.4)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(148,163,184,0.1)', fontSize: 14, fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiStar style={{ color: '#FBBF24' }} /> Pending Reviews
              <span style={{ fontSize: 11, background: 'rgba(248,113,113,0.15)', color: '#FCA5A5', borderRadius: 10, padding: '1px 9px', marginLeft: 2 }}>
                {pendingReviews.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {pendingReviews.map(r => (
                <div key={r._id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(148,163,184,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>{r.name}</span>
                      <span style={{ fontSize: 12 }}>{r.country === 'ao' ? '🇦🇴' : '🇬🇧'}</span>
                      <div style={{ display: 'flex', gap: 1 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar key={i} size={13} style={{ color: i < r.stars ? '#FBBF24' : 'rgba(148,163,184,0.3)', fill: i < r.stars ? '#FBBF24' : 'none' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: '#475569' }}>out of 5</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{r.message}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => approveReview(r._id)} title="Approve" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6EE7B7', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <FiCheck size={13} /> Approve
                    </button>
                    <button onClick={() => rejectReview(r._id)} title="Reject" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <FiX size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Sales overview ── */}
        <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>
          Sales Overview <span style={{ fontWeight: 400, textTransform: 'none', color: '#475569' }}>· excludes cancelled orders</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
          <div style={cardStyle}>
            <FiShoppingBag style={{ color: '#3B82F6', marginBottom: 10 }} size={20} />
            <div style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC' }}>{loading ? '—' : stats?.totalOrders ?? 0}</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Total orders placed</div>
          </div>
          <div style={cardStyle}>
            <FiTrendingUp style={{ color: '#6EE7B7', marginBottom: 10 }} size={20} />
            <div style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC' }}>{loading ? '—' : `£${(stats?.totalRevenue ?? 0).toFixed(2)}`}</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Total revenue (paid)</div>
          </div>
          <div style={cardStyle}>
            <FiCalendar style={{ color: '#FCD34D', marginBottom: 10 }} size={20} />
            <div style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC' }}>{loading ? '—' : stats?.monthOrders ?? 0}</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Orders this month</div>
          </div>
          <div style={cardStyle}>
            <FiTrendingUp style={{ color: '#FCD34D', marginBottom: 10 }} size={20} />
            <div style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC' }}>{loading ? '—' : `£${(stats?.monthRevenue ?? 0).toFixed(2)}`}</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Revenue this month</div>
          </div>
        </div>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
            <div style={{ ...cardStyle, background: 'rgba(30,10,0,0.5)', border: '1px solid rgba(212,160,0,0.2)' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>🇦🇴</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#FFD700' }}>{stats.countryBreakdown.ao.orders} orders</div>
              <div style={{ fontSize: 13, color: 'rgba(212,160,0,0.6)' }}>£{stats.countryBreakdown.ao.revenue.toFixed(2)} revenue</div>
            </div>
            <div style={{ ...cardStyle, background: 'rgba(1,15,50,0.5)', border: '1px solid rgba(1,33,105,0.3)' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>🇬🇧</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{stats.countryBreakdown.uk.orders} orders</div>
              <div style={{ fontSize: 13, color: 'rgba(180,200,255,0.5)' }}>£{stats.countryBreakdown.uk.revenue.toFixed(2)} revenue</div>
            </div>
          </div>
        )}

        {/* ── Recent orders with cancel controls ── */}
        {stats && stats.recentOrders.length > 0 && (
          <div style={{ background: 'rgba(13,37,69,0.4)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(148,163,184,0.1)', fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
              Recent Orders
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#64748B', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                    <th style={{ padding: '10px 20px' }}>Customer</th>
                    <th style={{ padding: '10px 20px' }}>Items</th>
                    <th style={{ padding: '10px 20px' }}>Total</th>
                    <th style={{ padding: '10px 20px' }}>Country</th>
                    <th style={{ padding: '10px 20px' }}>Status</th>
                    <th style={{ padding: '10px 20px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map(order => (
                    <tr key={order._id} style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                      <td style={{ padding: '12px 20px', color: '#F8FAFC' }}>{order.user?.name || 'Unknown'}</td>
                      <td style={{ padding: '12px 20px', color: '#94A3B8' }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                      <td style={{ padding: '12px 20px', color: '#3B82F6', fontWeight: 700 }}>{order.currency}{order.total.toFixed(2)}</td>
                      <td style={{ padding: '12px 20px' }}>{order.country === 'ao' ? '🇦🇴 Angola' : '🇬🇧 UK'}</td>
                      <td style={{ padding: '12px 20px' }}>
                        {order.status === 'cancel_requested' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 12, background: 'rgba(248,113,113,0.15)', color: '#FCA5A5' }}>
                              Cancel requested
                            </span>
                            <button onClick={() => resolveCancel(order._id, true)} title="Approve cancellation" style={{ color: '#6EE7B7', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <FiCheck size={14} />
                            </button>
                            <button onClick={() => resolveCancel(order._id, false)} title="Reject cancellation" style={{ color: '#FCA5A5', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <FiX size={14} />
                            </button>
                          </div>
                        ) : ['return_requested', 'exchange_requested'].includes(order.status) ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 11, padding: '2px 10px', borderRadius: 12,
                              background: STATUS_STYLE[order.status]?.bg, color: STATUS_STYLE[order.status]?.color,
                            }}>{STATUS_STYLE[order.status]?.label}</span>
                            <button onClick={() => resolveReturn(order._id, true)} title="Approve" style={{ color: '#6EE7B7', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <FiCheck size={14} />
                            </button>
                            <button onClick={() => resolveReturn(order._id, false)} title="Reject" style={{ color: '#FCA5A5', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <FiX size={14} />
                            </button>
                          </div>
                        ) : (
                          <span style={{
                            fontSize: 11, padding: '2px 10px', borderRadius: 12, textTransform: 'capitalize',
                            background: STATUS_STYLE[order.status]?.bg, color: STATUS_STYLE[order.status]?.color,
                          }}>{STATUS_STYLE[order.status]?.label || order.status}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 20px', color: '#475569' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Purchases by category ── */}
        <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>
          Purchases by Category
        </div>
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(148,163,184,0.1)', marginBottom: 20 }}>
          {CATEGORY_TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveCategory(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 18px', background: 'transparent',
              borderBottom: activeCategory === tab.key ? '2px solid #2563EB' : '2px solid transparent',
              color: activeCategory === tab.key ? '#3B82F6' : '#64748B',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>
              <tab.icon size={14} /> {tab.label}
              {stats?.byType?.[tab.key] && (
                <span style={{
                  fontSize: 11, background: 'rgba(148,163,184,0.15)', color: '#94A3B8',
                  borderRadius: 10, padding: '1px 7px', marginLeft: 2,
                }}>{stats.byType[tab.key].length}</span>
              )}
            </button>
          ))}
        </div>

        <div style={{ background: 'rgba(13,37,69,0.4)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
          {activeCategory === 'artist' ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#475569', fontSize: 14 }}>
              Artists aren't purchasable items — no order history applies here.
            </div>
          ) : currentItems.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#475569', fontSize: 14 }}>
              No {CATEGORY_TABS.find(t => t.key === activeCategory)?.label.toLowerCase()} purchases yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#64748B', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                    <th style={{ padding: '10px 20px' }}>Item</th>
                    <th style={{ padding: '10px 20px' }}>Customer</th>
                    <th style={{ padding: '10px 20px' }}>Qty</th>
                    <th style={{ padding: '10px 20px' }}>Price</th>
                    <th style={{ padding: '10px 20px' }}>Country</th>
                    <th style={{ padding: '10px 20px' }}>Status</th>
                    <th style={{ padding: '10px 20px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(148,163,184,0.15)' }} />
                          ) : (
                            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(59,130,246,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                              {activeCategory === 'event' ? '\uD83C\uDFAB' : activeCategory === 'service' ? '\uD83C\uDFB5' : '\uD83D\uDECD\uFE0F'}
                            </div>
                          )}
                          <div>
                            <div style={{ color: '#F8FAFC', fontWeight: 500 }}>{item.name}</div>
                            {item.size && <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Size: {item.size}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#94A3B8' }}>{item.customer?.name || 'Unknown'}</td>
                      <td style={{ padding: '12px 20px', color: '#94A3B8' }}>{item.qty}</td>
                      <td style={{ padding: '12px 20px', color: '#3B82F6', fontWeight: 700 }}>{item.currency}{(item.price * item.qty).toFixed(2)}</td>
                      <td style={{ padding: '12px 20px' }}>{item.country === 'ao' ? '🇦🇴' : '🇬🇧'}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{
                          fontSize: 11, padding: '2px 10px', borderRadius: 12,
                          background: STATUS_STYLE[item.status]?.bg, color: STATUS_STYLE[item.status]?.color,
                        }}>{STATUS_STYLE[item.status]?.label || item.status}</span>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#475569' }}>{new Date(item.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Registered users ── */}
        <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>
          Registered Users
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
          <div style={cardStyle}>
            <FiUsers style={{ color: '#3B82F6', marginBottom: 10 }} size={20} />
            <div style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC' }}>{users.length}</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Total registered users</div>
          </div>
          <div style={{ ...cardStyle, background: 'rgba(30,10,0,0.5)', border: '1px solid rgba(212,160,0,0.2)' }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>🇦🇴</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#FFD700' }}>{aoUsers.length}</div>
            <div style={{ fontSize: 12, color: 'rgba(212,160,0,0.6)' }}>Angola users</div>
          </div>
          <div style={{ ...cardStyle, background: 'rgba(1,15,50,0.5)', border: '1px solid rgba(1,33,105,0.3)' }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>🇬🇧</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{ukUsers.length}</div>
            <div style={{ fontSize: 12, color: 'rgba(180,200,255,0.5)' }}>UK users</div>
          </div>
        </div>

        <div style={{ background: 'rgba(13,37,69,0.4)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(148,163,184,0.1)', fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
            All Users
          </div>
          {!loading && users.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#475569', fontSize: 14 }}>No users registered yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#64748B', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                    <th style={{ padding: '10px 20px' }}>Name</th>
                    <th style={{ padding: '10px 20px' }}>Username</th>
                    <th style={{ padding: '10px 20px' }}>Email</th>
                    <th style={{ padding: '10px 20px' }}>Phone</th>
                    <th style={{ padding: '10px 20px' }}>Country</th>
                    <th style={{ padding: '10px 20px' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                      <td style={{ padding: '12px 20px', color: '#F8FAFC' }}>{u.name}</td>
                      <td style={{ padding: '12px 20px', color: '#3B82F6' }}>@{u.username}</td>
                      <td style={{ padding: '12px 20px', color: '#94A3B8' }}>{u.email}</td>
                      <td style={{ padding: '12px 20px', color: '#94A3B8' }}>{u.phone}</td>
                      <td style={{ padding: '12px 20px' }}>{u.country === 'ao' ? '🇦🇴 Angola' : '🇬🇧 UK'}</td>
                      <td style={{ padding: '12px 20px', color: '#475569' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}