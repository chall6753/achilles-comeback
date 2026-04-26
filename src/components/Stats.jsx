import { useRef, useEffect, useState } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js'
import {
  useStatsByDate,
  useStatsDraft,
  setStatsDraft,
  commitStatsDraft,
  useNotesByDate,
  useTasksByDate,
  useMentalResponsesByDate,
  useProteinEntries,
  addProteinEntry,
  removeProteinEntry,
  todayKey,
  daysSince,
} from '../hooks/useDb'
import { buildSections } from '../data/dailyTasks'
import styles from './Stats.module.css'

function getMentalPrompt(date, taskId) {
  const sections = buildSections(date)
  const mental = sections.find(s => s.isMental)
  if (!mental) return null
  const idx = parseInt(taskId.replace(/^\D+/, ''), 10)
  return mental.items[idx] ?? null
}

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

const SURGERY = '2026-04-24'

const METRICS = [
  { key: 'weight',  label: 'Weight (lbs)',          color: '#3498DB', placeholder: '185',  step: '0.1' },
  { key: 'sleep',   label: 'Sleep (hrs)',            color: '#27AE60', placeholder: '7.5',  step: '0.5' },
  { key: 'pain',    label: 'Pain Level (0–10)',      color: '#E74C3C', placeholder: '4',    step: '1'   },
  { key: 'protein', label: 'Protein (g)',            color: '#E67E22', placeholder: '160',  step: '1'   },
  { key: 'study',   label: 'Study (hrs)',            color: '#9B59B6', placeholder: '2',    step: '0.5' },
  { key: 'pages',   label: 'Pages Read',             color: '#1ABC9C', placeholder: '20',   step: '1'   },
]

function MiniChart({ metric, data, labels }) {
  const ref = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    if (chartRef.current) chartRef.current.destroy()
    chartRef.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data,
          borderColor: metric.color,
          backgroundColor: metric.color + '22',
          tension: .3,
          fill: true,
          pointRadius: 3,
          spanGaps: true,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
        scales: {
          y: { grid: { color: '#F0F0F0' }, ticks: { font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        },
      },
    })
    return () => chartRef.current?.destroy()
  }, [data, labels])

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>{metric.label}</div>
      <canvas ref={ref} height={160} />
    </div>
  )
}

