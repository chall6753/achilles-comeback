import { useState } from 'react'
import Header from './components/Header'
import Today from './components/Today'
import Calendar from './components/Calendar'
import Timeline from './components/Timeline'
import Scorecard from './components/Scorecard'
import Stats from './components/Stats'
import styles from './App.module.css'

const TABS = [
  { id: 'today',     label: '📋 Today' },
  { id: 'calendar',  label: '🗓️ Calendar' },
  { id: 'timeline',  label: '📅 Timeline' },
  { id: 'scorecard', label: '☑️ Scorecard' },
  { id: 'stats',     label: '📊 Stats' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('today')

  return (
    <div className={styles.app}>
      <Header />
      <nav className={styles.nav}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.navBtn} ${activeTab === t.id ? styles.active : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main className={styles.main}>
        {activeTab === 'today'     && <Today />}
        {activeTab === 'calendar'  && <Calendar />}
        {activeTab === 'timeline'  && <Timeline />}
        {activeTab === 'scorecard' && <Scorecard />}
        {activeTab === 'stats'     && <Stats />}
      </main>
    </div>
  )
}
