
(() => {
  const API = '/api/saved-books'; // optional backend
  const STORAGE_KEY = 'savedBooks';
  const PER_PAGE = 10;

  // DOM refs
  const listEl = document.getElementById('saved-books-list');
  const emptyEl = document.getElementById('empty-message');
  const loadingEl = document.getElementById('loading');
  const pagerNav = document.getElementById('saved-pager');
  const pagerList = document.getElementById('pager-list');
  const pagerCount = document.getElementById('pager-count');
  const liveRegion = document.getElementById('live-region');

  // State
  let books = [];
  let currentPage = 1;
  let totalPages = 1;

  // Helpers
  function announce(msg) {
    if (!liveRegion) return;
    liveRegion.textContent = msg;
    // Clear after a short delay so repeated messages re-announce
    setTimeout(() => { liveRegion.textContent = ''; }, 700);
  }

  function safeText(s) {
    if (s === null || s === undefined) return '';
    return String(s);
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(books)); } catch (e) { /* ignore */ }
  }

  // Fetch saved books: try API, fallback to localStorage
  async function fetchSaved() {
    showLoading(true);
    // Try API
    try {
      const res = await fetch(API, { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          books = data;
          persist();
          setupPagination();
          renderPage(getPageFromUrl() || 1);
          showLoading(false);
          return;
        }
      }
    } catch (e) {
      // network error or endpoint missing -> fallback
    }

    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      books = raw ? JSON.parse(raw) : [];
    } catch (e) {
      books = [];
    }

    setupPagination();
    renderPage(getPageFromUrl() || 1);
    showLoading(false);
  }

  function showLoading(show) {
    if (!loadingEl) return;
    loadingEl.hidden = !show;
    if (show) {
      listEl.hidden = true;
      emptyEl.hidden = true;
      pagerNav.hidden = true;
    } else {
      listEl.hidden = false;
    }
  }

  // Build a single result item using your components
  function buildItem(book) {
    const id = safeText(book.id);
    const title = safeText(book.title) || 'Untitled';
    const author = safeText(book.author) || 'Unknown';
    const year = safeText(book.year || '');
    const genre = safeText(book.genre || '');
    const coverUrl = safeText(book.coverUrl || '');

    // Use .result__body, .cover, .result__text, .result__actions
    const li = document.createElement('li');
    li.className = 'result';
    li.dataset.id = id;

    li.innerHTML = `
      <div class="result__body">
        <div class="cover" aria-hidden="true">
          ${coverUrl ? `<img src="${coverUrl}" alt="Cover of ${escapeHtml(title)}">` : `<div class="cover__call" aria-hidden="true">No cover</div>`}
        </div>

        <div class="result__text">
          <h3 class="result__title">${escapeHtml(title)}</h3>
          <div class="result__meta">
            <span class="result__author">${escapeHtml(author)}</span>
            ${genre || year ? `<span class="result__meta-extra">${escapeHtml(genre)}${genre && year ? ' · ' : ''}${escapeHtml(year)}</span>` : ''}
          </div>
          <div class="result__actions">
            <a href="/catalogue/${encodeURIComponent(id)}" class="btn btn--secondary">View</a>
            <button class="btn btn--danger remove-btn" data-id="${escapeHtml(id)}" type="button">Remove</button>
          </div>
        </div>
      </div>
    `;
    return li;
  }

  // Escape for insertion into attribute/text
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Pagination helpers
  function setupPagination() {
    totalPages = Math.max(1, Math.ceil(books.length / PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;
  }

  function renderPage(page = 1) {
    if (!Array.isArray(books) || books.length === 0) {
      listEl.innerHTML = '';
      emptyEl.hidden = false;
      pagerNav.hidden = true;
      announce('No saved titles');
      return;
    }

    emptyEl.hidden = true;
    currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * PER_PAGE;
    const pageItems = books.slice(start, start + PER_PAGE);

    // Clear and append
    listEl.innerHTML = '';
    const frag = document.createDocumentFragment();
    pageItems.forEach(b => frag.appendChild(buildItem(b)));
    listEl.appendChild(frag);

    // Build pager
    buildPager();
    pagerNav.hidden = false;

    // Update URL (pushState) so each page has its own URL
    const url = new URL(window.location);
    url.searchParams.set('page', String(currentPage));
    window.history.replaceState({}, '', url);

    announce(`Showing page ${currentPage} of ${totalPages}`);
  }

  function buildPager() {
    pagerList.innerHTML = '';
    const maxShown = 7; // keep pager compact
    const pages = [];

    // Simple pager algorithm: always show first, last, current +/- 2
    const left = Math.max(1, currentPage - 2);
    const right = Math.min(totalPages, currentPage + 2);

    if (left > 1) pages.push(1);
    if (left > 2) pages.push('gap-left');

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < totalPages - 1) pages.push('gap-right');
    if (right < totalPages) pages.push(totalPages);

    pages.forEach(p => {
      const li = document.createElement('li');
      if (p === 'gap-left' || p === 'gap-right') {
        li.className = 'pager__gap';
        li.textContent = '…';
      } else {
        const a = document.createElement('a');
        a.className = 'pager__link';
        a.href = `?page=${p}`;
        a.textContent = String(p);
        if (p === currentPage) a.setAttribute('aria-current', 'page');
        li.appendChild(a);
      }
      pagerList.appendChild(li);
    });

    pagerCount.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  // Remove bookmark
  async function removeById(id) {
    const idx = books.findIndex(b => String(b.id) === String(id));
    if (idx === -1) return;
    const removed = books.splice(idx, 1)[0];
    persist();
    setupPagination();
    if (currentPage > totalPages) currentPage = totalPages;
    renderPage(currentPage);

    // Optionally call backend
    try {
      await fetch(`${API}/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'same-origin' });
    } catch (e) {
      // ignore network errors; UI already updated
    }

    announce(`Removed ${removed.title || 'book'} from saved titles`);
  }

  // Event delegation
  function onListClick(e) {
    const btn = e.target.closest('.remove-btn');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (!id) return;

    const titleEl = btn.closest('.result')?.querySelector('.result__title');
    const title = titleEl ? titleEl.textContent.trim() : 'this book';
    if (!confirm(`Remove "${title}" from your saved titles?`)) return;

    removeById(id);
  }

  function onPagerClick(e) {
    const a = e.target.closest('.pager__link');
    if (!a) return;
    e.preventDefault();
    const url = new URL(a.href, window.location.origin);
    const p = Number(url.searchParams.get('page')) || 1;
    renderPage(p);
  }

  function getPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const p = Number(params.get('page'));
    return Number.isInteger(p) && p > 0 ? p : null;
  }

  // Public API: add a saved book (useful for other parts of the app)
  function addSavedBook(book) {
    if (!book || book.id == null) return;
    if (books.some(b => String(b.id) === String(book.id))) return;
    books.unshift(book);
    persist();
    setupPagination();
    renderPage(1);
    announce(`Saved ${book.title || 'book'}`);
  }

  // Init
  function init() {
    if (!listEl) return;
    listEl.addEventListener('click', onListClick);
    pagerList.addEventListener('click', onPagerClick);
    fetchSaved();
  }

  // Expose
  window.SavedTitles = { init, addSavedBook };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();