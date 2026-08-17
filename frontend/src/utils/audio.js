// Audio transcode: MediaRecorder (Chrome) records WebM/Opus, but the Gemini API
// officially supports WAV/MP3/AIFF/AAC/OGG/FLAC. We convert in the browser to a
// small 16 kHz mono WAV before sending. ~1–2 min of speech ≈ 2–4 MB (well under
// the 20 MB inline limit).
//
// This is the piece that prevents the silent demo-killer — see plan discussion.

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
}

export async function blobToWav(blob, targetRate = 16000) {
  const arrayBuffer = await blob.arrayBuffer()
  const Ctx = window.AudioContext || window.webkitAudioContext
  const ctx = new Ctx()
  try {
    const decoded = await ctx.decodeAudioData(arrayBuffer)
    const length = Math.max(1, Math.ceil(decoded.duration * targetRate))
    const offline = new OfflineAudioContext(1, length, targetRate)
    const source = offline.createBufferSource()
    source.buffer = decoded
    source.connect(offline.destination)
    source.start(0)
    const rendered = await offline.startRendering()
    const samples = rendered.getChannelData(0)

    // 16-bit PCM mono WAV
    const buffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buffer)
    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + samples.length * 2, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true) // PCM chunk size
    view.setUint16(20, 1, true) // PCM format
    view.setUint16(22, 1, true) // mono
    view.setUint32(24, targetRate, true)
    view.setUint32(28, targetRate * 2, true) // byte rate
    view.setUint16(32, 2, true) // block align
    view.setUint16(34, 16, true) // bits per sample
    writeString(view, 36, 'data')
    view.setUint32(40, samples.length * 2, true)
    let offset = 44
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
      offset += 2
    }
    return new Blob([buffer], { type: 'audio/wav' })
  } finally {
    ctx.close()
  }
}
