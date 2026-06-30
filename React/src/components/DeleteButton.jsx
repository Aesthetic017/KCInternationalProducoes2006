import { FiTrash2 } from 'react-icons/fi'

export default function DeleteButton({ onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        position: 'absolute', top: 10, right: 10,
        width: 28, height: 28, borderRadius: '50%',
        background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(239,68,68,0.4)',
        color: '#FCA5A5', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, cursor: 'pointer', zIndex: 5,
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
      title="Delete"
    >
      <FiTrash2 size={13} />
    </button>
  )
}