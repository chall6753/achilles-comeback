import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './NoteEditor.module.css'

/** Tiny markdown renderer: **bold** and leading - bullets only. */
function renderMarkdown(text) {
  const lines = text.split('\n')
  const html = []
  let inList = false

  for (const raw of lines) {
    const line = raw.trimEnd()
    const isBullet = /^[-*]\s/.test(line)

    if (isBullet && !inList) { html.push('<ul>'); inList = true }
    if (!isBullet && inList) { html.push('</ul>'); inList = false }

    const content = inlineBold(isBullet ? line.replace(/^[-*]\s/, '') : line)

    if (isBullet) {
      html.push(`<li>${content}</li>`)
    } else if (line === '') {
      html.push('<br/>')
    } else {
      html.push(`<p>${content}</p>`)
    }
  }
  if (inList) html.push('</ul>')
  return html.join('')
}

function inlineBold(str) {
  return str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

export default function NoteEditor({ value, onChange, placeholder, minHeight = 120 }) {
  const [preview, setPreview] = useState(false)
  // Local state so keystrokes are instant — DB write is debounced below
  const [local, setLocal] = useState(value || '')
  const textareaRef = useRef(null)
  const debounceRef = useRef(null)

  // Sync inbound value changes (e.g. navigating to a different date)
  // but don't overwrite what the user is actively typing.
  useEffect(() => {
    setLocal(value || '')
  }, [value])

  const flush = useCallback((val) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onChange(val), 400)
  }, [onChange])

  function handleChange(val) {
    setLocal(val)
    flush(val)
  }

  // Flush immediately on unmount so nothing is lost
  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current)
      // Call onChange synchronously with latest local value on unmount
      if (textareaRef.current) onChange(textareaRef.current.value)
    }
  }, [onChange])

  function wrapSelection(before, after = before) {
    const el = textareaRef.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const v = local
    const selected = v.slice(s, e)
    const next = v.slice(0, s) + before + selected + after + v.slice(e)
    handleChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(s + before.length, e + before.length)
    })
  }

  function insertBullet() {
    const el = textareaRef.current
    if (!el) return
    const { selectionStart: s } = el
    const v = local
    const lineStart = v.lastIndexOf('\n', s - 1) + 1
    const alreadyBullet = /^[-*]\s/.test(v.slice(lineStart))
    if (alreadyBullet) {
      const next = v.slice(0, lineStart) + v.slice(lineStart + 2)
      handleChange(next)
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s - 2, s - 2) })
    } else {
      const next = v.slice(0, lineStart) + '- ' + v.slice(lineStart)
      handleChange(next)
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + 2, s + 2) })
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      const el = textareaRef.current
      const { selectionStart: s } = el
      const v = local
      const lineStart = v.lastIndexOf('\n', s - 1) + 1
      const line = v.slice(lineStart, s)
      if (/^[-*]\s/.test(line)) {
        e.preventDefault()
        if (line.trim() === '-' || line.trim() === '*') {
          const next = v.slice(0, lineStart) + '\n' + v.slice(s)
          handleChange(next)
          requestAnimationFrame(() => { el.focus(); el.setSelectionRange(lineStart + 1, lineStart + 1) })
        } else {
          const next = v.slice(0, s) + '\n- ' + v.slice(s)
          handleChange(next)
          requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + 3, s + 3) })
        }
      }
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button type="button" title="Bold" className={styles.toolBtn} onMouseDown={e => { e.preventDefault(); wrapSelection('**') }}>
          <b>B</b>
        </button>
        <button type="button" title="Bullet" className={styles.toolBtn} onMouseDown={e => { e.preventDefault(); insertBullet() }}>
          ≡
        </button>
        <div className={styles.spacer} />
        <button type="button" className={`${styles.toolBtn} ${preview ? styles.active : ''}`} onClick={() => setPreview(p => !p)}>
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {preview ? (
        <div
          className={styles.preview}
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(local) }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          className={styles.area}
          style={{ minHeight }}
          placeholder={placeholder}
          value={local}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      )}
    </div>
  )
}
