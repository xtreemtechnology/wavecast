/**
 * api.js
 * All network requests to the iTunes Search API.
 * https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI
 *
 * The iTunes Search API is free and requires no API key.
 * Base URL: https://itunes.apple.com/search
 */

const API_BASE = 'https://itunes.apple.com/search';

/**
 * Searches for podcasts by a text query.
 * Returns an array of podcast result objects from iTunes.
 *
 * @param {string} term   - The search query (topic, podcast name, host)
 * @param {number} limit  - Max number of results (default 20, max 200)
 * @returns {Promise<Array>}
 */
async function searchPodcasts(term, limit = 20, offset = 0) {
  if (!term || !term.trim()) {
    throw new Error('Search term cannot be empty.');
  }

  const params = new URLSearchParams({
    term:   term.trim(),
    media:  'podcast',
    entity: 'podcast',
    limit:  limit,
    offset: offset,
  });

  const url = `${API_BASE}?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`iTunes API returned status ${response.status}.`);
  }

  const data = await response.json();

  // iTunes wraps results in a `results` array
  return data.results || [];
}

/**
 * Looks up a single podcast by its iTunes collection ID.
 * Useful for fetching fresh detail data when opening a podcast.
 *
 * @param {number} collectionId
 * @returns {Promise<Object|null>}
 */
async function lookupPodcast(collectionId) {
  const url = `https://itunes.apple.com/lookup?id=${collectionId}&entity=podcast`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`iTunes lookup returned status ${response.status}.`);
  }

  const data = await response.json();
  return data.results?.[0] || null;
}

/**
 * Attempts to fetch and parse a podcast RSS feed to extract episodes.
 * iTunes does not expose episode data through its search API — we have
 * to hit the feed URL directly.
 *
 * NOTE: Many podcast RSS feeds do not include CORS headers, so this will
 * fail in the browser for most feeds. In a production app you would proxy
 * the request through your own server. For this project we fall back to
 * MOCK_EPISODES (defined in data.js) when the feed cannot be reached.
 *
 * @param {string} feedUrl
 * @returns {Promise<Array>} Array of episode objects { title, desc, date, duration }
 */
async function fetchEpisodes(feedUrl) {
  if (!feedUrl) return [];

  try {
    const hostname = window.location.hostname;
    // Use Vercel serverless proxy on Vercel deployments, fall back to AllOrigins locally or on GitHub Pages
    const useAllOrigins = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.github.io') || hostname === '';
    const proxyUrl = useAllOrigins
      ? `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`
      : `/api/feed?url=${encodeURIComponent(feedUrl)}`;
    
    const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(7000) });
    if (!response.ok) return [];

    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'application/xml');
    const items = Array.from(xml.querySelectorAll('item'));

    return items.slice(0, 15).map((item, index) => {
      const title    = item.querySelector('title')?.textContent || `Episode ${index + 1}`;
      const desc     = item.querySelector('description')?.textContent || '';
      const pubDate  = item.querySelector('pubDate')?.textContent || '';
      const duration = item.querySelector('itunes\\:duration, duration')?.textContent || '';
      const audioUrl = item.querySelector('enclosure')?.getAttribute('url') || '';

      // Clean the description — RSS feeds often embed HTML tags
      const cleanDesc = desc.replace(/<[^>]+>/g, '').trim();

      // Format the date if available
      const formattedDate = pubDate
        ? new Date(pubDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

      return {
        title:    title, // Return unescaped, render.js will escape it
        desc:     truncate(cleanDesc, 160), // Return unescaped, render.js will escape it
        date:     formattedDate,
        duration: formatDuration(duration),
        audioUrl: audioUrl,
      };
    });
  } catch (e) {
    console.warn('CORS feed fetch failed, falling back to mock episodes.', e);
    // CORS block or network error — return empty so caller falls back to mocks
    return [];
  }
}

/**
 * Formats a raw iTunes duration string into a readable format.
 * Handles both "HH:MM:SS", "MM:SS", and plain second counts.
 * @param {string} raw
 * @returns {string}
 */
function formatDuration(raw) {
  if (!raw) return '';
  const parts = raw.split(':').map(Number);
  if (parts.length === 3) {
    const [h, m] = parts;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  }
  if (parts.length === 2) {
    return `${parts[0]} min`;
  }
  // Plain seconds
  const secs = parseInt(raw, 10);
  if (!isNaN(secs)) {
    const m = Math.floor(secs / 60);
    const h = Math.floor(m / 60);
    return h > 0 ? `${h}h ${m % 60}m` : `${m} min`;
  }
  return raw;
}
