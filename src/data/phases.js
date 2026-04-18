export const SURGERY_DATE = '2026-04-24'

export const PHASES = [
  {
    id: 1, name: 'Survival', short: 'M1',
    start: '2026-04-24', end: '2026-05-23', color: '#E74C3C',
    obj: 'Protect repair. Control mindset.',
    win: 'Make it through Month 1 without regression, with strong habits locked in.',
    goals: {
      Physical: ['Zero setbacks — follow surgeon/PT perfectly', 'Keep swelling low with ice & elevation', 'Maintain clean nutrition from day 1', 'Preserve upper body/core if approved'],
      Mental: ['No pity spiral — accept temporary helplessness', 'Build patience as a daily practice', 'Journal every day'],
      Professional: ['Master HTTP basics deeply', 'Learn auth flows: JWT, OIDC, cookies', 'Review MDS architecture end-to-end'],
      Personal: ['Read 2 books', 'Journal daily', 'Set long-term comeback vision in writing'],
    },
  },
  {
    id: 2, name: 'Discipline Grind', short: 'M2',
    start: '2026-05-24', end: '2026-06-23', color: '#E67E22',
    obj: 'Routine domination.',
    win: 'Become highly disciplined despite slow visible progress.',
    goals: {
      Physical: ['Elite rehab consistency — zero missed sessions', 'Restore ROM as directed', 'Upper body 3×/week', 'Nutrition dialed in — protein tracked'],
      Mental: ['Win against boredom through consistency', 'No doom-scrolling', 'Celebrate small wins daily'],
      Professional: ['C# mastery', 'LINQ mastery', 'EF Core internals', 'SQL joins & indexing'],
      Personal: ['Non-negotiable morning routine', 'Stay socially connected', 'Track mood & energy weekly'],
    },
  },
  {
    id: 3, name: 'Strength Rebuild', short: 'M3',
    start: '2026-06-24', end: '2026-07-23', color: '#D4AC0D',
    obj: 'Confidence rebuild.',
    win: 'Walk with momentum and avoid ego mistakes.',
    goals: {
      Physical: ['Walk smoothly — focus on gait quality', 'Rebuild calf activation with PT', 'Daily balance work', 'Core and hips noticeably stronger'],
      Mental: ["Don't rush — patience over ego", 'Trust the process', 'Visualize athletic return daily'],
      Professional: ['Build & ship something: tee time app, API project, or toolkit', "Ship at least one thing you're proud of"],
      Personal: ['Wardrobe refresh', 'Social re-entry', 'Confidence rebuild rituals'],
    },
  },
  {
    id: 4, name: 'Performance Base', short: 'M4',
    start: '2026-07-24', end: '2026-08-23', color: '#27AE60',
    obj: 'Strength + Life Return.',
    win: "People notice you're leveling up.",
    goals: {
      Physical: ['Full gym rhythm 4–5×/week', 'Single-leg strength measurable', 'Conditioning starts', 'Daily mobility — non-negotiable'],
      Mental: ['Competitive hunger returns', 'Set new benchmarks to chase', 'Gratitude practice'],
      Professional: ['Speak up in architecture talks', 'Lead solutions', 'Present ideas clearly and confidently'],
      Personal: ['Better routines than pre-injury', 'Better sleep hygiene locked in', 'Cleaner diet as lifestyle'],
    },
  },
  {
    id: 5, name: 'Athletic Return', short: 'M5',
    start: '2026-08-24', end: '2026-09-23', color: '#3498DB',
    obj: 'Controlled sport comeback.',
    win: "You're living again, not rehabbing.",
    goals: {
      Physical: ['Golf return (if cleared)', 'Light explosive work when approved', 'Return-to-run prep', 'Strength symmetry between legs'],
      Mental: ['Trust the repaired tendon', 'Stay conservative — caution > setback', 'Celebrate athletic milestones'],
      Professional: ['Ship valuable work', 'Build reputation as reliable engineer', 'Be who others want to work with'],
      Personal: ["Take a weekend trip", "Reflect on how far you've come", 'Set post-recovery athletic goals'],
    },
  },
  {
    id: 6, name: 'Revenge Arc', short: 'M6',
    start: '2026-09-24', end: '2026-10-23', color: '#9B59B6',
    obj: 'Be better than pre-injury.',
    win: "You're undeniably ahead of old you.",
    goals: {
      Physical: ['Stronger upper body than pre-injury', 'Leaner physique', 'Better mobility than ever', 'Strong calf progression', 'Confident, fluid movement'],
      Mental: ['Know you can survive hard seasons', 'Bigger vision for your capabilities', 'Share the comeback story'],
      Professional: ['New skills mastered & in daily use', 'Undeniably a better engineer', 'Set next 12-month career goal'],
      Personal: ['Deep appreciation for health', 'Sharper discipline that outlasts rehab', 'Gratitude for people who helped'],
    },
  },
]

export const SCORECARD_HABITS = [
  { cat: 'PHYSICAL', items: ['Rehab sessions completed', 'Protein target hit', 'Weight stable/improved', 'Sleep ≥ 7 hrs'] },
  { cat: 'MENTAL',   items: ['Journal entry written', 'No negative spiral', 'Reading progress'] },
  { cat: 'PROFESSIONAL', items: ['Deep work hours logged', 'New skill/concept learned', 'Work win or shipped output'] },
  { cat: 'PERSONAL', items: ['Clean room/home', 'Social connection', 'Gratitude noted'] },
]
