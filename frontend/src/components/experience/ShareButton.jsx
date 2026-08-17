// F19 — one link; travellers become the marketing channel.
export default function ShareButton({ text }) {
  const share = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  return (
    <button type="button" className="btn-secondary" onClick={share}>
      💬 Share on WhatsApp
    </button>
  )
}
