# Wavecast — User Manual
**FUTM-SWE-221 | Group 17 Project**

Welcome to **Wavecast**, a fast, clean, and fully responsive podcast explorer web app that runs directly in your browser. This guide walks you through using the application and utilizing its core features.

---

## 1. Quick Start

### Launching Locally
1. Navigate to the `wavecast` project folder.
2. Locate the [index.html](file:///c:/Users/DANIEL/Documents/GitHub/Wavecast/index.html) file.
3. Double-click [index.html](file:///c:/Users/DANIEL/Documents/GitHub/Wavecast/index.html) or right-click and choose **Open with** (Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari).
4. No installation, server, or configuration is required!

### Launching on Web Hostings (Vercel / GitHub Pages)
Wavecast is fully static. It is designed to be hosted for free on platforms like **Vercel** or **GitHub Pages** simply by pushing the codebase to a GitHub repository and linking it.

---

## 2. Interface Overview & Navigation

### Theme Toggle (Light/Dark Mode)
In the top right corner of the header, next to the course badge, click the **Theme Toggle** button (represented by a Moon icon in light mode, and a Sun icon in dark mode) to toggle the theme. Your preference will automatically save to your browser's local memory and persist upon page reload.

### Tab Options
The top navigation bar displays three tabs:
1. **Browse:** Default tab containing topic shortcuts, the search results grid, and lists.
2. **Trending:** Generates a randomized trending topic query on load (e.g., True Crime, Comedy, Business).
3. **Saved:** Displays your bookmarked/subscribed podcasts.

---

## 3. Searching and Browsing Podcasts

### Topic Pills
Under the search bar, click on any predefined topic pill (e.g., *Technology*, *Business*, *Comedy*, *Science*) to run a quick query. On mobile screens, swipe left or right to scroll through the full list of pills. The active pill automatically centers into view.

### Active Search
Type a keyword, podcast title, or host name into the search bar:
* **Instant Search (Debounced):** The app automatically searches 450 milliseconds after you stop typing (minimum 3 characters).
* **Manual Search:** Press the `Enter` key or click the **Search** button to execute a search immediately.

### Understanding Search Results
Search results display in three layouts depending on rank:
1. **Featured Card (Top Rank):** A large card featuring cover art, title, publisher name, ratings, and a quick audio preview play button.
2. **Card Grid (Next 4 Ranks):** Responsive grid of cards displaying cover art, titles, publisher, and ratings.
3. **List Rows (Subsequent Ranks):** Compact list rows showing cover art, details, star ratings, and the number of available episodes.

### Star Ratings
Each podcast card displays a gold-colored rating (e.g., `★★★★☆ 4.2`) calculated deterministically from the podcast metadata.

---

## 4. Episode Exploration & Detail View

Click on any podcast card or row to open its **Detail View**:
* **Desktop Split Layout:** On wider screens, details freeze in a sticky sidebar card on the left, and episodes are displayed in a scrollable list on the right.
* **Mobile Layout:** Collapses to a unified stacked view.

### Subscribing & Sharing
* **Subscribe Button:** Click to open the official podcast listing on Apple Podcasts in a new tab.
* **Save/Bookmark Button:** Click "Save" to add the podcast to your **Saved** tab. This saves the podcast metadata to your browser's `localStorage` so it persists across refreshes. Click "Saved" again to remove it.
* **Share Button:** Copies the podcast URL to your clipboard for easy sharing.

---

## 5. Built-in Audio Player

Click the **Play Icon** next to any episode to listen to its audio:
* A custom audio player bar will slide up from the bottom of your screen.
* **Play/Pause Button:** Toggle the audio stream.
* **Progress Tracking:** The progress bar fills in as the audio plays.
* **Scrubbing:** Click or tap anywhere along the progress bar to jump forwards or backwards in the audio track.
* **Dismiss Player:** Click the close `✕` button to stop the audio and hide the player bar.

---

## 6. Troubleshooting

* **Empty Search State:** If you search for an obscure term and see a face icon stating "No podcasts found", double-check your spelling or tap one of the topic pills.
* **Connection Error:** If your internet drops or the iTunes API is blocked, a "Wifi Off" icon will display with a notice to check your internet connection.
* **Episode fallbacks (CORS Proxy):** External podcast feeds require a browser-compliant proxy. If the RSS feed fails to load, the app automatically falls back to clean mock episode rows so that the interface remains functional and navigable.
