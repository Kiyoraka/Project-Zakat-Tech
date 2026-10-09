/* ZakatTech 360 prototype — payer app (mobile-first): Y1 Login, Y2 Home, Y3 Pilih Kalkulator, Y4 Kalkulator,
 * Y5 Semak dan Bayar, Y6 Sejarah, Y7 Peti Resit, Y8 Peringatan dan Kebenaran, Y9 Profil, Y10 Tanya AI, Y11 Daftar Skim Potongan Gaji,
 * plus the shared /sumber/:id source viewer. SME mode views (S1-S6) come from sme.js (loaded before this file) and share the shell. */
(function () {
  const esc = UI.esc;
  const OTP_DEMO = '123456';
  const PORTAL = SEED.meta.portal;

  /* ---------- drafts survive a refresh inside this tab (not demo state, so not in Store) ---------- */
  const Draft = {
    get(key) { try { return JSON.parse(sessionStorage.getItem('zt360.draft.' + key) || 'null'); } catch (e) { return null; } },
    set(key, val) { try { sessionStorage.setItem('zt360.draft.' + key, JSON.stringify(val)); } catch (e) { /* ignore */ } },
    clear(key) { try { sessionStorage.removeItem('zt360.draft.' + key); } catch (e) { /* ignore */ } }
  };

  function me() { return Store.currentPayer(); }
  function payerRoles() { return ['payer', 'sme_owner']; }
  function pinned(html) { return `<div class="cta-pinned">${html}</div>`; }

  /* ---------- calculation engine shared by Y4 / Y5 ---------- */
  function evalFormula(tpl, inputs) {
    const keys = tpl.steps.flatMap(s => s.fields.map(f => f.key));
    const vals = keys.map(k => Fmt.parseMoney(inputs[k]));
    let base;
    try {
      base = new Function(...keys, 'const max = Math.max, min = Math.min; return (' + tpl.formula + ');')(...vals);
      if (typeof base !== 'number' || isNaN(base)) throw new Error('nan');
    } catch (e) {
      base = vals.reduce((a, b) => a + b, 0);
    }
    base = Math.max(0, base);
    const nisab = tpl.nisab || SEED.meta.nisab;
    const rate = tpl.rate || SEED.meta.rate;
    const due = base >= nisab;
    return { base, nisab, rate, due, amount: due ? Math.round(base * rate) : 0 };
  }
  function workingSheet(tpl, calc) {
    return `<p class="small muted">${esc(tpl.method)}</p>
      ${UI.kv([
        { label: 'Asas pengiraan', value: Fmt.rm(calc.base) },
        { label: 'Nisab ' + SEED.meta.nisabYear, value: Fmt.rm(calc.nisab) },
        { label: 'Kadar', value: Fmt.pct(calc.rate, 1) },
        { label: 'Zakat', value: Fmt.rm(calc.amount), total: true }
      ])}
      <p class="mt-2">${UI.fixedText('Berdasarkan kaedah rasmi Pusat Zakat · Panduan, bukan fatwa')}</p>
      ${tpl.explanationKnowledgeId && Store.isPublished(tpl.explanationKnowledgeId) ? `<p class="mt-1">${UI.sourceChip(tpl.explanationKnowledgeId)}</p>` : ''}`;
  }

  /* ---------- Y1 Login / Daftar ---------- */
  const Y1 = {
    path: '/masuk', id: 'Y1', title: 'Masuk', hideNav: true,
    render(params, query) {
      const alt = query.cara === 'mykad';
      return `<div class="stack mt-4">
        <div class="center"><span class="topbar__logo" style="display:inline-block;width:56px;height:56px;border-radius:14px"></span><h1 class="mt-2">Pusat Zakat</h1><div class="rule-ornament"></div></div>
        <div class="card">
          <h3 class="card__title">Masuk dengan</h3>
          ${alt ? `
          <form data-submit="mykad" class="stack--tight stack">
            ${UI.field('No. MyKad', UI.input('mykad', { placeholder: '900101-07-1234', required: true, attrs: 'inputmode="numeric"' }))}
            ${UI.field('Kata laluan', UI.input('password', { type: 'password', placeholder: 'Kata laluan Portal Bayaran Rasmi', required: true }), 'Akaun yang sama dengan Portal Bayaran Rasmi.')}
            ${UI.btn('Masuk', { type: 'submit', block: true })}
          </form>
          <div class="center small mt-2"><a data-nav="#/masuk">Masuk dengan telefon</a></div>` : `
          <form data-submit="phone" class="stack--tight stack">
            ${UI.field('No. telefon', UI.input('phone', { type: 'tel', placeholder: '+60 12-345 6789', required: true, value: me() ? me().phone : '' }))}
            ${UI.btn('Hantar OTP', { type: 'submit', block: true })}
          </form>
          <div class="center small muted mt-2">---- atau ----</div>
          ${UI.btn('MyKad + kata laluan', { variant: 'secondary', block: true, nav: '#/masuk?cara=mykad' })}`}
        </div>
        ${UI.note(`<strong>Pengguna ${esc(PORTAL)}?</strong> Akaun sama, satu log masuk. Identiti disahkan melalui Pusat Zakat (gerbang identiti dalam mod stub); portal ini tidak pernah mencipta rekod pembayar kedua.`, 'muted')}
        <p class="tiny muted center">Prototaip: sebarang nombor diterima. Peranan datang daripada <a href="index.html">pemilih akaun demo</a>.</p>
      </div>`;
    },
    submit: {
      phone(d) { Store.loginAsPayer(d.phone); Router.go('#/masuk/otp'); },
      mykad() { Store.loginAsPayer('mykad'); Router.go('#/masuk/daerah'); }
    }
  };
  const Y1otp = {
    path: '/masuk/otp', id: 'Y1', title: 'Kod OTP', hideNav: true, back: '#/masuk',
    render(params, query) {
      const tries = Store.state().otpAttempts || 0;
      if (tries >= 5) {
        return `<div class="stack mt-4">${UI.card(UI.emptyState({ icon: 'shield', text: 'Akaun dikunci selepas 5 cubaan. Sila hubungi pegawai.', action: { label: 'Hubungi pegawai', href: 'payer.html#/tanya' } }))}</div>`;
      }
      return `<div class="stack mt-4">
        <div class="card">
          <h3 class="card__title">Masukkan kod OTP</h3>
          <p class="small muted">Dihantar ke ${esc(Store.state().session.phoneUsed || 'telefon anda')} (simulasi). Kod demo: <strong>${OTP_DEMO}</strong></p>
          <form data-submit="otp" class="stack--tight stack mt-2">
            <div class="otp" id="otp">${[0, 1, 2, 3, 4, 5].map(i => `<input class="input" name="d${i}" maxlength="1" inputmode="numeric" autocomplete="one-time-code" aria-label="digit ${i + 1}">`).join('')}</div>
            ${query.salah ? `<div class="error-text">Kod tidak sah. Cubaan ${tries}/5.</div>` : ''}
            ${UI.btn('Sahkan', { type: 'submit', block: true })}
          </form>
          <div class="center small mt-2"><a id="resend" class="muted">Hantar semula dalam <span id="resend-s">60</span> s</a></div>
        </div>
      </div>`;
    },
    mount(params, query, root) {
      const boxes = Array.from(root.querySelectorAll('#otp input'));
      boxes.forEach((b, i) => {
        b.addEventListener('input', () => { if (b.value && boxes[i + 1]) boxes[i + 1].focus(); });
        b.addEventListener('keydown', e => { if (e.key === 'Backspace' && !b.value && boxes[i - 1]) boxes[i - 1].focus(); });
      });
      if (boxes[0]) boxes[0].focus();
      let s = 60;
      const el = root.querySelector('#resend-s'), link = root.querySelector('#resend');
      const t = setInterval(() => {
        s -= 1;
        if (!document.body.contains(link)) { clearInterval(t); return; }
        if (s <= 0) { clearInterval(t); link.textContent = 'Hantar semula kod'; link.classList.remove('muted'); link.addEventListener('click', () => { UI.toast('Kod baharu dihantar (simulasi)', 'ok'); Router.rerender(); }); }
        else el.textContent = s;
      }, 1000);
    },
    submit: {
      otp(d) {
        const code = [0, 1, 2, 3, 4, 5].map(i => d['d' + i] || '').join('');
        if (code === OTP_DEMO) { Router.go('#/masuk/daerah'); return; }
        Store.otpFail();
        Router.go('#/masuk/otp?salah=1');
      }
    }
  };
  const Y1district = {
    path: '/masuk/daerah', id: 'Y1', title: 'Daerah anda', hideNav: true, roles: payerRoles(),
    render() {
      return `<div class="stack mt-4"><div class="card">
        <h3 class="card__title">Satu soalan sahaja</h3>
        <p class="small muted">Daerah menentukan pegawai dan templat yang anda lihat. Boleh diubah di Profil.</p>
        <form data-submit="district" class="stack--tight stack mt-2">
          ${UI.field('Daerah', UI.select('district', SEED.districts, me().district))}
          ${UI.btn('Teruskan', { type: 'submit', block: true })}
        </form>
      </div></div>`;
    },
    submit: { district(d) { if (d.district !== me().district) Store.updatePayerDistrict(me().id, d.district); UI.toast(`Salam, ${me().name.split(' ')[0]}`, 'ok'); Router.go('#/'); } }
  };

  /* ---------- Y2 Home ---------- */
  function nextReminderDate(consent) {
    const today = Fmt.parse(Fmt.todayIso());
    if (consent.frequency === 'monthly') { const d = new Date(today.getFullYear(), today.getMonth() + (today.getDate() >= 15 ? 1 : 0), 15); return Fmt.toIso(d); }
    const d = new Date(today.getFullYear(), 9, 15); if (d < today) d.setFullYear(d.getFullYear() + 1); return Fmt.toIso(d);
  }
  const Y2 = {
    path: '/', id: 'Y2', title: 'Utama', nav: 'utama', roles: payerRoles(),
    render() {
      const p = me(); const year = new Date().getFullYear();
      const paid = Store.payerPaid(p.id, year);
      const calc = Store.lastCalculation(p.id);
      const consent = Store.payerConsent(p.id);
      const remaining = calc ? Math.max(0, calc.amount - paid) : null;
      return `<div class="stack">
        <div class="row row--between"><h2>Salam, ${esc(p.name.split(' ')[0])}</h2><a data-nav="#/profil" class="btn btn--ghost btn--sm" aria-label="Profil">${UI.icon('user')}</a></div>
        <div class="card card--feature">
          <div class="muted small">Status ${year}</div>
          ${UI.kv([{ label: 'Dibayar', value: Fmt.rm(paid) }, calc ? { label: 'Baki anggaran', value: Fmt.rm(remaining), total: true } : { label: 'Anggaran', value: 'belum dikira' }])}
          ${calc ? `<p class="tiny muted mt-1">Anggaran daripada pengiraan ${Fmt.date(calc.savedAt)} (${esc(UI.label((Store.calculatorTemplate(calc.templateId) || { type: 'perniagaan' }).type))}). Ini anggaran, bukan hutang.</p>
            <div class="mt-2">${remaining > 0 ? UI.btn('Bayar baki', { block: true, nav: `#/kira/semak?calc=${calc.id}` }) : UI.badge('ok', 'Anggaran tahun ini selesai')}</div>`
            : `<p class="small muted mt-1">Mula dengan mengira zakat anda.</p><div class="mt-2">${UI.btn('Kira zakat saya', { block: true, nav: '#/kira', icon: 'calc' })}</div>`}
        </div>
        ${consent ? `<div class="card"><div class="row row--between"><div><div class="muted small">Peringatan seterusnya</div><div><strong>${Fmt.dateShort(nextReminderDate(consent))}</strong> · ${esc(UI.label(consent.frequency))} · ${consent.channels.map(UI.label).join(', ')}</div></div>${UI.btn('Ubah', { variant: 'secondary', sm: true, nav: '#/peringatan' })}</div></div>`
          : `<div class="card card--muted"><div class="row row--between"><div class="small">Tiada peringatan. Beri kebenaran untuk diingatkan.</div>${UI.btn('Tetapkan', { variant: 'secondary', sm: true, nav: '#/peringatan' })}</div></div>`}
        <div class="grid-3">
          <a class="card card--link center" data-nav="#/kira">${UI.icon('calc')}<div class="small mt-1">Kira</div></a>
          <a class="card card--link center" data-nav="#/resit">${UI.icon('receipt')}<div class="small mt-1">Resit</div></a>
          <a class="card card--link center" data-nav="#/tanya">${UI.icon('chat')}<div class="small mt-1">Tanya</div></a>
        </div>
        ${Store.session().smeMode ? UI.note(`Mod perniagaan aktif · ${UI.btn('Buka Zakat Perniagaan', { variant: 'ghost', sm: true, nav: '#/perniagaan' })}`) : ''}
      </div>`;
    }
  };

  /* ---------- Y3 Pilih Kalkulator ---------- */
  const Y3 = {
    path: '/kira', id: 'Y3', title: 'Kira zakat', nav: 'kira', back: '#/', roles: payerRoles(),
    render() {
      const tpls = Store.calculatorTemplates();
      return `<div class="stack">
        <div class="list">
          ${tpls.map(t => UI.listItem({ title: UI.label(t.type), sub: t.description, nav: `#/kira/${t.type}`, icon: 'calc', right: '›', card: true })).join('')}
          ${UI.listItem({ title: 'Perniagaan → PKS', sub: 'Templat ikut industri, disahkan pegawai', nav: '#/perniagaan', icon: 'store', right: '›', card: true })}
        </div>
        <div class="chat__intro note">${UI.icon('chat')} Tak pasti jenis mana? ${UI.btn('Tanya saya', { variant: 'ghost', sm: true, nav: '#/tanya' })}<div class="tiny muted">Pembantu hanya membantu memilih jenis; soalan hukum ke pegawai.</div></div>
        <p class="tiny muted">Senarai ini datang daripada templat yang diterbitkan (${tpls.length}).</p>
      </div>`;
    },
    mount() { if (Store.session().smeMode) Store.setSmeMode(false); renderNav(); }
  };

  /* ---------- Y4 Kalkulator ---------- */
  const Y4 = {
    path: '/kira/:jenis', id: 'Y4', title: p => 'Zakat ' + UI.label(p.jenis), nav: 'kira', back: '#/kira', roles: payerRoles(),
    render(params, query) {
      const tpl = Store.calculatorTemplate(params.jenis);
      if (!tpl) return UI.emptyState({ icon: 'calc', text: 'Templat ini belum diterbitkan.', action: { label: 'Kembali', nav: '#/kira' } });
      const n = Math.min(tpl.steps.length, Math.max(1, parseInt(query.langkah || '1', 10)));
      const step = tpl.steps[n - 1];
      const draft = Draft.get('calc:' + tpl.id) || {};
      const calc = evalFormula(tpl, draft);
      const last = n === tpl.steps.length;
      return `<div class="stack">
        ${UI.stepper(n, tpl.steps.length, step.title)}
        <form data-submit="step" class="card stack stack--tight">
          ${step.fields.map(f => UI.field(f.label, UI.input(f.key, { rm: true, value: draft[f.key] !== undefined ? draft[f.key] : '', placeholder: f.example || '', attrs: `data-input="field" data-key="${esc(f.key)}"` }),
            `${esc(f.help || '')} ${tpl.explanationKnowledgeId && Store.isPublished(tpl.explanationKnowledgeId) ? `<a data-action="help" data-id="${esc(tpl.explanationKnowledgeId)}" class="small">(?)</a>` : ''}`)).join('')}
          <input type="hidden" name="langkah" value="${n}">
          ${last ? `<div id="estimate" class="${calc.due ? 'card card--muted' : 'card card--success'}">${estimateHtml(tpl, calc)}</div>` : `<div id="estimate" class="small muted">Anggaran: <strong>${Fmt.rm(calc.amount)}</strong> · Berdasarkan kaedah rasmi Pusat Zakat</div>`}
          <div class="row">${n > 1 ? UI.btn('Kembali', { variant: 'secondary', nav: `#/kira/${tpl.type}?langkah=${n - 1}` }) : ''}<span style="flex:1"></span>${UI.btn(last ? 'Seterusnya · Semak' : 'Seterusnya', { type: 'submit' })}</div>
        </form>
        <p class="tiny muted">Setiap pengiraan disimpan bersama id templat ${esc(tpl.id)} v${esc(tpl.version)} dan input anda.</p>
      </div>`;
    },
    change: {
      field(v, el) {
        const tpl = Store.calculatorTemplate(Router.currentView().params.jenis);
        const d = Draft.get('calc:' + tpl.id) || {}; d[el.dataset.key] = v; Draft.set('calc:' + tpl.id, d);
        const calc = evalFormula(tpl, d);
        const est = document.getElementById('estimate');
        if (est) { if (est.classList.contains('card')) { est.className = calc.due ? 'card card--muted' : 'card card--success'; est.innerHTML = estimateHtml(tpl, calc); } else est.innerHTML = `Anggaran: <strong>${Fmt.rm(calc.amount)}</strong> · Berdasarkan kaedah rasmi Pusat Zakat`; }
      }
    },
    actions: {
      help(d) { const k = Store.knowledge(d.id); UI.openSheet({ title: k.title, body: `<p>${esc(k.body)}</p><p class="mt-2">${UI.sourceChip(k.id)}</p>`, footer: UI.btn('Tutup', { variant: 'secondary', action: '__x' }), mount(el) { el.querySelector('[data-action="__x"]').addEventListener('click', UI.closePanels); } }); }
    },
    submit: {
      step(d, form) {
        const tpl = Store.calculatorTemplate(Router.currentView().params.jenis);
        const draft = Draft.get('calc:' + tpl.id) || {};
        tpl.steps[+d.langkah - 1].fields.forEach(f => { draft[f.key] = d[f.key]; });
        Draft.set('calc:' + tpl.id, draft);
        const n = +d.langkah;
        if (n < tpl.steps.length) Router.go(`#/kira/${tpl.type}?langkah=${n + 1}`);
        else { Draft.set('semak', { templateId: tpl.id }); Router.go('#/kira/semak'); }
      }
    }
  };
  function estimateHtml(tpl, calc) {
    if (!calc.due) return `<strong>Tidak diwajibkan tahun ini</strong><div class="small">Asas ${Fmt.rm(calc.base)} di bawah nisab ${Fmt.rm(calc.nisab)}. Anda masih boleh bersedekah melalui ${esc(PORTAL)}.</div><div class="mt-1">${UI.btn('Sedekah di ' + PORTAL, { variant: 'secondary', sm: true, href: 'portal-bayaran.html', external: true, icon: 'external' })}</div>`;
    return `<div class="muted small">Anggaran</div><div class="kpi__value">${Fmt.rm(calc.amount)}</div><div class="tiny muted">Berdasarkan kaedah rasmi Pusat Zakat</div>`;
  }

  /* ---------- Y5 Semak dan Bayar ---------- */
  function reviewSource(query) {
    if (query.calc) { const c = Store.calculation(query.calc); if (c) { const tpl = Store.calculatorTemplate(c.templateId) || Store.smeTemplate(c.templateId); return { tpl, inputs: c.inputs, saved: c, calc: tpl && tpl.steps ? evalFormula(tpl, c.inputs) : { amount: c.amount, base: c.amount / (SEED.meta.rate), nisab: SEED.meta.nisab, rate: SEED.meta.rate, due: true } }; } }
    const s = Draft.get('semak');
    if (s && s.templateId) { const tpl = Store.calculatorTemplate(s.templateId); const inputs = Draft.get('calc:' + s.templateId) || {}; if (tpl) return { tpl, inputs, saved: null, calc: evalFormula(tpl, inputs) }; }
    return null;
  }
  const Y5 = {
    path: '/kira/semak', id: 'Y5', title: 'Semakan', nav: 'kira', back: '#/kira', roles: payerRoles(),
    render(params, query) {
      const src = reviewSource(query);
      if (!src) return UI.emptyState({ icon: 'calc', text: 'Tiada pengiraan untuk disemak.', action: { label: 'Kira zakat', nav: '#/kira' } });
      const { tpl, calc, saved } = src;
      return `<div class="stack">
        <div class="card">
          <h3 class="card__title">Zakat ${esc(UI.label(tpl.type))}</h3>
          ${UI.kv([{ label: 'Nisab', value: Fmt.rm(calc.nisab) }, { label: 'Kadar', value: Fmt.pct(calc.rate, 1) }, { label: 'Jumlah', value: Fmt.rm(calc.amount), total: true }])}
          <div class="mt-1"><a data-action="working" class="small">${UI.icon('info')} cara pengiraan</a></div>
          ${saved ? `<div class="tiny muted mt-1">Pengiraan disimpan ${Fmt.date(saved.savedAt)} (${esc(saved.id)})</div>` : ''}
        </div>
        ${UI.note(`<strong>Bayar di ${esc(PORTAL)}</strong> — buka rasmi, resit kembali ke peti resit anda melalui rujukan. Platform ini tidak mengambil butiran kad.`, 'muted')}
        ${pinned(`<div class="stack stack--tight">${UI.btn('Bayar di ' + PORTAL, { block: true, action: 'pay', icon: 'external', disabled: calc.amount <= 0 })}${saved ? '' : UI.btn('Simpan dulu', { block: true, variant: 'secondary', action: 'save' })}</div>`)}
        <div style="height:72px"></div>
      </div>`;
    },
    actions: {
      working() { const src = reviewSource(Router.currentView().query); UI.openSheet({ title: 'Cara pengiraan', body: workingSheet(src.tpl, src.calc), footer: UI.btn('Tutup', { variant: 'secondary', action: '__x' }), mount(el) { el.querySelector('[data-action="__x"]').addEventListener('click', UI.closePanels); } }); },
      save() { const src = reviewSource(Router.currentView().query); const c = Store.saveCalculation(me().id, src.tpl.id, src.tpl.version, src.inputs, src.calc.amount); Draft.clear('semak'); Draft.clear('calc:' + src.tpl.id); UI.toast('Pengiraan disimpan untuk Utama', 'ok'); Router.go('#/'); },
      pay() {
        const src = reviewSource(Router.currentView().query);
        const c = src.saved || Store.saveCalculation(me().id, src.tpl.id, src.tpl.version, src.inputs, src.calc.amount);
        const ref = Store.handOff(c.id);
        Draft.clear('semak'); Draft.clear('calc:' + src.tpl.id);
        location.href = `portal-bayaran.html?ref=${encodeURIComponent(ref.ref)}`;
      }
    }
  };

  /* ---------- Y6 Sejarah Bayaran ---------- */
  const Y6 = {
    path: '/sejarah', id: 'Y6', title: 'Sejarah', nav: 'resit', back: '#/', roles: payerRoles(),
    render(params, query) {
      const years = Array.from(new Set(Store.payerPayments(me().id).map(p => p.date.slice(0, 4)))).sort().reverse();
      const year = query.tahun || years[0] || String(new Date().getFullYear());
      if (!years.includes(year)) years.unshift(year);
      const type = query.jenis || '';
      const rows = Store.payerPayments(me().id, year).filter(p => !type || p.type === type);
      const total = rows.reduce((a, p) => a + p.amount, 0);
      const types = Array.from(new Set(Store.payerPayments(me().id).map(p => p.type)));
      return `<div class="stack">
        <div class="row">${UI.select('tahun', years, year, { change: 'year' })}${UI.select('jenis', types.map(t => ({ value: t, label: UI.label(t) })), type, { change: 'type', placeholder: 'Semua jenis' })}</div>
        ${rows.length ? `<div class="list">${rows.map(p => UI.listItem({ title: `${Fmt.dateShort(p.date)} · ${UI.label(p.type)}`, sub: `${UI.label(p.channel)} · ${p.receipt || ''}`, rightHtml: `<strong>${Fmt.rm(p.amount)}</strong><br>${UI.badge('ok')}`, right: '' })).join('')}</div>
          <div class="card card--muted row row--between"><span>Jumlah tahun ${esc(year)}</span><strong>${Fmt.rm(total)}</strong></div>
          <p class="tiny muted">Baris disalin daripada rekod Pusat Zakat (baca sahaja) — dalam talian dan potongan gaji dalam satu sejarah.</p>`
          : UI.emptyState({ icon: 'receipt', text: 'Tiada bayaran direkod', action: { label: 'Kira zakat', nav: '#/kira' } })}
        <div class="center">${UI.btn('Peti resit', { variant: 'ghost', sm: true, nav: '#/resit' })}</div>
      </div>`;
    },
    change: {
      year(v) { const q = Router.parse(location.hash).query; Router.go(`#/sejarah?tahun=${v}${q.jenis ? '&jenis=' + q.jenis : ''}`); },
      type(v) { const q = Router.parse(location.hash).query; Router.go(`#/sejarah?tahun=${q.tahun || ''}${v ? '&jenis=' + v : ''}`); }
    }
  };

  /* ---------- Y7 Peti Resit ---------- */
  const Y7 = {
    path: '/resit', id: 'Y7', title: 'Resit digital', nav: 'resit', back: '#/', roles: payerRoles(),
    render(params, query) {
      const q = (query.cari || '').toLowerCase();
      const rows = Store.payerPayments(me().id).filter(p => p.receipt && (!q || p.receipt.toLowerCase().includes(q)));
      const pending = (Store.state().paymentRefs || []).filter(r => r.payerId === me().id && r.status === 'handed_off');
      return `<div class="stack">
        <div class="field"><input class="input" placeholder="cari no. resit" value="${esc(query.cari || '')}" data-input="search"></div>
        ${query.balik === 'tiada' && query.ref ? UI.note(`Kami sedang menunggu pengesahan daripada ${esc(PORTAL)}. Rujukan: <strong>${esc(query.ref)}</strong>. Resit akan muncul di sini setelah disahkan.`, 'warn') : ''}
        ${pending.length && !query.balik ? UI.note(`${pending.length} bayaran menunggu pengesahan: ${pending.map(r => esc(r.ref)).join(', ')}`, 'warn') : ''}
        ${rows.length ? `<div class="list">${rows.map(p => `<div class="list-item list-item--card"><div class="list-item__main"><div class="list-item__title">${esc(p.receipt)} <strong>${Fmt.rm(p.amount)}</strong></div><div class="list-item__sub">${Fmt.date(p.date)} · ${UI.label(p.type)} · ${UI.label(p.channel)}</div><div class="row mt-1">${UI.btn('PDF', { variant: 'secondary', sm: true, action: 'pdf', data: { no: p.receipt }, icon: 'download' })}${UI.btn('Kongsi', { variant: 'ghost', sm: true, action: 'share', data: { no: p.receipt }, icon: 'share' })}</div></div></div>`).join('')}</div>
          ${UI.btn('Muat turun semua tahun ini', { variant: 'secondary', block: true, action: 'all', icon: 'download' })}`
          : UI.emptyState({ icon: 'receipt', text: q ? 'Tiada resit sepadan' : 'Tiada resit lagi', action: q ? { label: 'Kosongkan carian', nav: '#/resit' } : { label: 'Kira zakat', nav: '#/kira' } })}
        <p class="tiny muted center">Resit rasmi Pusat Zakat disalin automatik selepas bayaran, dengan nombor rasminya.</p>
        <div class="center">${UI.btn('Sejarah bayaran', { variant: 'ghost', sm: true, nav: '#/sejarah' })}</div>
      </div>`;
    },
    mount(params, query) {
      if (query.balik === 'resit' && query.ref) {
        const already = Store.paymentRef(query.ref) && Store.paymentRef(query.ref).status === 'returned';
        const pay = Store.returnReceipt(query.ref);
        if (pay && !already) {
          UI.openSheet({ cls: 'sheet--success', title: 'Resit disimpan', body: `<div class="sheet__hero"><div class="sheet__check">${UI.icon('check')}</div></div><h2 class="center">${esc(pay.receipt)}</h2><p class="center">${Fmt.rm(pay.amount)} · ${UI.label(pay.type)} · ${Fmt.date(pay.date)}</p><p class="center small muted">Resit rasmi disalin ke peti anda. Kedua-dua serahan dan kepulangan direkod dalam jejak audit.</p>`, footer: UI.btn('Selesai', { block: true, action: '__x' }), mount(el) { el.querySelector('[data-action="__x"]').addEventListener('click', () => { UI.closePanels(); Router.go('#/resit'); }); } });
        }
      }
    },
    change: { search(v) { clearTimeout(Y7._t); Y7._t = setTimeout(() => Router.go(`#/resit?cari=${encodeURIComponent(v)}`), 350); } },
    actions: {
      pdf(d) { UI.toast(`Muat turun PDF ${d.no} (simulasi)`, 'ok'); },
      share(d) { UI.toast(`Helaian kongsi untuk ${d.no} (simulasi)`); },
      all() { UI.toast('Muat turun semua resit tahun ini (simulasi)', 'ok'); }
    }
  };

  /* ---------- Y8 Peringatan dan Kebenaran ---------- */
  const CONSENT_TEXT = (freq, channels) => `Saya bersetuju menerima peringatan zakat ${UI.label(freq).toLowerCase()} melalui ${channels.map(UI.label).join(', ')} daripada Pusat Zakat. Saya boleh menarik balik kebenaran ini pada bila-bila masa dan semua peringatan akan dihentikan serta-merta.`;
  const Y8 = {
    path: '/peringatan', id: 'Y8', title: 'Peringatan', nav: 'profil', back: '#/', roles: payerRoles(),
    render() {
      const consent = Store.payerConsent(me().id);
      const history = Store.payerConsents(me().id).filter(c => c.status === 'revoked');
      return `<div class="stack">
        <form data-submit="save" class="card stack stack--tight">
          <h3 class="card__title">Kekerapan</h3>
          ${UI.radios('frequency', ['monthly', 'yearly'], consent ? consent.frequency : '')}
          <h3 class="card__title mt-2">Saluran</h3>
          <div class="stack--tight stack">${['whatsapp', 'sms', 'email'].map(ch => UI.check('channels', ch, UI.label(ch), consent ? consent.channels.includes(ch) : false)).join('')}</div>
          <p class="tiny muted">Tiada saluran ditanda terlebih dahulu. Tiada mesej dihantar dalam prototaip.</p>
          <details class="small"><summary>Teks kebenaran yang dipersetujui</summary><p class="mt-1 muted" id="consent-preview">${esc(consent ? consent.text : 'Pilih kekerapan dan saluran untuk melihat teks.')}</p></details>
          ${UI.btn(consent ? 'Simpan sebagai kebenaran baharu' : 'Simpan', { type: 'submit', block: true })}
        </form>
        ${UI.consentBlock(consent, { revokeAction: 'revoke' })}
        ${history.length ? `<details class="small muted"><summary>${history.length} kebenaran terdahulu (ditarik balik)</summary>${history.map(c => `<div class="mt-1">${Fmt.date(c.grantedAt)} → ${Fmt.date(c.revokedAt)} · ${UI.label(c.frequency)} · ${c.channels.map(UI.label).join(', ')}</div>`).join('')}</details>` : ''}
        <p class="tiny muted">Setiap perubahan ialah acara audit. Menarik balik menghentikan setiap kerja peringatan untuk anda serta-merta.</p>
      </div>`;
    },
    submit: {
      save(d) {
        const channels = [].concat(d.channels || []).filter(Boolean);
        if (!d.frequency) { UI.toast('Pilih kekerapan dahulu', 'warn'); return; }
        if (!channels.length) { UI.toast('Pilih sekurang-kurangnya satu saluran', 'warn'); return; }
        Store.grantConsent(me().id, channels, d.frequency, CONSENT_TEXT(d.frequency, channels));
        UI.toast('Kebenaran disimpan', 'ok'); Router.rerender();
      }
    },
    actions: {
      revoke() { UI.confirm('Tarik balik kebenaran? Semua peringatan dihentikan serta-merta.', () => { Store.revokeConsent(me().id); UI.toast('Kebenaran ditarik balik', 'warn'); Router.rerender(); }, { yes: 'Tarik balik', danger: true }); }
    }
  };

  /* ---------- Y9 Profil ---------- */
  const Y9 = {
    path: '/profil', id: 'Y9', title: 'Profil', nav: 'profil', back: '#/', roles: payerRoles(),
    render() {
      const p = me(); const enr = Store.enrolmentFor(p.id); const emp = enr ? Store.employer(enr.employerId) : null;
      return `<div class="stack">
        <div class="card">
          <div class="row"><div class="account__avatar">${esc(Fmt.initials(p.name))}</div><div><h3>${esc(p.name)}</h3><div class="small muted">MyKad ${esc(Fmt.maskMyKad(p.mykadMasked || p.mykad))}</div></div></div>
          ${UI.kv([{ label: 'Telefon', value: p.phone || '—' }])}
          ${UI.field('Daerah', UI.select('district', SEED.districts, p.district, { change: 'district' }), 'Nama dan MyKad datang daripada Pusat Zakat (baca sahaja). Daerah boleh diubah.')}
        </div>
        <div class="card">
          <h3 class="card__title">${esc(SEED.meta.scheme)}</h3>
          ${enr ? UI.kv([{ label: 'Majikan', value: emp ? emp.name : '—' }, { label: 'Potongan', value: `${Fmt.rm(enr.amount)}/bln` }, { label: 'Status', html: UI.badge(enr.status) }]) : '<p class="small muted">Belum mendaftar potongan gaji.</p>'}
          <div class="mt-2">${UI.btn(enr ? 'Urus' : 'Daftar', { variant: 'secondary', block: true, nav: '#/potongan-gaji' })}</div>
        </div>
        <div class="card"><div class="row row--between"><span>Peringatan dan kebenaran</span>${UI.btn('Buka', { variant: 'ghost', sm: true, nav: '#/peringatan' })}</div></div>
        ${UI.btn('Log keluar', { variant: 'danger', block: true, action: 'logout' })}
      </div>`;
    },
    change: { district(v) { Store.updatePayerDistrict(me().id, v); UI.toast('Daerah dikemas kini', 'ok'); } },
    actions: { logout() { Store.logout(); location.href = 'index.html'; } }
  };

  /* ---------- Y10 Tanya AI ---------- */
  const Y10 = {
    path: '/tanya', id: 'Y10', title: 'Pembantu Zakat', nav: 'tanya', back: '#/', roles: payerRoles(),
    render() {
      const conv = Store.conversation(me().id);
      const bubbles = conv.map(m => {
        if (m.ticketId && m.role === 'assistant') return `<div class="chat__bubble chat__bubble--escalated">Dihantar ke pegawai, ${esc(m.ticketId)}<br><span class="tiny">${esc(m.text)}</span></div>`;
        if (m.role === 'officer') return `<div class="chat__bubble chat__bubble--ai"><div class="tiny muted">Pegawai · ${esc(m.ticketId || '')}</div>${esc(m.text)}</div>`;
        if (m.role === 'assistant') return `<div class="chat__bubble chat__bubble--ai">${esc(m.text)}${m.knowledgeId ? `<div class="chat__sources">${UI.sourceChip(m.knowledgeId)}</div>` : ''}</div>`;
        return `<div class="chat__bubble chat__bubble--me">${esc(m.text)}</div>`;
      }).join('');
      return `<div class="stack">
        <div class="chat" id="chat">
          <div class="chat__bubble chat__bubble--ai chat__intro">${esc(SEED.assistantIntro)}<div class="tiny mt-1">${esc(SEED.assistantFixedText)}</div></div>
          ${bubbles}
        </div>
        <div class="row" style="flex-wrap:wrap;gap:6px">${['nisab 2026?', 'cara bayar', 'borang bantuan pelajar'].map(s => UI.btn(s, { variant: 'secondary', sm: true, action: 'quick', data: { q: s } })).join('')}</div>
        ${pinned(`<div class="stack stack--tight"><form data-submit="ask" class="chat__composer"><input class="input" name="q" placeholder="tulis..." autocomplete="off" required><button class="btn btn--primary" type="submit" aria-label="Hantar">${UI.icon('arrow')}</button></form>${UI.btn('Hubungi pegawai', { variant: 'secondary', block: true, sm: true, action: 'officer' })}</div>`)}
        <div style="height:110px"></div>
      </div>`;
    },
    mount() { window.scrollTo(0, document.body.scrollHeight); },
    submit: { ask(d) { const r = Store.assistantAsk(me().id, d.q); if (r.kind === 'escalated') UI.toast(`Dieskalasi: ${UI.label(r.reason)}`, 'warn'); Router.rerender(); } },
    actions: {
      quick(d) { const r = Store.assistantAsk(me().id, d.q); if (r.kind === 'escalated') UI.toast(`Dieskalasi: ${UI.label(r.reason)}`, 'warn'); Router.rerender(); },
      officer() { const t = Store.requestOfficer(me().id); UI.toast(`Tiket ${t.id} dibuka dengan perbualan dilampirkan`, 'ok'); Router.rerender(); }
    }
  };

  /* ---------- Y11 Daftar Skim Potongan Gaji ---------- */
  const Y11 = {
    path: '/potongan-gaji', id: 'Y11', title: SEED.meta.scheme, nav: 'profil', back: '#/profil', roles: payerRoles(),
    render() {
      const p = me(); const enr = Store.enrolmentFor(p.id);
      if (enr) {
        const emp = Store.employer(enr.employerId);
        return `<div class="stack">
          <div class="card">
            ${UI.kv([{ label: 'Majikan', value: emp ? emp.name : '—' }, { label: 'No. pekerja', value: enr.employeeNo }, { label: 'Potongan bulanan', value: Fmt.rm(enr.amount), total: true }, { label: 'Status', html: UI.badge(enr.status) }])}
            <p class="tiny muted mt-1">${enr.status === 'pending_hr' ? 'status: menunggu HR mengesahkan di portal majikan.' : enr.status === 'stopping' ? 'Berhenti berkuat kuasa dari gaji seterusnya.' : `Aktif sejak ${Fmt.date(enr.confirmedAt)}.`}</p>
          </div>
          ${UI.consentBlock({ text: 'Saya bersetuju dengan potongan gaji bulanan untuk zakat dan perkongsian data pendaftaran saya dengan majikan.', grantedAt: enr.consentGivenAt || enr.requestedAt, frequency: 'monthly', channels: ['email'] })}
          ${enr.status === 'active' || enr.status === 'pending_hr' ? `<div class="row">${UI.btn('Ubah jumlah', { variant: 'secondary', action: 'amount' })}${UI.btn('Hentikan potongan', { variant: 'danger', action: 'stop' })}</div>` : ''}
        </div>`;
      }
      const emps = Store.approvedEmployers();
      const calc = Store.lastCalculation(p.id);
      const suggested = calc ? Math.max(10, Math.round(calc.amount / 12)) : '';
      return `<div class="stack">
        <form data-submit="enrol" class="card stack stack--tight">
          ${UI.field('Majikan', UI.select('employerId', emps.map(e => ({ value: e.id, label: e.name })), p.employerId || '', { placeholder: 'cari...' }), 'Hanya majikan yang diluluskan Pusat Zakat disenaraikan.')}
          ${UI.field('No. pekerja', UI.input('employeeNo', { placeholder: 'E-0012', required: true }))}
          ${UI.field('Potongan bulanan', UI.input('amount', { rm: true, value: suggested, required: true }), calc ? `(i) Cadangan ${Fmt.rm(suggested)}/bulan daripada pengiraan terakhir anda (${Fmt.rm(calc.amount)} setahun).` : '(i) Kira zakat dahulu untuk cadangan jumlah bulanan.')}
          ${UI.check('agree', '1', 'Saya bersetuju dengan <strong>potongan gaji</strong> bulanan ini <strong>dan</strong> perkongsian data pendaftaran saya dengan majikan.', false)}
          ${UI.btn('Hantar ke HR', { type: 'submit', block: true })}
          <p class="tiny muted">status: menunggu HR selepas dihantar · aktif selepas HR mengesahkan · permintaan berhenti berkuat kuasa dari gaji seterusnya (acara audit).</p>
        </form>
      </div>`;
    },
    submit: {
      enrol(d) {
        if (!d.employerId) { UI.toast('Pilih majikan', 'warn'); return; }
        if (!d.agree) { UI.toast('Tandakan persetujuan dahulu — tiada potongan tanpa kebenaran', 'warn'); return; }
        Store.requestEnrolment(me().id, d.employerId, Fmt.parseMoney(d.amount));
        UI.toast('Dihantar ke HR', 'ok'); Router.rerender();
      }
    },
    actions: {
      amount() {
        const enr = Store.enrolmentFor(me().id);
        UI.openSheet({ title: 'Ubah jumlah bulanan', body: `<form id="amt" class="stack stack--tight">${UI.field('Potongan bulanan', UI.input('amount', { rm: true, value: enr.amount }))}</form>`, footer: UI.btn('Simpan', { block: true, action: '__ok' }), mount(el) { el.querySelector('[data-action="__ok"]').addEventListener('click', () => { const v = Fmt.parseMoney(el.querySelector('[name=amount]').value); if (v > 0) { Store.updateEnrolmentAmount(enr.id, v); UI.toast('Jumlah dikemas kini (berkuat kuasa gaji seterusnya)', 'ok'); } UI.closePanels(); Router.rerender(); }); } });
      },
      stop() { const enr = Store.enrolmentFor(me().id); UI.confirm('Hentikan potongan gaji? Berkuat kuasa dari gaji seterusnya.', () => { Store.stopEnrolment(enr.id, 'pekerja'); UI.toast('Permintaan berhenti direkod', 'warn'); Router.rerender(); }, { yes: 'Hentikan', danger: true }); }
    }
  };

  /* ---------- shared source viewer ---------- */
  const SRC = {
    path: '/sumber/:id', id: 'SRC', title: 'Sumber', back: '#/',
    render(params) {
      const k = Store.knowledge(params.id);
      if (!k || k.status !== 'published') return UI.emptyState({ icon: 'doc', text: 'Sumber ini belum diterbitkan dan tidak boleh dirujuk.', action: { label: 'Kembali', nav: '#/' } });
      return `<div class="stack"><div class="card"><div class="muted small">${esc(UI.label(k.kind))} · ${esc(Fmt.knowledgeRef(k.id))} · v${esc(k.version)}</div><h2>${esc(k.title)}</h2><div class="rule-ornament rule-ornament--left"></div><p>${esc(k.body)}</p><div class="mt-2">${UI.badge('published')} <span class="tiny muted">diterbit ${Fmt.date(k.publishedAt)} · diluluskan ${k.approver ? esc((Store.officer(k.approver) || {}).name || k.approver) : '—'}</span></div></div>${UI.fixedText(SEED.assistantFixedText)}</div>`;
    }
  };

  /* ---------- shell chrome: bottom nav swaps Kira <-> Perniagaan in SME mode ---------- */
  function renderNav() {
    const nav = document.getElementById('bottom-nav');
    const cur = Router.currentView();
    if (!nav) return;
    if (cur && cur.view.hideNav) { nav.classList.add('hidden'); return; }
    nav.classList.remove('hidden');
    const sme = Store.session().smeMode;
    const items = [
      { id: 'utama', label: 'Utama', icon: 'home', hash: '#/' },
      sme ? { id: 'perniagaan', label: 'Perniagaan', icon: 'store', hash: '#/perniagaan' } : { id: 'kira', label: 'Kira', icon: 'calc', hash: '#/kira' },
      { id: 'resit', label: 'Resit', icon: 'receipt', hash: '#/resit' },
      { id: 'tanya', label: 'Tanya', icon: 'chat', hash: '#/tanya' },
      { id: 'profil', label: 'Profil', icon: 'user', hash: '#/profil' }
    ];
    nav.innerHTML = items.map(i => `<a class="bottom-nav__item ${cur && cur.view.nav === i.id ? 'active' : ''}" data-nav="${i.hash}" data-nav-id="${i.id}">${UI.icon(i.icon)}<span>${i.label}</span></a>`).join('');
  }

  window.renderPayerNav = renderNav; // sme.js calls this after switching SME mode on
  // Y5 (/kira/semak) is registered before Y4 (/kira/:jenis) so "semak" is never read as a calculator type.
  const views = [Y1, Y1otp, Y1district, Y2, Y3, Y5, Y4, Y6, Y7, Y8, Y9, Y10, Y11, SRC].concat(window.SME_VIEWS || []);
  Router.register(views);
  Router.start({ defaultHash: '#/masuk', requireRoles: payerRoles(), onRender: renderNav });
})();
