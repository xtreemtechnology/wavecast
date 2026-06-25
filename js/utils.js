/**
 * utils.js
 * Pure helper functions — no DOM access, no side effects.
 */

/**
 * Returns initials from a podcast name (up to 2 characters).
 * e.g. "The Daily Show" → "TD"
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Returns the artwork color pair for a given index.
 * Wraps around if index exceeds the palette length.
 * @param {number} index
 * @returns {{ bg: string, fg: string }}
 */
function getArtColor(index) {
  return ART_COLORS[index % ART_COLORS.length];
}

/**
 * Sanitises a string for safe insertion as HTML text.
 * Prevents XSS from API-returned strings.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Truncates a string to a maximum character length and adds an ellipsis.
 * @param {string} str
 * @param {number} max
 * @returns {string}
 */
function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max).trimEnd() + '…' : str;
}

/**
 * Debounces a function so it only fires after the user
 * has stopped calling it for `delay` milliseconds.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Formats a number with commas for display.
 * e.g. 1200 → "1,200"
 * @param {number} n
 * @returns {string}
 */
function formatNumber(n) {
  if (!n && n !== 0) return '—';
  return n.toLocaleString();
}

/**
 * Returns a deterministic rating between 3.5 and 5.0 based on collection ID.
 * @param {number|string} collectionId
 * @returns {number}
 */
function getDeterministicRating(collectionId) {
  if (!collectionId) return 4.2;
  const idNum = Number(collectionId);
  if (isNaN(idNum)) return 4.2;
  const rating = 3.5 + ((idNum % 16) * 0.1);
  return Math.round(rating * 10) / 10;
}

/**
 * Generates HTML string of star icons for a rating.
 * @param {number} rating
 * @returns {string}
 */
function getStarsHtml(rating) {
  const rounded = Math.round(rating);
  let html = '<span class="stars" aria-label="Rating: ' + rating + ' out of 5 stars">';
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      html += '<span class="star-filled">★</span>';
    } else {
      html += '<span class="star-empty">★</span>';
    }
  }
  html += '</span>';
  return html;
}

