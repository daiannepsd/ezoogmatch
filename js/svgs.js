// Flat SVG silhouettes for each species
const SVG = {
  horse: `<svg viewBox="0 0 120 80" fill="#000" xmlns="http://www.w3.org/2000/svg">
    <path d="M95 12c-2-1-5-1-7 1l-3 3-4-2c-3-1-6 0-8 2l-2 3-8-1c-5-1-10 2-13 6l-3 6-10 2c-6 1-10 5-11 11l-1 8 3 1 1-7c1-4 4-7 8-8l8-1 1 3c1 4 4 7 8 8l2 1v8h4v-8l20 1v8h4v-9l4-2c4-2 6-6 6-10v-3l5-3c3-2 4-5 3-8l-3-6 2-3c1-2 0-4-2-5z"/>
    <path d="M28 52l-2 1-1 5-3 1v4h4l1-4 3-1 1-5z" opacity=".7"/>
  </svg>`,

  cow: `<svg viewBox="0 0 120 80" fill="#000" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 18c-2 0-4 1-5 3l-2 5 3 2 2-4 3-1 1 4c0 3 2 5 5 6l3 1v4l-4 1c-3 1-5 4-5 7v8h4v-7l4-1 1 8h4l-1-8 18 1 1 8h4l-1-9 4-1v7h4v-8c0-3-2-6-5-7l-5-1v-4l4-2c3-2 4-5 3-8l-2-7c-1-3-4-5-7-5H38l-3-2c-2-2-5-2-7-1l-4 2-4-2z"/>
    <path d="M18 18l-1-4c0-2-2-3-3-2s-2 2-1 4l2 4 3-2zM26 16l1-4c0-2 2-3 3-2s2 2 1 4l-2 4-3-2z" opacity=".8"/>
  </svg>`,

  goat: `<svg viewBox="0 0 120 80" fill="#000" xmlns="http://www.w3.org/2000/svg">
    <path d="M75 10c-2-1-4 0-5 2l-2 4-5-1c-4-1-8 1-10 5l-2 5-8 1c-5 1-9 5-9 10v5l-5 2c-3 1-5 4-5 7v8h4v-7l3-1 1 8h4l-1-8 16 1 1 8h4l-1-9 3-1v8h4v-8l3-2c3-2 5-5 4-9l-1-5 4-3c3-2 4-6 3-9l-2-6 3-4c1-2 1-5-1-6z"/>
    <path d="M73 8l2-5c1-2 3-2 4-1s1 3 0 4l-3 4-3-2zM80 10l3-4c1-2 3-2 4 0s0 3-1 5l-3 2-3-3z" opacity=".8"/>
    <ellipse cx="62" cy="62" rx="3" ry="5" opacity=".5"/>
  </svg>`,

  sheep: `<svg viewBox="0 0 120 80" fill="#000" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="55" cy="35" rx="28" ry="20" opacity=".9"/>
    <circle cx="40" cy="28" r="10" opacity=".85"/>
    <circle cx="55" cy="22" r="11" opacity=".85"/>
    <circle cx="70" cy="26" r="10" opacity=".85"/>
    <circle cx="75" cy="38" r="9" opacity=".8"/>
    <path d="M30 48l-2 1v12h4V50zM42 50v12h4V50zM62 50v12h4V50zM74 48l-2 1v12h4V50z"/>
    <ellipse cx="32" cy="32" rx="5" ry="7" opacity=".7"/>
    <path d="M28 30c-1-2-3-3-5-2s-2 3-1 5l2 3 4-2-1-4z" opacity=".6"/>
    <path d="M36 28c0-2-1-4-3-4s-3 2-3 4l1 4 4-1 1-3z" opacity=".6"/>
  </svg>`
};
