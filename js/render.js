/**
 * render.js
 * Functions that generate and inject HTML into the DOM.
 * Each function targets a specific container element by ID.
 */

// ─── SVG icon snippets used in rendered HTML ────────────────────────────────

const ICON = {
  chevronRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`,
  headphones:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`,
  play:         `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  playWhite:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  wifiOff:      `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  moodEmpty:    `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  bookmark:     `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  spinnerSmall: `<svg class="spinner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
};

// ─── Topic Pills ─────────────────────────────────────────────────────────────

/**
 * Renders the topic pill buttons into #pillRow.
 * The first topic is marked active by default.
 */
function renderTopics() {
  const container = document.getElementById('pillRow');
  if (!container) return;

  container.innerHTML = TOPICS.map((topic, index) => `
    <button
      class="pill${index === 0 ? ' active' : ''}"
      data-query="${escapeHtml(topic.query)}"
      aria-pressed="${index === 0 ? 'true' : 'false'}"
    >${escapeHtml(topic.label)}</button>
  `).join('');
}

// ─── Loading / State Screens ──────────────────────────────────────────────────

/** Shows a loading skeleton screen or spinner in the target container. */
function showLoading(containerId, message = 'Fetching podcasts…') {
  const el = document.getElementById(containerId);
  if (!el) return;
  
  if (containerId === 'resultsArea') {
    showSearchSkeletons();
  } else if (containerId === 'episodesArea') {
    showEpisodeSkeletons();
  } else {
    el.innerHTML = `
      <div class="loading-spinner" role="status" aria-label="${escapeHtml(message)}">
        ${ICON.spinnerSmall}
        <span>${escapeHtml(message)}</span>
      </div>
    `;
  }
}

/** Renders skeletal card layouts during search results loading */
function showSearchSkeletons() {
  const area = document.getElementById('resultsArea');
  if (!area) return;
  area.innerHTML = `
    <div class="skeleton sk-featured"></div>
    <div class="sk-grid">
      <div class="skeleton sk-card"></div>
      <div class="skeleton sk-card"></div>
      <div class="skeleton sk-card"></div>
      <div class="skeleton sk-card"></div>
    </div>
    <div class="sk-list">
      <div class="skeleton sk-row"></div>
      <div class="skeleton sk-row"></div>
      <div class="skeleton sk-row"></div>
    </div>
  `;
}

/** Renders skeletal row layouts during episode loading */
function showEpisodeSkeletons() {
  const area = document.getElementById('episodesArea');
  if (!area) return;
  area.innerHTML = `
    <div class="sk-list">
      <div class="skeleton sk-row" style="height: 64px;"></div>
      <div class="skeleton sk-row" style="height: 64px;"></div>
      <div class="skeleton sk-row" style="height: 64px;"></div>
      <div class="skeleton sk-row" style="height: 64px;"></div>
      <div class="skeleton sk-row" style="height: 64px;"></div>
    </div>
  `;
}

/** Shows a network error state in the target container. */
function showError(containerId, message = 'Something went wrong. Check your connection and try again.') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="state-box" role="alert">
      ${ICON.wifiOff}
      <p>${escapeHtml(message)}</p>
      <small>Make sure you are connected to the internet.</small>
    </div>
  `;
}

