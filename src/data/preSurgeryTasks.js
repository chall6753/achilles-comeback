// Daily task list for the pre-surgery prep window (Apr 18 – Apr 23, 2026).
// Surgery is Apr 24. Each entry mirrors the Month 1 shape but swaps the
// "study" column for "logistics" — pre-op is about prep, not learning.
//
// Entry shape: { label, badge, physical[], logistics[], mental[] }

const PRE_SURGERY = {
  '2026-04-18': {
    label: 'SAT Apr 18',
    badge: '6 days to surgery',
    physical: [
      'Protein ramp: 160g today — bank tissue-healing base now',
      'Anti-inflammatory foods: berries, greens, fatty fish, turmeric',
      'Sleep ≥ 8 hrs tonight — start building your recovery sleep bank',
      'Upper body workout — you\'re about to need that strength for crutches',
    ],
    logistics: [
      'Choose your recovery station: outlet, pillows, ice, elevation, water within reach',
      'Shopping list: ice packs (×4+), tall water bottle, electrolytes, fiber, stool softener',
      'Have crutches on hand — practice on stairs before surgery day',
    ],
    mental: [
      'Journal: write your Month 1 recovery intention in one sentence',
      'Name one thing you\'re anxious about — put it on paper instead of in your head',
      'No doom-googling Achilles horror stories',
    ],
  },

  '2026-04-19': {
    label: 'SUN Apr 19',
    badge: '5 days to surgery',
    physical: [
      'Meal prep: protein-forward meals for surgery week + first 3 post-op days',
      'Hydrate: 3L today minimum',
      'Protein 160g — non-negotiable all week',
      'Gentle mobility only: hips, ankles, upper body. No heroics.',
    ],
    logistics: [
      'Confirm ride to and from the hospital — driver, pickup time, address',
      'Fill any prescriptions the surgeon pre-approved',
      'Stage loose-fit clothes that fit over a boot or cast',
      'Long chargers positioned at the recovery station',
    ],
    mental: [
      'Call or text someone who\'s been through a real recovery — borrow their perspective',
      'Journal: "What do I want future-me to thank present-me for?"',
      'Lights out by 10 tonight',
    ],
  },

  '2026-04-20': {
    label: 'MON Apr 20',
    badge: '4 days to surgery',
    physical: [
      'Confirm NSAID rules with surgeon (ibuprofen/advil usually stopped 7 days pre-op)',
      'Last "heavier" upper-body session — shoulders + chest + back, leave some in the tank',
      'Protein 160g + full hydration',
      'Sleep ≥ 8 hrs tonight',
    ],
    logistics: [
      'Ice solution locked in: ice machine OR a stack of reusable ice packs',
      'Elevation wedge confirmed — heel has to get above heart',
      'Notify manager/team: confirm coverage for Day 1–7',
      'Set up email autoreply + calendar blocks for surgery week',
    ],
    mental: [
      '10 min breathwork or meditation — start the habit before you need it',
      'Journal: what\'s your win condition for the first post-op week?',
      'Re-read your recovery intention',
    ],
  },

  '2026-04-21': {
    label: 'TUE Apr 21',
    badge: '3 days to surgery',
    physical: [
      'No alcohol starting today — clean slate for anesthesia',
      'Protein 160g + fiber (opioids are coming; get ahead of constipation)',
      'Easy walking/standing only — fresh legs for surgery day',
      'Long shower tonight — last "no-boot" shower for a while',
    ],
    logistics: [
      'Install/stage bathroom aids: toilet frame, shower chair, handrail',
      'Clear walking paths — no rugs, no loose cords, no tripping hazards',
      'Pre-position recovery station: remote, chargers, water, snacks, tissues, book, journal',
      'Post-op appointment on the calendar',
    ],
    mental: [
      'Write your surgeon questions: recovery timeline, PT start, pain management',
      'Journal: what does "temporary helplessness" mean, and how will you handle it?',
      'Plan a Week 1 visit with one friend — structure beats isolation',
    ],
  },

  '2026-04-22': {
    label: 'WED Apr 22',
    badge: '2 days to surgery',
    physical: [
      'No NSAIDs today (confirm with surgeon)',
      'Light movement only — walk, stretch, no intense lifting',
      'Protein target + hydration',
      '8+ hours sleep tonight',
    ],
    logistics: [
      'Pack hospital bag: ID, insurance card, phone + charger, loose clothes, surgeon\'s instructions',
      'Charge everything: phone, watch, earbuds, laptop, e-reader',
      'Queue up entertainment: 2 movies, 1 audiobook, 1 podcast list — reduce post-op decisions',
      'Confirm pharmacy has your meds + pickup plan',
    ],
    mental: [
      'Journal: what strength have you already proven you have?',
      'No doom-scroll past 9 PM — wind down cleanly',
      'Talk to one person who loves you. Tell them the plan.',
    ],
  },

  '2026-04-23': {
    label: 'THU Apr 23',
    badge: '🏥 Day before surgery',
    physical: [
      'Follow surgeon\'s NPO (nothing-by-mouth) cutoff exactly — usually midnight',
      'Big, nutritious dinner early: protein + carbs + hydration',
      'No alcohol. No NSAIDs.',
      'Shower tonight with any surgical wash the team prescribed',
      'In bed by 10 — sleep is the final prep',
    ],
    logistics: [
      'Hospital bag by the door',
      'Phone + watch charged, ride confirmed for the morning',
      'Surgery-friendly clothes laid out — loose, layers',
      'Surgeon questions in your pocket',
      'Recovery station 100% stocked — you won\'t want to fix anything tomorrow night',
    ],
    mental: [
      'Journal: intention for surgery day — what do you choose to believe about this?',
      'Re-read your Month 1 recovery intention one more time',
      'Text the one person you want to hear from tomorrow',
      'Remind yourself: this is temporary. This is training. You will come back upgraded.',
    ],
  },
}

export default PRE_SURGERY
