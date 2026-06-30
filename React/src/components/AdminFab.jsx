import { motion } from 'framer-motion'
import { FiPlus } from 'react-icons/fi'
import { getTheme } from '../theme.js'

export default function AdminFab({ country, onClick }) {
  const t = getTheme(country)
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 500,
        width: 56, height: 56, borderRadius: '50%',
        background: t.btnPrimary, color: t.btnPrimaryColor,
        border: `1px solid ${t.btnPrimaryBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, boxShadow: `0 6px 24px ${t.accentGlow}, ${t.btnPrimaryShadow}`,
        cursor: 'pointer',
      }}
      aria-label="Add new item"
      title="Add new item (admin)"
    >
      <FiPlus />
    </motion.button>
  )
}