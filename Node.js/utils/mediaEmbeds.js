// Detects the source platform from a URL and returns an embeddable iframe src,
// or null if the link can't be embedded (falls back to a plain external link).

export function getYouTubeEmbedUrl(url) {
  try {
    const u = new URL(url)
    let videoId = null
    if (u.hostname.includes('youtu.be')) {
      videoId = u.pathname.slice(1)
    } else if (u.hostname.includes('youtube.com')) {
      videoId = u.searchParams.get('v')
      if (!videoId && u.pathname.startsWith('/embed/')) videoId = u.pathname.split('/embed/')[1]
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  } catch {
    return null
  }
}

export function getSpotifyEmbedUrl(url) {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('spotify.com')) return null
    // e.g. https://open.spotify.com/track/abc123 -> https://open.spotify.com/embed/track/abc123
    const path = u.pathname.replace(/^\/(intl-[a-z]+\/)?/, '/')
    return `https://open.spotify.com${path.startsWith('/embed') ? path : `/embed${path}`}`
  } catch {
    return null
  }
}

export function getSoundCloudEmbedUrl(url) {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('soundcloud.com')) return null
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%233B82F6&auto_play=false&show_comments=false`
  } catch {
    return null
  }
}