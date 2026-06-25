# Wavecast — Podcast Explorer
**FUTM-SWE-221 | Group 17 Project**

A web app for searching and browsing podcasts using the free iTunes Search API.
No API key required. No backend. No build step. Open `index.html` and it works.

---

## Folder Structure

```
wavecast/
│
├── index.html          ← Entry point. Open this in a browser to run the app.
│
├── css/
│   ├── reset.css       ← Browser default style reset (margins, box-sizing etc.)
│   ├── style.css       ← Layout, topbar, views, tokens (CSS variables), typography
│   └── components.css  ← Card styles (featured, grid, list), episodes, saved view
│
└── js/
    ├── data.js         ← Static data: topic list, artwork colors, mock episode fallback
    ├── utils.js        ← Pure helper functions: getInitials, escapeHtml, truncate etc.
    ├── api.js          ← All iTunes API calls: searchPodcasts, lookupPodcast, fetchEpisodes
    ├── render.js       ← HTML generation: renderResults, renderEpisodes, renderSaved etc.
    └── app.js          ← Main controller: state, event listeners, navigation, init
```

---

## How to Run

1. Open `index.html` in any modern browser (Chrome, Firefox, Edge).
2. The app fetches live data from the iTunes Search API on load.
3. No npm install, no build tools, no server required.

> If you see a CORS error in the console for RSS feed fetching — that is expected.
> The app falls back to placeholder episode data automatically.
> In a production version, RSS feeds would be fetched through a backend proxy.

---

## How the Files Connect

```
index.html
  └── loads css/reset.css
  └── loads css/style.css
  └── loads css/components.css
  └── loads js/data.js       ← must load first (TOPICS, ART_COLORS, MOCK_EPISODES)
  └── loads js/utils.js      ← must load second (helper functions)
  └── loads js/api.js        ← must load third (uses escapeHtml from utils.js)
  └── loads js/render.js     ← must load fourth (uses utils + data constants)
  └── loads js/app.js        ← loads last (uses everything above)
```

**Script load order matters.** Do not reorder the `<script>` tags in `index.html`.

---

## API Used

**iTunes Search API**
- URL: `https://itunes.apple.com/search`
- Free, no API key, no account needed
- Documentation: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI

Example request:
```
https://itunes.apple.com/search?term=technology&media=podcast&entity=podcast&limit=20
```

---

## Features

- Search podcasts by any topic, keyword, or host name
- Topic pill shortcuts (Technology, Business, Comedy, etc.)
- Featured card + grid + list layout for results
- Podcast detail view with episode list
- Save/unsave podcasts (stored in memory during session)
- Share button (uses Web Share API with clipboard fallback)
- Trending tab (random topic rotation)
- Responsive — works on mobile browsers
- Error and empty states handled

---

## Known Limitations (documented for the project report)

1. **No persistent storage** — saved podcasts are lost on page refresh.
   Fix: use `localStorage` to persist the saved list.

2. **Episode data is mocked** — most podcast RSS feeds block browser requests (CORS).
   Fix: add a simple backend proxy (Node.js or Python) to fetch RSS feeds server-side.

3. **No real audio playback** — the preview button opens the Apple Podcasts page.
   Fix: use the `previewUrl` field from the iTunes API with an HTML `<audio>` element.

4. **No pagination** — only 20 results are shown per search.
   Fix: add a "Load more" button using the iTunes API `offset` parameter.

---

## Project Team

| Role | Responsibility |
|------|----------------|
| Lead Developer | HTML, CSS, JavaScript, API integration, GitHub deployment |
| Documentation | PRD, User Manual, project proposal |
| Designer | Wireframes, Canva mockups, presentation slides |
| Tester & Presenter | Test cases, bug reports, oral presentation |

---

## Deployment

Host for free on GitHub Pages:
1. Push this folder to a GitHub repository
2. Go to Settings → Pages → Source: main branch / root
3. Your app will be live at `https://yourusername.github.io/wavecast`
