/**
 * app.js
 * Main application controller.
 * Manages state, wires up event listeners, and coordinates
 * between the API module (api.js) and the render module (render.js).
 *
 * Exposed as a global `App` object so inline onclick handlers in
 * rendered HTML can call back into the controller.
 */

(function () {
  'use strict';

  // ─── App State ──────────────────────────────────────────────────────────────

  const state = {
    currentTopic:     '',              // Active topic pill query
    currentPod:       null,           // Podcast object currently open in detail view
    currentPodIndex:  0,              // Color index for the open podcast
    savedPods:        [],             // Array of saved podcast objects
    activeTab:        'browse',       // 'browse' | 'trending' | 'saved'
    lastResults:      [],             // Last search result array (for back navigation)
    lastTerm:         '',             // Last search term used
    searchOffset:     0,              // Track pagination offset
    theme:            'light',        // 'light' | 'dark'
  };

  // ─── Global Audio Player State ──────────────────────────────────────────────

  let currentAudio = null;
  let debounceTimer = null;

  // ─── DOM References ──────────────────────────────────────────────────────────

  const els = {
    searchInput:     () => document.getElementById('searchInput'),
    searchBtn:       () => document.getElementById('searchBtn'),
    pillRow:         () => document.getElementById('pillRow'),
    browseView:      () => document.getElementById('browseView'),
    detailView:      () => document.getElementById('detailView'),
    savedView:       () => document.getElementById('savedView'),
    backBtn:         () => document.getElementById('backBtn'),
    saveBtn:         () => document.getElementById('saveBtn'),
    subscribeBtn:    () => document.getElementById('dSubscribe'),
    shareBtn:        () => document.getElementById('dShare'),
    tabs:            () => document.querySelectorAll('.tab'),
    
    // Sticky bottom player elements
    audioPlayer:     () => document.getElementById('audioPlayer'),
    playerTitle:     () => document.getElementById('playerTitle'),
    playerSubtitle:  () => document.getElementById('playerSubtitle'),
    playerPlayPause: () => document.getElementById('playerPlayPause'),
    playerProgress:  () => document.getElementById('playerProgress'),
    playerProgressBar: () => document.querySelector('.player-progress-bar'),
    playIcon:        () => document.getElementById('playIcon'),
    pauseIcon:       () => document.getElementById('pauseIcon'),
    playerClose:     () => document.getElementById('playerClose'),
  };

  // ─── View Switching ───────────────────────────────────────────────────────────

  /**
   * Shows one view and hides the others.
   * @param {'browse'|'detail'|'saved'|'trending'} viewName
   */
  function showView(viewName) {
    const views = {
      browse:   els.browseView(),
      detail:   els.detailView(),
      saved:    els.savedView(),
      trending: els.browseView(),   // Trending reuses browse layout
    };
    Object.entries(views).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle('active', key === viewName);
    });
  }

  // ─── Tab Navigation ───────────────────────────────────────────────────────────

  function activateTab(tabEl) {
    els.tabs().forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tabEl.classList.add('active');
    tabEl.setAttribute('aria-selected', 'true');

    const tab = tabEl.dataset.tab;
    state.activeTab = tab;

    if (tab === 'browse' || tab === 'trending') {
      showView('browse');
      if (tab === 'trending') {
        loadTrending();
      }
    } else if (tab === 'saved') {
      showView('saved');
      renderSaved(state.savedPods);
    }
  }

  function loadTrending() {
    const trendingTerms = ['true crime', 'comedy', 'business', 'self improvement'];
    const randomTerm    = trendingTerms[Math.floor(Math.random() * trendingTerms.length)];
    runSearch(randomTerm, false);   // false = don't update the pill UI
  }

  // ─── Search & Pagination ───────────────────────────────────────────────────────

  /**
   * Runs a search, shows loading state, then renders results.
   * Supports pagination appending.
   * @param {string}  term           - Search query
   * @param {boolean} append         - Whether to append results (pagination)
   */
  async function runSearch(term, append = false) {
    if (!term || !term.trim()) return;

    state.lastTerm = term;

    if (!append) {
      state.searchOffset = 0;

      // Update the results label immediately so the user sees what's happening
      const labelEl = document.getElementById('resultsLabel');
      if (labelEl) labelEl.textContent = `Searching for "${term}"…`;

      showLoading('resultsArea', `Searching for "${term}"…`);
      document.getElementById('resultsCount').textContent = '';
      
      const loadMore = document.getElementById('loadMoreContainer');
      if (loadMore) loadMore.style.display = 'none';
    } else {
      const loadMoreBtn = document.getElementById('loadMoreBtn');
      if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'Loading...';
      }
    }

    try {
      const results = await searchPodcasts(term, 20, state.searchOffset);
      
      if (!append) {
        state.lastResults = results;
        renderResults(results, term, false);
      } else {
        state.lastResults = state.lastResults.concat(results);
        renderResults(results, term, true);
      }
    } catch (err) {
      console.error('Search failed:', err);
      if (!append) {
        const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
        const msg = isTimeout
          ? 'The request timed out. The iTunes API may be slow — please try again.'
          : 'Could not reach the iTunes API. Check your internet connection and try again.';
        showError('resultsArea', msg);
        
        const labelEl = document.getElementById('resultsLabel');
        if (labelEl) labelEl.textContent = 'Search failed';
        document.getElementById('resultsCount').textContent = '';
      } else {
        alert('Could not load more results. Please check your connection.');
      }
    } finally {
      const loadMoreBtn = document.getElementById('loadMoreBtn');
      if (loadMoreBtn) {
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Load More';
      }
    }
  }

  /** Fetch the next page of results */
  function loadMore() {
    state.searchOffset += 20;
    runSearch(state.lastTerm, true);
  }

  // ─── Podcast Detail ───────────────────────────────────────────────────────────

  /**
   * Opens the detail view for a given podcast.
   * Called by onclick handlers in rendered HTML.
   *
   * @param {number|string} collectionId - iTunes collection ID
   * @param {number}        index        - Color palette index
   */
  async function openDetail(collectionId, index) {
    let pod = state.lastResults.find(p => p.collectionId == collectionId) ||
              state.savedPods.find(p => p.collectionId == collectionId);

    if (!pod) {
      showView('detail');
      showLoading('episodesArea', 'Loading podcast details…');
      try {
        pod = await lookupPodcast(collectionId);
      } catch (err) {
        console.error('Lookup failed:', err);
      }
    }

    if (!pod) {
      showError('episodesArea', 'Podcast details could not be loaded.');
      return;
    }

    state.currentPod      = pod;
    state.currentPodIndex = index;

    renderDetailHeader(pod, index);
    updateSaveButton(isPodSaved(pod));

    // Wire subscribe button
    const subscribeBtn = els.subscribeBtn();
    if (subscribeBtn) {
      const url = pod.collectionViewUrl || pod.trackViewUrl || '';
      subscribeBtn.onclick = () => { if (url) window.open(url, '_blank'); };
      subscribeBtn.disabled = !url;
    }

    // Wire share button
    const shareBtn = els.shareBtn();
    if (shareBtn) {
      shareBtn.onclick = () => sharePodcast(pod);
    }

    showView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load episodes
    showLoading('episodesArea', 'Loading episodes…');
    const liveEpisodes = await fetchEpisodes(pod.feedUrl);
    const episodes     = liveEpisodes.length ? liveEpisodes : MOCK_EPISODES;
    renderEpisodes(episodes);
  }

  /**
   * Navigates back from the detail view to the browse view.
   */
  function goBack() {
    showView('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── Preview ─────────────────────────────────────────────────────────────────

  /**
   * Attempts to play the iTunes preview audio for a podcast in our custom player.
   * @param {number|string} collectionId
   */
  function previewPod(collectionId) {
    const pod = state.lastResults.find(p => p.collectionId == collectionId) ||
                state.savedPods.find(p => p.collectionId == collectionId);

    if (pod && pod.previewUrl) {
      playAudioStream(pod.previewUrl, pod.collectionName, 'Preview Clip');
    } else if (pod) {
      const url = pod.collectionViewUrl || pod.trackViewUrl;
      if (url) window.open(url, '_blank');
    }
  }

  // ─── Custom Audio Player Control ──────────────────────────────────────────────

  /**
   * Plays a specific audio stream url inside the sticky audio player.
   */
  function playAudioStream(url, title, subtitle) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      currentAudio = null;
    }

    currentAudio = new Audio(url);

    const player  = els.audioPlayer();
    const titleEl = els.playerTitle();
    const subEl   = els.playerSubtitle();

    if (titleEl) titleEl.textContent = title;
    if (subEl)   subEl.textContent   = subtitle;

    if (player) {
      player.classList.add('active');
    }

    currentAudio.addEventListener('play', updatePlayerUI);
    currentAudio.addEventListener('pause', updatePlayerUI);
    currentAudio.addEventListener('timeupdate', updateProgress);
    currentAudio.addEventListener('ended', () => {
      if (player) player.classList.remove('active');
    });

    currentAudio.play().catch(e => {
      console.warn('Playback blocked by browser autoplay policy, showing play controls.', e);
      updatePlayerUI();
    });
  }

  function playEpisode(btnEl) {
    const audioUrl = btnEl.dataset.audio;
    const title = btnEl.dataset.title;
    const podcastName = state.currentPod ? state.currentPod.collectionName : 'Wavecast';

    if (!audioUrl) {
      // Fallback to a testing track for demo/mock episodes
      const fallbackUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      console.info('No live audio URL available for this episode, playing fallback demo track.');
      playAudioStream(fallbackUrl, title + ' (Demo)', podcastName);
      return;
    }

    playAudioStream(audioUrl, title, podcastName);
  }

  function updatePlayerUI() {
    const playIcon  = els.playIcon();
    const pauseIcon = els.pauseIcon();

    if (!currentAudio) return;

    if (currentAudio.paused) {
      if (playIcon)  playIcon.style.display  = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
    } else {
      if (playIcon)  playIcon.style.display  = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
    }
  }

  function updateProgress() {
    const progress = els.playerProgress();
    if (!currentAudio || !progress || isNaN(currentAudio.duration)) return;

    const pct = (currentAudio.currentTime / currentAudio.duration) * 100;
    progress.style.width = `${pct}%`;
  }

  function togglePlayerPlayPause() {
    if (!currentAudio) return;
    if (currentAudio.paused) {
      currentAudio.play().catch(() => {});
    } else {
      currentAudio.pause();
    }
  }

  function closePlayer() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      currentAudio = null;
    }
    const player = els.audioPlayer();
    if (player) {
      player.classList.remove('active');
    }
  }

  function handleProgressClick(e) {
    if (!currentAudio || isNaN(currentAudio.duration)) return;
    const bar = els.playerProgressBar();
    if (!bar) return;

    const rect   = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct    = clickX / rect.width;
    currentAudio.currentTime = pct * currentAudio.duration;
  }

  // ─── Theme Management ─────────────────────────────────────────────────────────

  function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    state.theme = isDark ? 'dark' : 'light';
    localStorage.setItem('wavecast_theme', state.theme);
  }

  // ─── Save / Unsave ────────────────────────────────────────────────────────────

  function isPodSaved(pod) {
    return state.savedPods.some(p => p.collectionId === pod.collectionId);
  }

  function toggleSave() {
    if (!state.currentPod) return;
    const pod = state.currentPod;

    if (isPodSaved(pod)) {
      state.savedPods = state.savedPods.filter(p => p.collectionId !== pod.collectionId);
    } else {
      state.savedPods.push(pod);
    }

    updateSaveButton(isPodSaved(pod));

    // Save to localStorage
    localStorage.setItem('wavecast_saved', JSON.stringify(state.savedPods));
  }

  // ─── Share ────────────────────────────────────────────────────────────────────

  function sharePodcast(pod) {
    const url  = pod.collectionViewUrl || pod.trackViewUrl || window.location.href;
    const name = pod.collectionName || 'this podcast';

    if (navigator.share) {
      navigator.share({ title: name, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert(`Link copied to clipboard:\n${url}`);
      }).catch(() => {
        alert(`Share this link:\n${url}`);
      });
    }
  }

  // ─── Event Listeners ─────────────────────────────────────────────────────────

  function bindEvents() {
    // Search button click
    const searchBtn = els.searchBtn();
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const term = els.searchInput()?.value.trim();
        if (term) runSearch(term, false);
      });
    }

    // Debounced search input + immediate Enter search
    const searchInput = els.searchInput();
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim();
        clearTimeout(debounceTimer);
        
        // Search automatically after 450ms when typing stops (min 3 chars)
        if (term.length >= 3) {
          debounceTimer = setTimeout(() => {
            if (term === state.lastTerm) return;
            runSearch(term, false);
          }, 450);
        }
      });

      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          clearTimeout(debounceTimer);
          const term = searchInput.value.trim();
          if (term) runSearch(term, false);
        }
      });
    }

    // Topic pills
    const pillRow = els.pillRow();
    if (pillRow) {
      pillRow.addEventListener('click', e => {
        const pill = e.target.closest('.pill');
        if (!pill) return;

        document.querySelectorAll('.pill').forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');

        // Smoothly scroll the active pill into view on mobile
        pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        const query = pill.dataset.query;
        state.currentTopic = query;
        runSearch(query, false);
      });
    }

    // Tab switching
    els.tabs().forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab));
    });

    // Back button
    const backBtn = els.backBtn();
    if (backBtn) {
      backBtn.addEventListener('click', goBack);
    }

    // Save button
    const saveBtn = els.saveBtn();
    if (saveBtn) {
      saveBtn.addEventListener('click', toggleSave);
    }

    // Load More button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', loadMore);
    }

    // Theme toggle button
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Audio player event listeners
    const playPauseBtn = els.playerPlayPause();
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', togglePlayerPlayPause);
    }

    const closeBtn = els.playerClose();
    if (closeBtn) {
      closeBtn.addEventListener('click', closePlayer);
    }

    const progressBar = els.playerProgressBar();
    if (progressBar) {
      progressBar.addEventListener('click', handleProgressClick);
    }
  }

  // ─── Init ────────────────────────────────────────────────────────────────────

  function init() {
    // Theme initialization
    const savedTheme = localStorage.getItem('wavecast_theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      state.theme = 'dark';
    } else {
      state.theme = 'light';
    }

    // Load from localStorage
    const savedData = localStorage.getItem('wavecast_saved');
    if (savedData) {
      try {
        state.savedPods = JSON.parse(savedData);
      } catch (e) {
        state.savedPods = [];
      }
    }

    renderTopics();
    bindEvents();
    // Show a welcome hero instead of auto-searching
    showWelcome();
  }

  document.addEventListener('DOMContentLoaded', init);

  // ─── Public API (for inline onclick handlers in rendered HTML) ───────────────

  window.App = {
    openDetail,
    goBack,
    previewPod,
    toggleSave,
    playEpisode,
  };

})();
