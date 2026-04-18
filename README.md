# Achilles Comeback Dashboard

A personal recovery tracking dashboard built with React + Vite.

## Stack
- React 18
- Vite 5
- Chart.js + react-chartjs-2
- CSS Modules
- localStorage for persistence

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Features
- **Today** — Day-specific task checklists (PT, Study, Mental) with progress tracking
- **Timeline** — 6-phase visual recovery arc with live progress bars
- **Scorecard** — Weekly habit grid with week navigation
- **Stats** — Daily metric logging (weight, sleep, pain, protein, study) + trend charts + journal

## Project Structure
```
src/
  components/     React page components + CSS Modules
  data/           phases.js, month1Tasks.js
  hooks/          useStorage.js (localStorage helper)
  App.jsx
  main.jsx
```

## Recovery Timeline
| Phase | Dates | Focus |
|-------|-------|-------|
| M1 Survival | Apr 24 – May 23 | Protect repair. Control mindset. |
| M2 Discipline Grind | May 24 – Jun 23 | Routine domination. |
| M3 Strength Rebuild | Jun 24 – Jul 23 | Confidence rebuild. |
| M4 Performance Base | Jul 24 – Aug 23 | Strength + Life Return. |
| M5 Athletic Return | Aug 24 – Sep 23 | Controlled sport comeback. |
| M6 Revenge Arc | Sep 24 – Oct 23 | Be better than pre-injury. |

---
*This is temporary. This is training. I will come back upgraded.*
