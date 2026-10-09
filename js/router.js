/* ZakatTech 360 prototype — hash router with role gate (plain browser script, defines global Router)
 * A view: { path: '/kira/:jenis', id: 'Y4', title: 'Zakat Pendapatan', roles: ['payer'], nav: 'Kira', back: '#/kira',
 *           render(params, query) -> html, mount(params, query, root), actions: { name(data, el, ev) }, change: {...}, submit: {...} }
 * Views render HTML strings. Interaction is delegated: data-nav="#/path" navigates, data-action="name" calls view.actions,
 * form[data-submit="name"] calls view.submit, [data-change="name"] calls view.change. */
const Router = (() => {
  const views = [];
  let opts = {};
  let current = null; // { view, params, query }

  function register(list) {
    (Array.isArray(list) ? list : [list]).forEach(v => {
      v._re = new RegExp('^' + v.path.replace(/\//g, '\\/').replace(/:([a-zA-Z]+)/g, '(?<$1>[^\\/]+)') + '$');
      views.push(v);
    });
  }
  function parse(hash) {
    const h = (hash || '').replace(/^#/, '') || '/';
    const [pathPart, queryPart] = h.split('?');
    const query = {};
    (queryPart || '').split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); query[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    return { path: pathPart || '/', query };
  }
  function match(hash) {
    const { path, query } = parse(hash);
    for (const v of views) {
      const m = path.match(v._re);
      if (m) return { view: v, params: Object.fromEntries(Object.entries(m.groups || {}).map(([k, val]) => [k, decodeURIComponent(val)])), query };
    }
    return null;
  }
  function go(hash) {
    if (location.hash === hash) render(); else location.hash = hash;
  }
  function allowed(view) {
    if (!view.roles) return true;
    return view.roles.includes(Store.role());
  }
  function render() {
    const m = match(location.hash) || match(opts.defaultHash || '#/');
    if (!m) return;
    if (!allowed(m.view)) {
      UI.toast('Tiada akses untuk peranan ini', 'warn');
      const fallback = opts.defaultHash || '#/';
      if (location.hash !== fallback) { location.hash = fallback; return; }
      return;
    }
    current = m;
    const root = document.getElementById('view');
    UI.closePanels();
    root.innerHTML = m.view.render(m.params, m.query) || '';
    const title = typeof m.view.title === 'function' ? m.view.title(m.params) : (m.view.title || m.view.id);
    document.title = `${title} · ${SEED.meta.product}`;
    // shell chrome hooks
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = title;
    const backEl = document.getElementById('topbar-back');
    if (backEl) { backEl.classList.toggle('hidden', !m.view.back); if (m.view.back) backEl.setAttribute('href', typeof m.view.back === 'function' ? m.view.back(m.params) : m.view.back); }
    document.querySelectorAll('[data-nav-id]').forEach(a => a.classList.toggle('active', a.dataset.navId === m.view.nav));
    if (opts.onRender) opts.onRender(m);
    if (m.view.mount) m.view.mount(m.params, m.query, root);
    window.scrollTo(0, 0);
  }
  function rerender() { render(); }
  function currentView() { return current; }

  function delegate() {
    document.addEventListener('click', e => {
      const nav = e.target.closest('[data-nav]');
      if (nav) {
        if (nav.tagName === 'A' && nav.getAttribute('href') && nav.getAttribute('href') === nav.dataset.nav) return; // native anchor
        e.preventDefault(); go(nav.dataset.nav); return;
      }
      const act = e.target.closest('[data-action]');
      if (act && current && current.view.actions && current.view.actions[act.dataset.action]) {
        e.preventDefault();
        current.view.actions[act.dataset.action](act.dataset, act, e);
      }
    });
    document.addEventListener('submit', e => {
      const form = e.target.closest('form[data-submit]');
      if (form && current && current.view.submit && current.view.submit[form.dataset.submit]) {
        e.preventDefault();
        current.view.submit[form.dataset.submit](UI.formData(form), form, e);
      }
    });
    document.addEventListener('change', e => {
      const el = e.target.closest('[data-change]');
      if (el && current && current.view.change && current.view.change[el.dataset.change]) {
        current.view.change[el.dataset.change](el.value, el, e);
      }
    });
    document.addEventListener('input', e => {
      const el = e.target.closest('[data-input]');
      if (el && current && current.view.change && current.view.change[el.dataset.input]) {
        current.view.change[el.dataset.input](el.value, el, e);
      }
    });
  }

  /* demo bar: who am I, switch account, reset */
  function demoBar() {
    const acc = Store.account();
    let bar = document.querySelector('.demo-bar');
    if (!bar) { bar = document.createElement('div'); bar.className = 'demo-bar'; document.body.appendChild(bar); }
    bar.innerHTML = `<span>Demo: <strong>${UI.esc(acc.label)}</strong> <span class="muted">(${UI.esc(UI.label(acc.role))})</span></span>
      <a href="index.html">Tukar akaun</a>
      <a href="#" data-demo-reset>Reset</a>`;
    bar.querySelector('[data-demo-reset]').addEventListener('click', e => {
      e.preventDefault();
      UI.confirm('Set semula semua data demo kepada nilai asal?', () => { Store.reset(); location.href = 'index.html'; }, { yes: 'Reset demo', danger: true });
    });
  }

  function start(options) {
    opts = options || {};
    Store.load();
    // ?acc=<key> in the hash query selects a demo account (used by index.html links)
    const m0 = parse(location.hash);
    if (m0.query.acc) {
      const acc = SEED.accounts.find(a => a.key === m0.query.acc);
      if (acc) Store.setSession(acc);
      history.replaceState(null, '', location.pathname + '#' + m0.path);
    }
    if (opts.requireRoles && !opts.requireRoles.includes(Store.role())) {
      // surface opened without a fitting account: pick its default account silently so the demo never dead-ends
      const acc = SEED.accounts.find(a => opts.requireRoles.includes(a.role));
      if (acc) Store.setSession(acc);
    }
    delegate();
    if (opts.demoBar !== false) demoBar();
    window.addEventListener('hashchange', render);
    if (!location.hash) location.hash = opts.defaultHash || '#/';
    render();
  }

  return { register, start, go, render, rerender, currentView, match, parse, demoBar };
})();