function ProteinLog({ date }) {
  const entries = useProteinEntries(date) || []
  const [food, setFood] = useState('')
  const [grams, setGrams] = useState('')

  const total = entries.reduce((s, e) => s + (Number(e.grams) || 0), 0)

  function add() {
    const f = food.trim()
    const g = parseFloat(grams)
    if (!f || !Number.isFinite(g) || g <= 0) return
    addProteinEntry(date, f, g)
    setFood('')
    setGrams('')
  }

  function onKey(e) {
    if (e.key === 'Enter') add()
  }

  return (
    <div className={styles.inputCard}>
      <div className={styles.proteinHeader}>
        <div className={styles.inputTitle}>Protein Log</div>
        <div className={styles.proteinTotal}>{total}g</div>
      </div>
      <div className={styles.proteinAddRow}>
        <input
          className={styles.proteinFoodInput}
          type="text"
          placeholder="Food (e.g. chicken breast)"
          value={food}
          onChange={e => setFood(e.target.value)}
          onKeyDown={onKey}
        />
        <input
          className={styles.proteinGramsInput}
          type="number"
          step="1"
          placeholder="grams"
          value={grams}
          onChange={e => setGrams(e.target.value)}
          onKeyDown={onKey}
        />
        <button className={styles.proteinAddBtn} onClick={add}>Add</button>
      </div>
      {entries.length === 0 ? (
        <div className={styles.proteinEmpty}>No entries yet — log what you ate to build today's total.</div>
      ) : (
        <ul className={styles.proteinList}>
          {entries.map(e => (
            <li key={e.id} className={styles.proteinEntry}>
              <span className={styles.proteinFood}>{e.food}</span>
              <span className={styles.proteinGrams}>{e.grams}g</span>
              <button
                className={styles.proteinRemoveBtn}
                onClick={() => removeProteinEntry(date, e.id)}
                aria-label={`Remove ${e.food}`}
              >×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Stats() {
  const t = todayKey()
  const statsData      = useStatsByDate()
  const draft          = useStatsDraft(t)
  const notes          = useNotesByDate()
  const tasks          = useTasksByDate()
  const mentalByDate   = useMentalResponsesByDate()

  const days = Math.max(0, daysSince(SURGERY))
  const recentKeys = Object.keys(statsData).sort().slice(-30)
  const labels = recentKeys.map(k => new Date(k).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }))

  function updateDraft(key, val) {
    setStatsDraft(t, { ...draft, [key]: val })
  }

  function save() {
    commitStatsDraft(t, draft)
    const el = document.getElementById('toastMsg')
    if (el) { el.style.opacity = '1'; setTimeout(() => el.style.opacity = '0', 2000) }
  }

  // Streaks
  function calcStreak(fn) {
    let streak = 0
    const d = new Date(t)
    for (let i = 0; i < 60; i++) {
      const k = d.toISOString().slice(0, 10)
      if (fn(k)) streak++; else if (i > 0) break
      d.setDate(d.getDate() - 1)
    }
    return streak
  }
  const taskStreak    = calcStreak(k => Object.values(tasks[k] || {}).some(v => v))
  const journalStreak = calcStreak(k => (notes[k] || '').trim().length > 10)
  const proteinStreak = calcStreak(k => (statsData[k]?.protein || 0) >= 150)

  const streaks = [
    { icon: '🔥', val: taskStreak,    label: 'Task Streak',    unit: 'days' },
    { icon: '📖', val: journalStreak, label: 'Journal Streak', unit: 'days' },
    { icon: '💪', val: proteinStreak, label: 'Protein Streak', unit: 'days' },
    { icon: '📅', val: days,          label: 'Day of Recovery', unit: '' },
  ]

  return (
    <div>
      {/* Streaks */}
      <div className={styles.streakRow}>
        {streaks.map(s => (
          <div key={s.label} className={styles.streakCard}>
            <div className={styles.streakIcon}>{s.icon}</div>
            <div className={styles.streakNum}>{s.val}</div>
            <div className={styles.streakLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className={styles.inputCard}>
        <div className={styles.inputTitle}>
          Log Today's Numbers — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <div className={styles.inputGrid}>
          {METRICS.filter(m => m.key !== 'protein').map(m => (
            <div key={m.key} className={styles.inputGroup}>
              <label>{m.label}</label>
              <input
                type="number"
                step={m.step}
                placeholder={m.placeholder}
                value={draft[m.key] ?? ''}
                onChange={e => updateDraft(m.key, e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          ))}
        </div>
        <button className={styles.saveBtn} onClick={save}>Save Today's Log</button>
        <span id="toastMsg" className={styles.toast}>Saved ✓</span>
      </div>

      {/* Protein log — auto-syncs total into stats.protein */}
      <ProteinLog date={t} />

      {/* Charts */}
      <div className={styles.chartsGrid}>
        {METRICS.map(m => (
          <MiniChart
            key={m.key}
            metric={m}
            labels={labels}
            data={recentKeys.map(k => statsData[k]?.[m.key] ?? null)}
          />
        ))}
      </div>

      {/* Mind Log */}
      {Object.keys(mentalByDate).length > 0 && (
        <div className={styles.journalCard}>
          <div className={styles.journalTitle}>🧠 Mind Log</div>
          <div className={styles.mindLog}>
            {Object.keys(mentalByDate).sort().reverse().map(date => (
              <div key={date} className={styles.mindDay}>
                <div className={styles.mindDayLabel}>
                  {new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                </div>
                {Object.entries(mentalByDate[date]).map(([taskId, response]) => {
                  const prompt = getMentalPrompt(date, taskId)
                  return (
                    <div key={taskId} className={styles.mindEntry}>
                      {prompt && <div className={styles.mindPrompt}>{prompt}</div>}
                      <div className={styles.mindResponse}>"{response}"</div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
