// ============================================================================
// OPTIONAL SUGAR — Web Speech API live transcript.
// ----------------------------------------------------------------------------
// Per the plan discussion: the one-call Gemini pipeline does NOT need this.
// Web Speech API is Chrome-only and its Indian-language accuracy is flaky.
// If the team wants a live "what the AI is hearing" line for the demo, this is
// where it goes (webkitSpeechRecognition, lang from the recording language).
// Do NOT put it on the critical path.
// ============================================================================
export default function LiveTranscript() {
  return <p className="text-xs italic text-stone-400">Live transcript (Web Speech API) — optional demo sugar, not built yet.</p>
}
