(() => {
  const CARD_SELECTOR = '[data-component-type="s-search-result"][data-asin], .s-search-result[data-asin]';
  const DEFAULTS = {
    sponsoredMode: 'show',
    resultCount: 0,
    priceOrder: 'original'
  };
  const VALID_COUNTS = [0, 10, 100, 200, 300];
  const MAX_PAGE_REQUESTS = 30;

  if (!/^\/s(?:\/|$)/.test(location.pathname) || document.querySelector('#acr-panel-host')) {
    return;
  }

  const state = {
    settings: { ...DEFAULTS },
    records: new Map(),
    byAsin: new Map(),
    sequence: 0,
    resultContainer: null,
    nextPage: (Number(new URL(location.href).searchParams.get('page')) || 1) + 1,
    loading: false,
    abortController: null,
    loadId: 0,
    observer: null,
    scanScheduled: false
  };

  const panel = createPanel();
  const sponsoredSection = createSponsoredSection();

  function createPanel() {
    const host = document.createElement('div');
    host.id = 'acr-panel-host';
    const shadow = host.attachShadow({ mode: 'open' });
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = chrome.runtime.getURL('panel.css');

    const wrapper = document.createElement('section');
    wrapper.className = 'panel';
    wrapper.setAttribute('aria-label', 'JANGA controls');
    wrapper.innerHTML = `
      <div class="header">
        <span class="title">JANGA</span>
        <button class="collapse" type="button" aria-label="Collapse controls" aria-expanded="true">−</button>
      </div>
      <div class="body">
        <label for="acr-sponsored-mode">Sponsored products</label>
        <select id="acr-sponsored-mode">
          <option value="show">Show in original positions</option>
          <option value="separate">Separate below organic results</option>
          <option value="hide">Hide on every search</option>
        </select>
        <label for="acr-result-count">Organic products</label>
        <select id="acr-result-count">
          <option value="0">Amazon's default</option>
          <option value="10">10</option>
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="300">300</option>
        </select>
        <label for="acr-price-order">Price order for loaded products</label>
        <select id="acr-price-order">
          <option value="original">Amazon's order</option>
          <option value="asc">Displayed price: low to high</option>
          <option value="desc">Displayed price: high to low</option>
        </select>
        <div class="actions">
          <button class="apply" type="button">Apply</button>
          <button class="stop" type="button" hidden>Stop loading</button>
        </div>
        <p class="status" role="status" aria-live="polite">Scanning search results…</p>
        <p class="note">Price sorting covers loaded products only. Shipping, coupons, and unselected variations are not included.</p>
      </div>
    `;

    shadow.append(stylesheet, wrapper);
    document.documentElement.append(host);

    const body = wrapper.querySelector('.body');
    const collapse = wrapper.querySelector('.collapse');
    collapse.addEventListener('click', () => {
      const collapsed = body.classList.toggle('collapsed');
      collapse.textContent = collapsed ? '+' : '−';
      collapse.setAttribute('aria-expanded', String(!collapsed));
      collapse.setAttribute('aria-label', collapsed ? 'Expand controls' : 'Collapse controls');
    });

    wrapper.querySelector('.apply').addEventListener('click', async () => {
      const settings = normalizeSettings({
        sponsoredMode: wrapper.querySelector('#acr-sponsored-mode').value,
        resultCount: Number(wrapper.querySelector('#acr-result-count').value),
        priceOrder: wrapper.querySelector('#acr-price-order').value
      });

      try {
        await chrome.storage.sync.set(settings);
      } catch (error) {
        setStatus(`Settings could not be saved: ${error.message}`, true);
      }

      await applySettings(settings, true);
    });

    wrapper.querySelector('.stop').addEventListener('click', () => {
      state.abortController?.abort();
    });

    return { wrapper };
  }

  function createSponsoredSection() {
    const section = document.createElement('details');
    section.id = 'acr-sponsored-section';
    section.classList.add('acr-hidden');

    const summary = document.createElement('summary');
    summary.textContent = 'Sponsored products';
    const list = document.createElement('div');
    list.id = 'acr-sponsored-list';
    section.append(summary, list);

    return { section, summary, list };
  }

  function normalizeSettings(settings) {
    return {
      sponsoredMode: ['show', 'separate', 'hide'].includes(settings.sponsoredMode)
        ? settings.sponsoredMode
        : DEFAULTS.sponsoredMode,
      resultCount: VALID_COUNTS.includes(Number(settings.resultCount))
        ? Number(settings.resultCount)
        : DEFAULTS.resultCount,
      priceOrder: ['original', 'asc', 'desc'].includes(settings.priceOrder)
        ? settings.priceOrder
        : DEFAULTS.priceOrder
    };
  }

  function setStatus(message, isError = false) {
    const status = panel.wrapper.querySelector('.status');
    status.textContent = message;
    status.style.color = isError ? '#b12704' : '';
  }

  function updatePanel(settings) {
    panel.wrapper.querySelector('#acr-sponsored-mode').value = settings.sponsoredMode;
    panel.wrapper.querySelector('#acr-result-count').value = String(settings.resultCount);
    panel.wrapper.querySelector('#acr-price-order').value = settings.priceOrder;
  }

  function isSponsored(card) {
    if (card.querySelector('[data-component-type="sp-sponsored-result"], .puis-sponsored-label-text, [data-cy="sponsored-label"], [aria-label="Sponsored"]')) {
      return true;
    }

    return Array.from(card.querySelectorAll('.a-color-secondary, .a-size-mini, .a-size-small'))
      .some((element) => element.textContent.trim().replace(/:$/, '').toLowerCase() === 'sponsored');
  }

  function registerCard(card) {
    if (state.records.has(card)) {
      return state.records.get(card);
    }

    const asin = card.dataset.asin?.trim();
    if (!asin) {
      return null;
    }

    if (state.byAsin.has(asin)) {
      card.classList.add('acr-hidden');
      return null;
    }

    if (!state.resultContainer) {
      state.resultContainer = card.parentElement;
      state.resultContainer.after(sponsoredSection.section);
    }

    const anchor = document.createComment(`acr-position:${asin}`);
    card.before(anchor);
    const record = {
      card,
      anchor,
      asin,
      sponsored: isSponsored(card),
      sequence: state.sequence++
    };

    state.records.set(card, record);
    state.byAsin.set(asin, record);
    return record;
  }

  function scanCards(root = document) {
    const cards = [];
    if (root instanceof Element && root.matches(CARD_SELECTOR)) {
      cards.push(root);
    }
    if (root.querySelectorAll) {
      cards.push(...root.querySelectorAll(CARD_SELECTOR));
    }
    cards.forEach(registerCard);
  }

  function organicRecords() {
    return Array.from(state.records.values()).filter((record) => !record.sponsored);
  }

  function sponsoredRecords() {
    return Array.from(state.records.values()).filter((record) => record.sponsored);
  }

  function displayedPrice(card) {
    const price = card.querySelector('.a-price:not(.a-text-price) .a-offscreen, [data-a-color="price"] .a-offscreen');
    return price ? parsePrice(price.textContent) : null;
  }

  function parsePrice(text) {
    let value = text.replace(/[^\d.,-]/g, '');
    if (!value) {
      return null;
    }

    const comma = value.lastIndexOf(',');
    const dot = value.lastIndexOf('.');
    if (comma > dot) {
      value = dot === -1 && /,\d{3}$/.test(value)
        ? value.replace(/,/g, '')
        : value.replace(/\./g, '').replace(',', '.');
    } else {
      value = value.replace(/,/g, '');
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function orderedOrganics() {
    const records = organicRecords();
    if (state.settings.priceOrder === 'original') {
      return records.sort((a, b) => a.sequence - b.sequence);
    }

    const direction = state.settings.priceOrder === 'asc' ? 1 : -1;
    return records.sort((a, b) => {
      const aPrice = displayedPrice(a.card);
      const bPrice = displayedPrice(b.card);
      if (aPrice === null && bPrice === null) {
        return a.sequence - b.sequence;
      }
      if (aPrice === null) {
        return 1;
      }
      if (bPrice === null) {
        return -1;
      }
      return (aPrice - bPrice) * direction || a.sequence - b.sequence;
    });
  }

  function restoreOriginalPositions() {
    const records = Array.from(state.records.values()).sort((a, b) => a.sequence - b.sequence);
    for (const record of records) {
      if (record.anchor.isConnected && record.anchor.nextSibling !== record.card) {
        record.anchor.after(record.card);
      }
    }
  }

  function sortLoadedOrganics(records) {
    if (!state.resultContainer) {
      return;
    }

    const existingOrder = Array.from(state.resultContainer.querySelectorAll(CARD_SELECTOR))
      .filter((card) => {
        const record = state.records.get(card);
        return record && !record.sponsored;
      });
    const unchanged = records.length === existingOrder.length
      && records.every((record, index) => record.card === existingOrder[index]);

    if (!unchanged) {
      records.forEach((record) => state.resultContainer.append(record.card));
    }
  }

  function renderLayout() {
    if (!state.resultContainer) {
      return;
    }

    restoreOriginalPositions();
    const organics = orderedOrganics();
    if (state.settings.priceOrder !== 'original') {
      sortLoadedOrganics(organics);
    }

    const sponsored = sponsoredRecords();
    if (state.settings.sponsoredMode === 'separate') {
      sponsored.forEach((record) => sponsoredSection.list.append(record.card));
    }

    sponsoredSection.section.classList.toggle(
      'acr-hidden',
      state.settings.sponsoredMode !== 'separate' || sponsored.length === 0
    );
    sponsoredSection.summary.textContent = `Sponsored products (${sponsored.length})`;

    const target = state.settings.resultCount;
    organics.forEach((record, index) => {
      record.card.classList.toggle('acr-hidden', target > 0 && index >= target);
    });
    sponsored.forEach((record) => {
      record.card.classList.toggle('acr-hidden', state.settings.sponsoredMode === 'hide');
    });

    state.observer?.takeRecords();
  }

  function resultStatus() {
    const organicCount = organicRecords().length;
    const visibleOrganicCount = state.settings.resultCount > 0
      ? Math.min(organicCount, state.settings.resultCount)
      : organicCount;
    const sponsoredCount = sponsoredRecords().length;
    const sponsoredDescription = {
      show: 'shown',
      separate: 'separated',
      hide: 'hidden'
    }[state.settings.sponsoredMode];

    return `Showing ${visibleOrganicCount} organic products; ${sponsoredCount} sponsored ${sponsoredDescription}.`;
  }

  function normalizeImportedCard(card) {
    card.querySelectorAll('script').forEach((script) => script.remove());
    card.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
    card.removeAttribute('id');
    card.querySelectorAll('img[data-src]').forEach((image) => {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    });
    card.querySelectorAll('[data-srcset]').forEach((element) => {
      element.setAttribute('srcset', element.dataset.srcset);
      element.removeAttribute('data-srcset');
    });
    return card;
  }

  function pageUrl(page) {
    const url = new URL(location.href);
    url.searchParams.set('page', String(page));
    url.hash = '';
    return url.href;
  }

  function isAccessControlPage(doc) {
    const title = doc.querySelector('title')?.textContent.toLowerCase() || '';
    return Boolean(doc.querySelector('#captchacharacters, form[action*="validateCaptcha"]'))
      || title.includes('robot check');
  }

  async function fetchResultCards(page, signal) {
    const response = await fetch(pageUrl(page), {
      credentials: 'include',
      signal,
      headers: { Accept: 'text/html' }
    });

    if (!response.ok) {
      throw new Error(`Amazon returned HTTP ${response.status} for page ${page}.`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      throw new Error(`Amazon returned an unexpected response for page ${page}.`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (isAccessControlPage(doc)) {
      throw new Error('Amazon presented a CAPTCHA or access-control page. Loading stopped.');
    }

    return Array.from(doc.querySelectorAll(CARD_SELECTOR));
  }

  async function loadToTarget(target) {
    if (state.loading) {
      state.abortController?.abort();
    }

    const loadId = ++state.loadId;
    const controller = new AbortController();
    state.abortController = controller;
    state.loading = true;
    panel.wrapper.querySelector('.stop').hidden = false;
    let requests = 0;
    let pagesAdded = 0;
    let terminalMessage = '';
    let terminalError = false;

    try {
      while (organicRecords().length < target && requests < MAX_PAGE_REQUESTS) {
        setStatus(`Loading page ${state.nextPage}… ${organicRecords().length} of ${target} organic products loaded.`);
        const cards = await fetchResultCards(state.nextPage, controller.signal);
        requests++;

        if (cards.length === 0) {
          terminalMessage = 'No more result cards were found; loading stopped.';
          break;
        }

        let added = 0;
        for (const sourceCard of cards) {
          const asin = sourceCard.dataset.asin?.trim();
          if (!asin || state.byAsin.has(asin)) {
            continue;
          }

          const card = normalizeImportedCard(document.importNode(sourceCard, true));
          state.resultContainer.append(card);
          if (registerCard(card)) {
            added++;
          }
        }

        state.nextPage++;
        if (added > 0) {
          pagesAdded++;
        }
        renderLayout();
        state.observer.takeRecords();

        if (added === 0 && cards.length > 0) {
          setStatus(`Skipping duplicate products on page ${state.nextPage - 1}…`);
        }
      }

      if (requests >= MAX_PAGE_REQUESTS && organicRecords().length < target) {
        terminalMessage = `Stopped after ${MAX_PAGE_REQUESTS} page requests to avoid excessive loading.`;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        terminalMessage = `Loading stopped. ${organicRecords().length} organic products remain available.`;
      } else {
        terminalMessage = error.message;
        terminalError = true;
      }
    } finally {
      if (loadId === state.loadId) {
        state.loading = false;
        state.abortController = null;
        panel.wrapper.querySelector('.stop').hidden = true;
        renderLayout();
        setStatus(terminalMessage || `${resultStatus()} ${pagesAdded} additional page${pagesAdded === 1 ? '' : 's'} loaded.`, terminalError);
      }
    }
  }

  async function applySettings(settings, load) {
    state.loadId++;
    state.abortController?.abort();
    state.loading = false;
    state.abortController = null;
    panel.wrapper.querySelector('.stop').hidden = true;
    state.settings = normalizeSettings(settings);
    updatePanel(state.settings);
    renderLayout();

    if (load && state.settings.resultCount > organicRecords().length) {
      await loadToTarget(state.settings.resultCount);
    } else {
      setStatus(resultStatus());
    }
  }

  function startObserver() {
    state.observer = new MutationObserver((mutations) => {
      if (state.scanScheduled || !mutations.some((mutation) => mutation.addedNodes.length > 0)) {
        return;
      }

      state.scanScheduled = true;
      queueMicrotask(() => {
        state.scanScheduled = false;
        scanCards();
        renderLayout();
        if (!state.loading) {
          setStatus(resultStatus());
        }
      });
    });
    state.observer.observe(document.body, { childList: true, subtree: true });
  }

  async function initialize() {
    scanCards();
    if (state.records.size === 0 || !state.resultContainer) {
      panel.wrapper.remove();
      document.querySelector('#acr-panel-host')?.remove();
      return;
    }

    startObserver();
    try {
      const stored = await chrome.storage.sync.get(DEFAULTS);
      await applySettings(normalizeSettings(stored), true);
    } catch (error) {
      await applySettings(DEFAULTS, false);
      setStatus(`Using temporary defaults; settings are unavailable: ${error.message}`, true);
    }
  }

  initialize();
})();
