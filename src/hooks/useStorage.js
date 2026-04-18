import { useState, useEffect } from 'react'

const PREFIX = 'achilles_'

export function useLocalStorage(key, defaultValue = {}) {
  const fullKey = PREFIX + key

  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(fullKey)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const set = (newVal) => {
    const resolved = typeof newVal === 'function' ? newVal(value) : newVal
    setValue(resolved)
    localStorage.setItem(fullKey, JSON.stringify(resolved))
  }

  return [value, set]
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function fmtDate(d) {
  return new Date(d).toISOString().slice(0, 10)
}

export function daysSince(dateStr) {
  return Math.floor((new Date(todayKey()) - new Date(dateStr)) / 86400000)
}