/** Shows an empty results state in the target container. */
function showEmpty(containerId, term = '') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="state-box">
      ${ICON.moodEmpty}
      <p>No podcasts found${term ? ` for "${escapeHtml(term)}"` : ''}.</p>
      <small>Try a different search term or topic.</small>
    </div>
  `;
}

// ─── Results ─────────────────────────────────────────────────────────────────

/**
 * Renders the search results layout into #resultsArea.
 * Supports overwrite mode (first page) and append mode (pagination).
 *
 * @param {Array}   results  - Array of iTunes podcast objects
 * @param {string}  term     - The search term (for labelling)
 * @param {boolean} append   - Whether to append to existing list rows
 */
function renderResults(results, term, append = false) {
  const area          = document.getElementById('resultsArea');
  const labelEl       = document.getElementById('resultsLabel');
  const countEl       = document.getElementById('resultsCount');
  const loadMore      = document.getElementById('loadMoreContainer');

  if (!area) return;

  if (!append) {
    if (labelEl) labelEl.textContent = `Results for "${term}"`;
    if (countEl) countEl.textContent = `${results.length} found`;

    if (!results.length) {
      showEmpty('resultsArea', term);
      if (countEl) countEl.textContent = '';
      if (loadMore) loadMore.style.display = 'none';
      return;
    }

    let html = '';

    // 1. Featured card — first result
    html += renderFeaturedCard(results[0], 0);

    // 2. 2-column grid — results 1–4
    const gridItems = results.slice(1, 5);
    if (gridItems.length) {
      html += `<div class="pod-grid">`;
      gridItems.forEach((pod, i) => {
        html += renderGridCard(pod, i + 1);
      });
      html += `</div>`;
    }

    // 3. List rows — results 5+
    const listItems = results.slice(5);
    html += `<div class="list-section" id="resultsListSection">`;
    if (listItems.length) {
      listItems.forEach((pod, i) => {
        html += renderListItem(pod, i + 5);
      });
    }
    html += `</div>`;

    area.innerHTML = html;

    if (loadMore) {
      loadMore.style.display = results.length >= 20 ? 'flex' : 'none';
    }
  } else {
    // Append mode (for offset pagination)
    if (!results.length) {
      if (loadMore) loadMore.style.display = 'none';
      return;
    }

    const listSection = document.getElementById('resultsListSection');
    if (listSection) {
      let html = '';
      const existingCount = listSection.querySelectorAll('.list-item').length + 5;
      results.forEach((pod, i) => {
        html += renderListItem(pod, existingCount + i);
      });
      listSection.insertAdjacentHTML('beforeend', html);
    }

    if (loadMore) {
      loadMore.style.display = results.length >= 20 ? 'flex' : 'none';
    }
  }
}

/**
 * Builds the HTML string for the featured (hero) card.
 * @param {Object} pod
 * @param {number} colorIndex
 * @returns {string}
 */
function renderFeaturedCard(pod, colorIndex) {
  const c       = getArtColor(colorIndex);
  const name    = escapeHtml(pod.collectionName || 'Untitled');
  const author  = escapeHtml(pod.artistName || '');
  const init    = getInitials(pod.collectionName);
  const artwork = pod.artworkUrl100 || pod.artworkUrl600 || '';
  const artHtml = artwork
    ? `<img class="art-img" src="${escapeHtml(artwork)}" alt="${name}" loading="lazy" onerror="this.style.opacity='0'" onload="this.style.opacity='1'" />`
    : '';
  const rating = getDeterministicRating(pod.collectionId);
  const starsHtml = getStarsHtml(rating);

  return `
    <div class="featured-card" role="button" tabindex="0"
         aria-label="Open ${name}"
         onclick="App.openDetail(${pod.collectionId}, ${colorIndex})"
         onkeydown="if(event.key==='Enter')App.openDetail(${pod.collectionId},${colorIndex})">
      <div class="featured-art" style="background:${c.bg};color:${c.fg}" aria-hidden="true">
        ${init}
        ${artHtml}
      </div>
      <div class="featured-body">
        <p class="featured-tag">Featured</p>
        <p class="featured-title" title="${name}">${name}</p>
        <p class="featured-sub">${author}</p>
        <div class="pod-rating-container">${starsHtml} <span class="rating-value">${rating.toFixed(1)}</span></div>
      </div>
      <button class="featured-play" aria-label="Preview ${name}"
              onclick="event.stopPropagation();App.previewPod(${pod.collectionId})">
        ${ICON.playWhite}
      </button>
    </div>
  `;
}

/**
 * Builds the HTML string for a grid card.
 * @param {Object} pod
 * @param {number} colorIndex
 * @returns {string}
 */
function renderGridCard(pod, colorIndex) {
  const c       = getArtColor(colorIndex);
  const name    = escapeHtml(pod.collectionName || 'Untitled');
  const author  = escapeHtml(pod.artistName || '');
  const init    = getInitials(pod.collectionName);
  const artwork = pod.artworkUrl100 || pod.artworkUrl600 || '';
  const artHtml = artwork
    ? `<img class="art-img" src="${escapeHtml(artwork)}" alt="${name}" loading="lazy" onerror="this.style.opacity='0'" onload="this.style.opacity='1'" />`
    : '';
  const rating = getDeterministicRating(pod.collectionId);
  const starsHtml = getStarsHtml(rating);

  return `
    <div class="pod-card" role="button" tabindex="0"
         aria-label="Open ${name}"
         onclick="App.openDetail(${pod.collectionId}, ${colorIndex})"
         onkeydown="if(event.key==='Enter')App.openDetail(${pod.collectionId},${colorIndex})">
      <div class="pod-art" style="background:${c.bg};color:${c.fg}" aria-hidden="true">
        ${init}
        ${artHtml}
      </div>
      <p class="pod-title" title="${name}">${name}</p>
      <p class="pod-sub">${author}</p>
      <div class="pod-rating-container">${starsHtml} <span class="rating-value">${rating.toFixed(1)}</span></div>
    </div>
  `;
}

/**
 * Builds the HTML string for a list row item.
 * @param {Object} pod
 * @param {number} colorIndex
 * @returns {string}
 */
function renderListItem(pod, colorIndex) {
  const c       = getArtColor(colorIndex);
  const name    = escapeHtml(pod.collectionName || 'Untitled');
  const author  = escapeHtml(pod.artistName || '');
  const init    = getInitials(pod.collectionName);
  const count   = pod.trackCount ? `${formatNumber(pod.trackCount)} episodes` : '';
  const artwork = pod.artworkUrl100 || pod.artworkUrl600 || '';
  const artHtml = artwork
    ? `<img class="art-img" src="${escapeHtml(artwork)}" alt="${name}" loading="lazy" onerror="this.style.opacity='0'" onload="this.style.opacity='1'" />`
    : '';
  const rating = getDeterministicRating(pod.collectionId);
  const starsHtml = getStarsHtml(rating);

  return `
    <div class="list-item" role="button" tabindex="0"
         aria-label="Open ${name}"
         onclick="App.openDetail(${pod.collectionId}, ${colorIndex})"
         onkeydown="if(event.key==='Enter')App.openDetail(${pod.collectionId},${colorIndex})">
      <div class="list-art" style="background:${c.bg};color:${c.fg}" aria-hidden="true">
        ${init}
        ${artHtml}
      </div>
      <div class="list-body">
        <p class="list-title" title="${name}">${name}</p>
        <p class="list-sub">${author}</p>
        <div class="list-meta-row">
          <div class="pod-rating-container">${starsHtml} <span class="rating-value">${rating.toFixed(1)}</span></div>
          ${count ? `<p class="list-meta">${ICON.headphones} ${count}</p>` : ''}
        </div>
      </div>
      <span class="list-chevron">${ICON.chevronRight}</span>
    </div>
  `;
}

// ─── Detail View ─────────────────────────────────────────────────────────────

/**
 * Populates the detail view header with podcast metadata.
 * @param {Object} pod
 * @param {number} colorIndex
 */
function renderDetailHeader(pod, colorIndex) {
  const c = getArtColor(colorIndex);

  const artEl    = document.getElementById('dArt');
  const titleEl  = document.getElementById('dTitle');
  const authorEl = document.getElementById('dAuthor');
  const descEl   = document.getElementById('dDesc');
  const ratingEl = document.getElementById('dRating');

  if (artEl) {
    artEl.style.background = c.bg;
    artEl.style.color      = c.fg;
    const name = pod.collectionName || 'Untitled';
    const init = getInitials(name);
    const artwork = pod.artworkUrl600 || pod.artworkUrl100 || '';
    const artHtml = artwork
      ? `<img class="art-img" src="${escapeHtml(artwork)}" alt="${escapeHtml(name)}" loading="lazy" onerror="this.style.opacity='0'" onload="this.style.opacity='1'" />`
      : '';
    artEl.innerHTML = `${init}${artHtml}`;
  }
  if (titleEl)  titleEl.textContent  = pod.collectionName  || 'Untitled';
  if (authorEl) authorEl.textContent = pod.artistName      || '';
  if (descEl)   descEl.textContent   = pod.description
    || pod.longDescription
    || `A podcast about ${pod.primaryGenreName || 'various topics'}.`;

  if (ratingEl) {
    const rating = getDeterministicRating(pod.collectionId);
    const starsHtml = getStarsHtml(rating);
    ratingEl.innerHTML = `${starsHtml} <span class="rating-value">${rating.toFixed(1)}</span>`;
  }
}

/**
 * Renders the episodes list into #episodesArea.
 * @param {Array} episodes  - Array of { title, desc, date, duration, audioUrl }
 */
function renderEpisodes(episodes) {
  const area = document.getElementById('episodesArea');
  if (!area) return;

  if (!episodes || !episodes.length) {
    area.innerHTML = `<div class="state-box">${ICON.moodEmpty}<p>No episodes available.</p></div>`;
    return;
  }

  area.innerHTML = episodes.map((ep, i) => {
    const title = ep.title || `Episode ${i + 1}`;
    const desc = ep.desc || 'No description available.';
    const audioUrl = ep.audioUrl || ''; // Will check at runtime

    return `
      <div class="ep-item">
        <span class="ep-num" aria-hidden="true">${i + 1}</span>
        <div class="ep-info">
          <p class="ep-title">${escapeHtml(title)}</p>
          <p class="ep-desc">${escapeHtml(desc)}</p>
          <div class="ep-meta">
            ${ep.date     ? `<span>${escapeHtml(ep.date)}</span>` : ''}
            ${ep.date && ep.duration ? `<span class="ep-meta-dot" aria-hidden="true"></span>` : ''}
            ${ep.duration ? `<span>${escapeHtml(ep.duration)}</span>` : ''}
          </div>
        </div>
        <button class="ep-play" 
                data-audio="${escapeHtml(audioUrl)}"
                data-title="${escapeHtml(title)}"
                onclick="App.playEpisode(this)"
                aria-label="Play episode: ${escapeHtml(title)}">
          ${ICON.play}
        </button>
      </div>
    `;
  }).join('');
}

// ─── Saved View ───────────────────────────────────────────────────────────────

/**
 * Renders the saved podcasts list into #savedArea.
 * @param {Array} saved  - Array of saved podcast objects
 */
function renderSaved(saved) {
  const area = document.getElementById('savedArea');
  if (!area) return;

  if (!saved || !saved.length) {
    area.innerHTML = `
      <div class="saved-empty">
        ${ICON.bookmark}
        <p>No saved podcasts yet.<br>Tap "Save" on any podcast to keep it here.</p>
      </div>
    `;
    return;
  }

  area.innerHTML = `<div class="list-section">` +
    saved.map((pod, i) => renderListItem(pod, i)).join('') +
    `</div>`;
}

// ─── Save Button State ────────────────────────────────────────────────────────

/**
 * Updates the save button appearance based on whether the current
 * podcast is already in the saved list.
 * @param {boolean} isSaved
 */
function updateSaveButton(isSaved) {
  const btn = document.getElementById('saveBtn');
  if (!btn) return;

  if (isSaved) {
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      Saved
    `;
    btn.classList.add('saved');
  } else {
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      Save
    `;
    btn.classList.remove('saved');
  }
}
