/* ZakatTech 360 prototype — officer console core: role constants, helpers, counters and the left rail.
 * Loaded first; exposes window.OfficerKit for officer-content.js (O6-O10) and officer.js (O1-O5 + start). */
(function () {
  const esc = UI.esc;
  const WORK = ['officer', 'admin'];
  const ALL = ['officer', 'shariah_reviewer', 'admin'];
  const SLOT_TIMES = ['10:00', '11:30', '14:30', '16:00'];
  const INDUSTRIES = ['runcit', 'fnb', 'online', 'professional'];
  const CASE_STATUSES = ['new', 'in_progress', 'referred', 'closed'];
  const KNOWLEDGE_ORDER = ['shariah_review', 'draft', 'approved', 'published', 'retired'];
  const SECTOR_LABELS = { hospital: 'Hospital', factory: 'Kilang', government: 'Kerajaan' };
  const GATEWAY_LABELS = {
    identity: 'Identiti (OTP)', collection: 'Kutipan', paymentNavigation: 'Navigasi Portal Bayaran', payroll: 'Potongan gaji',
    officerDirectory: 'Direktori pegawai', messaging: 'Pemesejan', assistant: 'Pembantu AI'
  };
  const AI_PROVIDERS = [
    { value: 'adapter-demo', label: 'adapter-demo (jawapan demo)' },
    { value: 'adapter-a', label: 'adapter-a' },
    { value: 'adapter-b', label: 'adapter-b' }
  ];
  const openedCases = new Set(); // "dibuka" audit is written once per page load per case

  /* ---------- small helpers ---------- */
  function role() { return Store.role(); }
  function isWork() { return WORK.includes(role()); }
  function me() { return Store.currentOfficer(); }
  function officerName(id) { const o = id ? Store.officer(id) : null; return o ? o.name : (id || '—'); }
  function caseOfficers() { return Store.state().officers.filter(o => o.role === 'officer'); }
  function refToday() {
    const real = Fmt.todayIso();
    return Store.appointments().some(a => a.date === real) ? real : SEED.meta.today;
  }
  function addDays(iso, n) { const d = Fmt.parse(iso); d.setDate(d.getDate() + n); return Fmt.toIso(d); }
  function mondayOf(iso) {
    const d = Fmt.parse(iso) || Fmt.parse(SEED.meta.today);
    const dow = d.getDay();
    d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
    return Fmt.toIso(d);
  }
  function buildHash(path, query) {
    const qs = Object.entries(query || {})
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    return '#' + path + (qs ? '?' + qs : '');
  }
  function setQuery(patch) {
    const p = Router.parse(location.hash);
    Router.go(buildHash(p.path, Object.assign({}, p.query, patch)));
  }
  function replaceQuery(patch) {
    const p = Router.parse(location.hash);
    try { history.replaceState(null, '', location.pathname + location.search + buildHash(p.path, Object.assign({}, p.query, patch))); } catch (e) { /* file:// quirks */ }
  }
  function currentParams() { const c = Router.currentView(); return c ? c.params : {}; }
  function done(msg, type) { UI.toast(msg, type || 'ok'); renderRail(); Router.rerender(); }
  function eventsFor(id) { return Store.auditLog().filter(e => e.entityId === id || String(e.entityId || '').startsWith(id + '/')); }
  function textarea(name, value, opts) {
    const o = opts || {};
    return `<textarea name="${esc(name)}" class="input" rows="${o.rows || 4}" ${o.required ? 'required' : ''} ${o.placeholder ? `placeholder="${esc(o.placeholder)}"` : ''} ${o.id ? `id="${esc(o.id)}"` : ''} ${o.readonly ? 'readonly' : ''}>${esc(value || '')}</textarea>`;
  }
  function hidden(name, value) { return `<input type="hidden" name="${esc(name)}" value="${esc(value)}">`; }
  // client-side text filter over rendered table rows (keeps focus in the search box)
  function applySearch(root, q, cellIdx) {
    const needle = String(q || '').trim().toLowerCase();
    (root || document).querySelectorAll('table.table tbody tr').forEach(tr => {
      const text = cellIdx.map(i => (tr.cells[i] ? tr.cells[i].textContent : '')).join(' ').toLowerCase();
      tr.style.display = !needle || text.includes(needle) ? '' : 'none';
    });
  }
  function toolbar(html) { return `<div class="row mb-2" style="flex-wrap:wrap;gap:8px;align-items:center">${html}</div>`; }
  function backBtn(href, text) { return UI.btn(text || 'Kembali', { variant: 'ghost', sm: true, icon: 'back', nav: href }); }

  /* ---------- live counts (rail badges + dashboard counters) ---------- */
  function counts() {
    const today = refToday();
    const weekEnd = addDays(mondayOf(today), 6);
    return {
      casesNew: Store.allCases().filter(c => c.status === 'new').length,
      escNew: Store.escalations('new').length,
      apts: Store.appointments().filter(a => a.date >= today && a.date <= weekEnd).length,
      review: Store.knowledgeByStatus('shariah_review').length,
      employersPending: Store.state().employers.filter(e => e.status === 'pending').length
    };
  }

  /* ---------- rail (rule 10: built from the role) ---------- */
  const NAV = [
    { section: 'Kerja', items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'home', href: '#/', roles: WORK },
      { id: 'kes', label: 'Kes', icon: 'store', href: '#/kes', roles: WORK, count: c => c.casesNew },
      { id: 'temu-janji', label: 'Temu janji', icon: 'calendar', href: '#/temu-janji', roles: WORK },
      { id: 'eskalasi', label: 'Eskalasi', icon: 'inbox', href: '#/eskalasi', roles: WORK, count: c => c.escNew }
    ] },
    { section: 'Kandungan & data', items: [
      { id: 'kandungan', label: 'Kandungan', icon: 'doc', href: '#/kandungan', roles: ALL, count: c => c.review },
      { id: 'impak', label: 'Impak', icon: 'chart', href: '#/impak', roles: WORK },
      { id: 'majikan', label: 'Majikan', icon: 'users', href: '#/majikan', roles: WORK, count: c => c.employersPending }
    ] },
    { section: 'Pentadbiran', items: [
      { id: 'audit', label: 'Audit', icon: 'audit', href: '#/audit', roles: ALL },
      { id: 'tetapan', label: 'Tetapan', icon: 'settings', href: '#/tetapan', roles: ['admin'] }
    ] }
  ];
  function renderRail() {
    const rail = document.getElementById('rail');
    if (!rail) return;
    const r = role();
    const c = counts();
    const cur = Router.currentView();
    const activeId = cur && cur.view ? cur.view.nav : null;
    rail.innerHTML = NAV.map(sec => {
      const items = sec.items.filter(i => i.roles.includes(r));
      if (!items.length) return '';
      return `<div class="rail__section">${esc(sec.section)}</div>` + items.map(i => {
        const n = i.count ? i.count(c) : 0;
        return `<a class="rail__item ${i.id === activeId ? 'active' : ''}" href="${i.href}" data-nav="${i.href}" data-nav-id="${i.id}">${UI.icon(i.icon)} ${esc(i.label)}${n ? ` <span class="badge badge--menunggu">${n}</span>` : ''}</a>`;
      }).join('');
    }).join('');
    const user = document.getElementById('topbar-user');
    const o = me();
    if (user) user.textContent = `${o ? o.name : Store.account().label} · ${UI.label(r)}`;
  }

  /* =====================================================================
     O1 Dashboard Pegawai
     ===================================================================== */

  window.OfficerKit = { esc, WORK, ALL, SLOT_TIMES, INDUSTRIES, CASE_STATUSES, KNOWLEDGE_ORDER, SECTOR_LABELS, GATEWAY_LABELS, AI_PROVIDERS, openedCases, role, isWork, me, officerName, caseOfficers, refToday, addDays, mondayOf, buildHash, setQuery, replaceQuery, currentParams, done, eventsFor, textarea, hidden, applySearch, toolbar, backBtn, counts, NAV, renderRail };
})();
