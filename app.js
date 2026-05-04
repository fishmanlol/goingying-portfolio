/* App logic for the hi-fi portfolio — async content load from Markdown */

(async function() {

  // ─────────────────────────────────────────────────────────
  // Load site bio + projects
  // ─────────────────────────────────────────────────────────
  let SITE, PROJECTS;
  try {
    [SITE, PROJECTS] = await Promise.all([
      window.ContentLoader.loadSite(),
      window.ContentLoader.loadProjects()
    ]);
  } catch (err) {
    console.error("Content load failed:", err);
    document.body.insertAdjacentHTML("afterbegin",
      '<div style="padding:24px;font-family:sans-serif;color:#900;">' +
      'Could not load site content. If you opened this file directly with file://, ' +
      'serve it from a local server (e.g. <code>python3 -m http.server</code>) or push to GitHub Pages.<br/>' +
      '<small>' + (err && err.message ? err.message : err) + '</small></div>');
    return;
  }

  // ─────────────────────────────────────────────────────────
  // Populate bio in hero, topbar, and floating overlay
  // ─────────────────────────────────────────────────────────
  function setText(sel, val) {
    document.querySelectorAll(sel).forEach(el => { el.textContent = val; });
  }
  function setAttr(sel, attr, val) {
    document.querySelectorAll(sel).forEach(el => { el.setAttribute(attr, val); });
  }

  setText('[data-bind="name"]', SITE.name || "");
  setText('[data-bind="role-short"]', SITE.role_short || "");
  setText('[data-bind="role-long"]', SITE.role_long || "");
  setText('[data-bind="bio"]', SITE.bio || "");
  // years licensed: prefer auto-calc from licensed_since, fall back to manual years_licensed
  let years = "";
  if (SITE.licensed_since) {
    const y = new Date().getFullYear() - Number(SITE.licensed_since);
    if (!isNaN(y) && y >= 0) years = String(y);
  } else if (SITE.years_licensed != null) {
    years = String(SITE.years_licensed);
  }
  setText('[data-bind="years-licensed"]', years);
  // topbar tagline: if not explicitly set, build from years
  const topbarLine = SITE.topbar_line || (years ? years + " years experienced · licensed landscape architect" : "");
  setText('[data-bind="topbar-line"]', topbarLine);
  setText('[data-bind="location-short"]', SITE.location_short || "");
  setText('[data-bind="location-long"]', SITE.location_long || "");
  setText('[data-bind="licensed"]', SITE.licensed || "");
  setText('[data-bind="education"]', SITE.education || "");
  setText('[data-bind="studio"]', SITE.studio || "");
  setText('[data-bind="email"]', SITE.email || "");
  if (SITE.portrait) {
    setAttr('[data-bind="portrait"]', "src", SITE.portrait);
  }
  // page title
  if (SITE.name) {
    document.title = SITE.name + " — " + (SITE.role_short || "Portfolio");
  }

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
            ${p.after.map((src, i) => `
              <div class="viewer__slide ${i === 0 ? 'is-active' : ''}" data-pane="after" data-idx="${i}">
                <img src="${src}" alt="${p.title} — after, photo ${i+1}" loading="lazy" />
              </div>
            `).join('')}
            ${(p.before || []).map((src, i) => `
              <div class="viewer__slide" data-pane="before" data-idx="${i}">
                <img src="${src}" alt="${p.title} — before, photo ${i+1}" loading="lazy" />
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
            ${p.after.map((src, i) => `
              <div class="thumb ${i === 0 ? 'is-active' : ''}" data-thumb-pane="after" data-thumb-idx="${i}">
                <img src="${src}" alt="" loading="lazy" />
              </div>
            `).join('')}
            ${(p.before || []).map((src, i) => `
              <div class="thumb" data-thumb-pane="before" data-thumb-idx="${i}">
                <img src="${src}" alt="" loading="lazy" />
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
      tabs.forEach(t => {
        const is = t.dataset.tab === state.pane;
        t.classList.toggle('is-active', is);
        t.setAttribute('aria-selected', is ? 'true' : 'false');
      });
      slides.forEach(s => {
        const is = s.dataset.pane === state.pane && Number(s.dataset.idx) === state.idx;
        s.classList.toggle('is-active', is);
      });
      thumbs.forEach(th => {
        const is = th.dataset.thumbPane === state.pane && Number(th.dataset.thumbIdx) === state.idx;
        th.classList.toggle('is-active', is);
      });
      const total = paneCount(state.pane);
      counter.textContent = `${state.idx + 1} / ${total}`;
      const activeTabCount = art.querySelector(`[data-tab-count="${state.pane}"]`);
      if (activeTabCount) activeTabCount.textContent = `${state.idx + 1} / ${total}`;
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
    const heroProgress = Math.min(1, scrollY / (vh * 0.5));
    hero.style.opacity = String(1 - heroProgress);
    hero.style.transform = `translateY(${-heroProgress * 40}px)`;
    if (heroProgress >= 1) {
      hero.classList.add('is-hidden');
    } else {
      hero.classList.remove('is-hidden');
    }
    const shouldShow = scrollY > vh * 0.6;
    if (shouldShow !== topbarVisible) {
      topbarVisible = shouldShow;
      topbar.classList.toggle('is-visible', shouldShow);
      if (!shouldShow) closeBio();
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  let bioOpen = false;
  let hoverCloseTimer = null;

  function openBio() {
    if (!topbarVisible) return;
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
    if (e.target.closest('a')) return;
    bioOpen ? closeBio() : openBio();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBio();
  });

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
