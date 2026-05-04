/* App logic for the hi-fi portfolio */

(function() {
  const U = window.U;
  const PROJECTS = window.PROJECTS;

  // ─────────────────────────────────────────────────────────
  // Render projects
  // ─────────────────────────────────────────────────────────
  const list = document.getElementById('projectList');
  const tpl = (p) => {
    const hasBefore = p.before && p.before.length > 0;
    return `
      <article class="proj" id="proj-${p.id}" data-project-id="${p.id}">
        <header class="proj__head">
          <h3 class="proj__title">${p.title}</h3>
          <div class="proj__loc">${p.location} · ${p.year}</div>
        </header>

        <div class="proj__viewer">
          <div class="tabs" role="tablist">
            <button class="tab is-active" role="tab" data-tab="after" aria-selected="true">
              <span>After</span>
              <span class="tab__count" data-tab-count="after">1 / ${p.after.length}</span>
            </button>
            <button class="tab" role="tab" data-tab="before" ${hasBefore ? '' : 'disabled'} aria-selected="false">
              <span>Before</span>
              ${hasBefore
                ? `<span class="tab__count" data-tab-count="before">1 / ${p.before.length}</span>`
                : `<span class="no-before">no photos</span>`}
            </button>
          </div>

          <div class="viewer" data-viewer>
            ${p.after.map((img, i) => `
              <div class="viewer__slide ${i === 0 ? 'is-active' : ''}" data-pane="after" data-idx="${i}">
                <img src="${U(img, 1600)}" alt="${p.title} — after, photo ${i+1}" loading="lazy" />
              </div>
            `).join('')}
            ${(p.before || []).map((img, i) => `
              <div class="viewer__slide" data-pane="before" data-idx="${i}">
                <img src="${U(img, 1600)}" alt="${p.title} — before, photo ${i+1}" loading="lazy" />
              </div>
            `).join('')}
            <div class="viewer__counter" data-counter>1 / ${p.after.length}</div>
            <div class="viewer__nav">
              <button data-nav="prev" aria-label="Previous photo">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7L9 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <button data-nav="next" aria-label="Next photo">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>

          <div class="thumbs" data-thumbs style="margin-top: 12px;">
            ${p.after.map((img, i) => `
              <div class="thumb ${i === 0 ? 'is-active' : ''}" data-thumb-pane="after" data-thumb-idx="${i}">
                <img src="${U(img, 320)}" alt="" loading="lazy" />
              </div>
            `).join('')}
            ${(p.before || []).map((img, i) => `
              <div class="thumb" data-thumb-pane="before" data-thumb-idx="${i}">
                <img src="${U(img, 320)}" alt="" loading="lazy" />
              </div>
            `).join('')}
          </div>
        </div>

        <div class="proj__body">
          <div class="proj__body-spacer"></div>
          <div class="proj__summary">${p.summary}</div>
          <div class="proj__details">
            <dl>
              <dt>Project</dt><dd>${p.client}</dd>
              <dt>Scope</dt><dd>${p.scope}</dd>
              <dt>Year</dt><dd>${p.year}</dd>
            </dl>
          </div>
        </div>
      </article>
    `;
  };

  list.innerHTML = PROJECTS.map(tpl).join('');

  // (work header removed)

  // ─────────────────────────────────────────────────────────
  // Per-project viewer behavior — tabs, thumbs, prev/next
  // ─────────────────────────────────────────────────────────
  document.querySelectorAll('.proj').forEach(art => {
    const proj = PROJECTS.find(p => p.id === art.dataset.projectId);
    const state = { pane: 'after', idx: 0 };

    const tabs = art.querySelectorAll('.tab');
    const slides = art.querySelectorAll('.viewer__slide');
    const thumbs = art.querySelectorAll('.thumb');
    const counter = art.querySelector('[data-counter]');
    const navPrev = art.querySelector('[data-nav="prev"]');
    const navNext = art.querySelector('[data-nav="next"]');

    function paneCount(pane) {
      return pane === 'after' ? proj.after.length : (proj.before || []).length;
    }

    function render() {
      // tabs
      tabs.forEach(t => {
        const is = t.dataset.tab === state.pane;
        t.classList.toggle('is-active', is);
        t.setAttribute('aria-selected', is ? 'true' : 'false');
      });
      // slides
      slides.forEach(s => {
        const is = s.dataset.pane === state.pane && Number(s.dataset.idx) === state.idx;
        s.classList.toggle('is-active', is);
      });
      // thumbs
      thumbs.forEach(th => {
        const is = th.dataset.thumbPane === state.pane && Number(th.dataset.thumbIdx) === state.idx;
        th.classList.toggle('is-active', is);
      });
      // counter
      const total = paneCount(state.pane);
      counter.textContent = `${state.idx + 1} / ${total}`;
      // tab counters
      const activeTabCount = art.querySelector(`[data-tab-count="${state.pane}"]`);
      if (activeTabCount) activeTabCount.textContent = `${state.idx + 1} / ${total}`;
      // nav buttons
      navPrev.disabled = state.idx === 0;
      navNext.disabled = state.idx === total - 1;
    }

    tabs.forEach(t => t.addEventListener('click', () => {
      if (t.disabled) return;
      if (state.pane === t.dataset.tab) return;
      state.pane = t.dataset.tab;
      state.idx = 0;
      render();
    }));

    thumbs.forEach(th => th.addEventListener('click', () => {
      state.pane = th.dataset.thumbPane;
      state.idx = Number(th.dataset.thumbIdx);
      render();
    }));

    navPrev.addEventListener('click', () => {
      if (state.idx > 0) { state.idx--; render(); }
    });
    navNext.addEventListener('click', () => {
      const total = paneCount(state.pane);
      if (state.idx < total - 1) { state.idx++; render(); }
    });

    render();
  });

  // ─────────────────────────────────────────────────────────
  // Top bar reveal on scroll past hero
  // Floating bio overlay opens on hover/click of top bar
  // ─────────────────────────────────────────────────────────
  const topbar = document.getElementById('topbar');
  const hero = document.getElementById('hero');
  const bioFloat = document.getElementById('bioFloat');
  let topbarVisible = false;

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const vh = window.innerHeight;
    // Hero fades and lifts away as user scrolls. Fully gone by 50% vh.
    const heroProgress = Math.min(1, scrollY / (vh * 0.5));
    hero.style.opacity = String(1 - heroProgress);
    hero.style.transform = `translateY(${-heroProgress * 40}px)`;
    if (heroProgress >= 1) {
      hero.classList.add('is-hidden');
    } else {
      hero.classList.remove('is-hidden');
    }

    // Topbar appears once we're meaningfully past the hero
    const shouldShow = scrollY > vh * 0.6;
    if (shouldShow !== topbarVisible) {
      topbarVisible = shouldShow;
      topbar.classList.toggle('is-visible', shouldShow);
      if (!shouldShow) closeBio();
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // hover behavior — open on hover, close when both topbar and overlay
  // are unhovered. Click also toggles open (touch/keyboard accessibility).
  let bioOpen = false;
  let hoverCloseTimer = null;

  function openBio() {
    if (!topbarVisible) return; // never open the float when hero is showing
    bioOpen = true;
    bioFloat.classList.add('is-open');
    bioFloat.setAttribute('aria-hidden', 'false');
    clearTimeout(hoverCloseTimer);
  }
  function closeBio() {
    bioOpen = false;
    bioFloat.classList.remove('is-open');
    bioFloat.setAttribute('aria-hidden', 'true');
  }
  function scheduleClose() {
    clearTimeout(hoverCloseTimer);
    hoverCloseTimer = setTimeout(() => {
      // only close if neither topbar nor bioFloat is hovered
      if (!topbar.matches(':hover') && !bioFloat.matches(':hover')) {
        closeBio();
      }
    }, 180);
  }

  topbar.addEventListener('mouseenter', openBio);
  topbar.addEventListener('mouseleave', scheduleClose);
  bioFloat.addEventListener('mouseenter', openBio);
  bioFloat.addEventListener('mouseleave', scheduleClose);

  topbar.addEventListener('click', (e) => {
    // Allow nav links to function normally
    if (e.target.closest('a')) return;
    bioOpen ? closeBio() : openBio();
  });

  // close with esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBio();
  });

  // smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeBio();
      }
    });
  });

})();
