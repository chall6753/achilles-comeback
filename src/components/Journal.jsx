import { useState } from 'react'
import { useNotesByDate, useNote, setNote, todayKey } from '../hooks/useDb'
import NoteEditor from './NoteEditor'
import styles from './Journal.module.css'

function fmtDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

/** Renders **bold** and - bullets as HTML — same rules as NoteEditor preview. */
function renderMarkdown(text) {
  const lines = text.split('\n')
  const html = []
  let inList = false
  for (const raw of lines) {
    const line = raw.trimEnd()
    const isBullet = /^[-*]\s/.test(line)
    if (isBullet && !inList) { html.push('<ul>'); inList = true }
    if (!isBullet && inList) { html.push('</ul>'); inList = false }
    const content = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    if (isBullet) {
      html.push(`<li>${content.replace(/^[-*]\s/, '')}</li>`)
    } else if (line === '') {
      html.push('<br/>')
    } else {
      html.push(`<p>${content}</p>`)
    }
  }
  if (inList) html.push('</ul>')
  return html.join('')
}

function PastEntry({ date }) {
  const [editing, setEditing] = useState(false)
  const note = useNote(date)

  return (
    <div className={styles.pastCard}>
      <div className={styles.pastHeader}>
        <div className={styles.pastDate}>{fmtDate(date)}</div>
        <button
          type="button"
          className={`${styles.editBtn} ${editing ? styles.editBtnActive : ''}`}
          onClick={() => setEditing(e => !e)}
        >
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <NoteEditor
          value={note}
          onChange={val => setNote(date, val)}
          placeholder="Write here..."
          minHeight={100}
        />
      ) : (
        <div
          className={styles.pastBody}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(note || '') }}
        />
      )}
    </div>
  )
}

export default function Journal() {
  const today    = todayKey()
  const todayNote = useNote(today)
  const notesByDate = useNotesByDate()

  const pastDates = Object.keys(notesByDate)
    .filter(d => d !== today && notesByDate[d]?.trim())
    .sort()
    .reverse()

  return (
    <div className={styles.wrap}>
      {/* Today */}
      <div className={styles.todayCard}>
        <div className={styles.todayHeader}>
          <div className={styles.todayLabel}>Today</div>
          <div className={styles.todayDate}>{fmtDate(today)}</div>
        </div>
        <NoteEditor
          value={todayNote}
          onChange={val => setNote(today, val)}
          placeholder="What went well, what was hard, what you're grateful for..."
          minHeight={160}
        />
      </div>

      {/* Past entries */}
      {pastDates.length > 0 && (
        <div className={styles.pastSection}>
          <div className={styles.pastSectionTitle}>Previous Entries</div>
          {pastDates.map(date => (
            <PastEntry key={date} date={date} />
          ))}
        </div>
      )}

      {pastDates.length === 0 && (
        <div className={styles.empty}>
          Past entries will appear here as you write them.
        </div>
      )}
    </div>
  )
}
