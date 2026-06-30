import { FiVideo, FiMusic, FiExternalLink } from 'react-icons/fi'
import { getYouTubeEmbedUrl, getSpotifyEmbedUrl, getSoundCloudEmbedUrl } from '../utils/mediaEmbeds.js'

export default function ArtistMediaSection({ media, t, isAo }) {
  if (!media || media.length === 0) return null

  const videos = media.filter(m => m.kind === 'video')
  const tracks = media.filter(m => m.kind === 'track')

  return (
    <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>
      {videos.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 14 }}>
            <FiVideo size={15} style={{ color: t.accentAlt }} /> {isAo ? 'Vídeos' : 'Videos'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {videos.map((v, i) => (
              <VideoItem key={i} item={v} t={t} />
            ))}
          </div>
        </div>
      )}

      {tracks.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 14 }}>
            <FiMusic size={15} style={{ color: t.accentAlt }} /> {isAo ? 'Faixas' : 'Tracks'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tracks.map((tr, i) => (
              <TrackItem key={i} item={tr} t={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function VideoItem({ item, t }) {
  if (item.source === 'upload') {
    return (
      <div>
        {item.title && <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 8 }}>{item.title}</div>}
        <video controls style={{ width: '100%', borderRadius: 14, border: `1px solid ${t.cardBorder}`, display: 'block', background: '#000' }}>
          <source src={item.url} />
        </video>
      </div>
    )
  }

  const embedUrl = getYouTubeEmbedUrl(item.url)
  if (embedUrl) {
    return (
      <div>
        {item.title && <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 8 }}>{item.title}</div>}
        <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 14, overflow: 'hidden', border: `1px solid ${t.cardBorder}` }}>
          <iframe
            src={embedUrl}
            title={item.title || 'Artist video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      </div>
    )
  }

  // Fallback — unrecognized video link platform, show as external link
  return (
    <a href={item.url} target="_blank" rel="noreferrer" style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 12,
      padding: '12px 16px', color: t.text, fontSize: 13, textDecoration: 'none',
    }}>
      <FiExternalLink size={14} /> {item.title || 'Watch video'}
    </a>
  )
}

function TrackItem({ item, t }) {
  if (item.source === 'upload') {
    return (
      <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: '12px 16px' }}>
        {item.title && <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 8 }}>{item.title}</div>}
        <audio controls style={{ width: '100%' }}>
          <source src={item.url} />
        </audio>
      </div>
    )
  }

  const spotifyUrl = getSpotifyEmbedUrl(item.url)
  if (spotifyUrl) {
    return (
      <div>
        {item.title && <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 8 }}>{item.title}</div>}
        <iframe
          src={spotifyUrl}
          title={item.title || 'Spotify track'}
          style={{ borderRadius: 12, border: `1px solid ${t.cardBorder}` }}
          width="100%" height="152" frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      </div>
    )
  }

  const soundcloudUrl = getSoundCloudEmbedUrl(item.url)
  if (soundcloudUrl) {
    return (
      <div>
        {item.title && <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 8 }}>{item.title}</div>}
        <iframe
          src={soundcloudUrl}
          title={item.title || 'SoundCloud track'}
          style={{ borderRadius: 12, border: `1px solid ${t.cardBorder}` }}
          width="100%" height="120" frameBorder="0"
        />
      </div>
    )
  }

  return (
    <a href={item.url} target="_blank" rel="noreferrer" style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 12,
      padding: '12px 16px', color: t.text, fontSize: 13, textDecoration: 'none',
    }}>
      <FiExternalLink size={14} /> {item.title || 'Listen to track'}
    </a>
  )
}