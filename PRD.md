# Product Requirements Document (PRD)
## Wavecast — Podcast Explorer
**FUTM-SWE-221 | Group 17 Project**

---

## 1. Project Goal & Overview
Wavecast is a lightweight, responsive, client-side web application designed to help users search, explore, and preview podcasts. Powered by the free iTunes Search API, the app allows users to filter by topic, browse recent episodes, view star ratings, subscribe via external platforms, and listen to audio previews natively within a custom player interface.

---

## 2. Target Audience & Persona (Analysis Phase)
The target audience consists of busy individuals looking for quick content discoveries. Our primary focus is the **Commuter Persona**.

### Primary Persona:Carlos the Commuter
* **Profile:** Carlos is a 28-year-old software engineer who spends 45 minutes on a crowded train twice a day.
* **Behaviors:** Carlos listens to tech talks, news summaries, and educational content during his commute.
* **Pain Points:** 
  * Has limited time to search for a new podcast before boarding.
  * Hates opening third-party app links (like Apple Podcasts or Spotify) just to hear a quick 30-second preview of an episode.
  * Needs a mobile-friendly interface that operates smoothly with one hand on a moving train.
  * Prefers dark mode for morning and late-evening commutes to avoid eye strain.

### User Stories
1. **Search by Topic:** *As Carlos, a busy commuter, I want to filter podcasts by clicking predefined topic pills (e.g., "Technology", "Comedy") so that I can immediately discover relevant podcasts without typing.*
2. **Audio Previews:** *As Carlos, I want to click a play button directly next to an episode and hear an audio clip in a sticky player at the bottom of my screen so that I can sample the podcast before subscribing.*
3. **Star Ratings:** *As Carlos, I want to see star ratings next to search results so that I can quickly assess which podcasts are high-quality and popular.*
4. **Subscription Links:** *As Carlos, I want a direct link to the podcast page in Apple Podcasts so that I can quickly subscribe using my device's default player once I've decided I like the show.*
5. **Persistence:** *As Carlos, I want to save podcasts to a "Saved" tab that persists even if my browser tab reloads, so I don't lose track of shows I plan to listen to later.*

---

## 3. Defined Search Fields (Planning Phase)
To ensure high-quality, relevant results, the search engine targets the following metadata fields returned by the iTunes Search API:
* **Podcast Name (`collectionName`):** Matches keywords against the official title of the podcast.
* **Host / Artist Name (`artistName`):** Allows users to search for specific creators, networks, or guests.
* **Primary Genre / Topic (`primaryGenreName`):** Matches topic searches (e.g., "science", "true crime").
* **Topic Pill Filters:** Clicking a predefined category triggers a search for that specific topic query (e.g., clicking "Business" searches for term `business`).

---

## 4. Functional Requirements & Design (Design & Implementation)
* **Responsive Layout:** The interface expands dynamically up to 1200px on desktop (offering a split details-pane layout) and collapses into a thumb-friendly single-column layout on mobile.
* **Horizontal Scrolling Pills:** Category pills scroll horizontally on mobile to save valuable vertical screen space.
* **Native Audio Player:** A sticky player bar at the bottom with play/pause buttons, progress bar tracking, and click-to-scrub capabilities.
* **CORS Proxy Integration:** Fetches live podcast feed XML via AllOrigins to bypass browser CORS blocks, parsing the `<enclosure>` tag to extract audio streams.
* **Deterministic Ratings:** Displays a stable star rating (3.5 to 5.0) mapped from the unique podcast ID.
* **Persistence:** Uses browser `localStorage` to save user subscriptions.
* **Light/Dark Theme:** A toggle switch in the header to change stylesheets based on ambient lighting.

---

## 5. Testing & Error Handling (Testing Phase)
Wavecast gracefully handles edge cases to ensure a robust user experience:
* **Empty Search Results:** Displays a custom illustration (neutral face) and secondary text advising the user to try a different query.
* **Obscure Search Terms:** Handled identically to empty states, ensuring no broken cards or layouts.
* **Unreachable API / Connection Loss:** If the network request fails, the results container displays a "Wifi Off" icon with an alert message stating: *“Could not reach the iTunes API. Check your connection.”*
* **Mock Failbacks:** If a live podcast RSS feed is blocked or offline, the app falls back to rendering local mock episodes in the Detail View, preventing blank screens.
