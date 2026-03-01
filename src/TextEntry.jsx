import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import './TextEntry.css'

const STORAGE_KEY = 'text-entries'

function TextEntry() {
  const [text, setText] = useState('')
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [listening, setListening] = useState(false)
  const [speechSupported] = useState(
    typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  )
  const recognitionRef = useRef(null)

  function saveEntries(updated) {
    setEntries(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    const entry = { id: Date.now(), text: trimmed, createdAt: new Date().toISOString() }
    saveEntries([entry, ...entries])
    setText('')
  }

  function handleDelete(id) {
    saveEntries(entries.filter((e) => e.id !== id))
  }

  function toggleVoice() {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setText((prev) => (prev ? prev + ' ' + transcript : transcript))
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  return (
    <div className="text-entry">
      <h2>Text Entry</h2>
      <form onSubmit={handleSubmit} className="entry-form">
        <div className="input-row">
          <textarea
            className="entry-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or speak your note…"
            rows={3}
          />
          {speechSupported && (
            <button
              type="button"
              className={`voice-btn${listening ? ' active' : ''}`}
              onClick={toggleVoice}
              title={listening ? 'Stop listening' : 'Start voice input'}
            >
              {listening ? '🛑' : '🎙️'}
            </button>
          )}
        </div>
        <button type="submit" disabled={!text.trim()} className="submit-btn">
          Save
        </button>
      </form>

      {entries.length > 0 && (
        <ul className="entries-list">
          {entries.map((entry) => (
            <li key={entry.id} className="entry-item">
              <span className="entry-text">{entry.text}</span>
              <span className="entry-meta">
                {new Date(entry.createdAt).toLocaleString()}
              </span>
              <button
                className="delete-btn"
                onClick={() => handleDelete(entry.id)}
                title="Delete"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {entries.length === 0 && (
        <p className="empty-msg">No entries yet. Add one above!</p>
      )}

      <Link to="/" className="back-link">← Back to Home</Link>
    </div>
  )
}

export default TextEntry
