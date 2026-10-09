/* ZakatTech 360 prototype — SME Zakat360 mode inside the payer shell: S1 Pilih Industri, S2 Soal Selidik Berpandu,
 * S3 Penjelasan Pengiraan, S4 Semakan Kesihatan Perniagaan, S5 Temu Janji Pegawai, S6 Kes Saya.
 * Loaded before payer.js; exposes window.SME_VIEWS which payer.js registers alongside Y1-Y11. */
(function () {
  const esc = UI.esc;
  const ROLES = ['payer', 'sme_owner'];
  const Draft = {
    get(key) { try { return JSON.parse(sessionStorage.getItem('zt360.sme.' + key) || 'null'); } catch (e) { return null; } },
    set(key, val) { try { sessionStorage.setItem('zt360.sme.' + key, JSON.stringify(val)); } catch (e) { /* ignore */ } },
    clear(key) { try { sessionStorage.removeItem('zt360.sme.' + key); } catch (e) { /* ignore */ } }
  };
  function me() { return Store.currentPayer(); }
  function pinned(html) { return `<div class="cta-pinned">${html}</div>`; }
  function current() { return Draft.get('current') || {}; } // { industry, answers: {key: value|'unsure'}, unsureCount, business }
  function setCurrent(patch) { const c = Object.assign(current(), patch); Draft.set('current', c); return c; }

  /* ---------- working from the template's question groups (asset / liability / pnl) ---------- */
  function compute(tpl, answers) {
    const val = k => { const v = answers[k]; return v === 'unsure' || v === undefined ? 0 : Fmt.parseMoney(v); };
    const sum = g => tpl.questions.filter(q => q.group === g).reduce((a, q) => a + val(q.key), 0);
    const assets = sum('asset'), liabilities = sum('liability');
    const base = Math.max(0, assets - liabilities);
    const nisab = SEED.meta.nisab, rate = SEED.meta.rate;
    const due = base >= nisab;
    const pnl = {};
    tpl.questions.filter(q => q.group === 'pnl').forEach(q => { pnl[q.key] = val(q.key); });
    return { assets, liabilities, base, nisab, rate, due, amount: due ? Math.round(base * rate) : 0, pnl };
  }
  function lineKnowledge(tpl, i) { const l = (tpl.lines || [])[i]; return l && l.knowledgeId && Store.isPublished(l.knowledgeId) ? l.knowledgeId : (Store.isPublished(tpl.id) ? tpl.id : null); }

  /* ---------- S1 Pilih Industri ---------- */
  const S1 = {
    path: '/perniagaan', id: 'S1', title: 'Zakat Perniagaan', nav: 'perniagaan', back: '#/', roles: ROLES,
    render() {
      const tpls = Store.smeTemplates();
      const cases = Store.payerCases(me().id);
      return `<div class="stack">
        <h3>Jenis perniagaan</h3>
        <div class="list">${tpls.map(t => UI.listItem({ title: t.label, sub: `Templat v${t.version} · kaedah ${t.method}`, nav: `#/perniagaan/soal-selidik?industri=${t.industry}&q=1`, icon: 'store', right: '›', card: true })).join('')}</div>
        <p class="tiny muted">Templat ikut industri disahkan pegawai dan diterbitkan selepas semakan Syariah (${tpls.length} tersedia).</p>
        ${cases.length ? UI.note(`Anda ada ${cases.length} kes. ${UI.btn('Kes saya', { variant: 'ghost', sm: true, nav: '#/perniagaan/kes' })}`) : ''}
      </div>`;
    },
    mount() { if (!Store.session().smeMode) { Store.setSmeMode(true); if (window.renderPayerNav) window.renderPayerNav(); } }
  };

  /* ---------- S2 Soal Selidik Berpandu ---------- */
  const S2 = {
    path: '/perniagaan/soal-selidik', id: 'S2', title: 'Soal selidik', nav: 'perniagaan', back: '#/perniagaan', roles: ROLES,
    render(params, query) {
      const tpl = Store.smeTemplate(query.industri);
      if (!tpl) return UI.emptyState({ icon: 'store', text: 'Templat ini belum diterbitkan.', action: { label: 'Pilih industri', nav: '#/perniagaan' } });
      let c = current();
      if (c.industry !== tpl.industry) c = setCurrent({ industry: tpl.industry, answers: {}, unsureCount: 0, business: c.business || '' });
      const n = Math.min(tpl.questions.length, Math.max(1, parseInt(query.q || '1', 10)));
      const q = tpl.questions[n - 1];
      const v = (c.answers || {})[q.key];
      const offerOfficer = (c.unsureCount || 0) >= 2;
      return `<div class="stack">
        ${UI.stepper(n, tpl.questions.length, tpl.label)}
        <form data-submit="answer" class="card stack stack--tight">
          <h3 class="card__title">${esc(q.label)}</h3>
          ${q.kind === 'money' ? UI.input('value', { rm: true, value: v && v !== 'unsure' ? v : '', placeholder: q.example || '' }) : UI.input('value', { value: v && v !== 'unsure' ? v : '' })}
          ${UI.check('unsure', '1', 'Tidak pasti', v === 'unsure')}
          <div class="note note--muted small">${UI.icon('info')} ${esc(q.help || '')}${q.example ? `<div class="tiny muted mt-1">${esc(q.example)}</div>` : ''}</div>
          ${offerOfficer ? UI.note(`Dua jawapan "tidak pasti" — pegawai boleh membantu. ${UI.btn('Temu janji pegawai', { variant: 'secondary', sm: true, nav: '#/perniagaan/temu-janji' })}`, 'warn') : ''}
          <input type="hidden" name="q" value="${n}"><input type="hidden" name="industri" value="${esc(tpl.industry)}">
          <div class="row">${n > 1 ? UI.btn('Kembali', { variant: 'secondary', nav: `#/perniagaan/soal-selidik?industri=${tpl.industry}&q=${n - 1}` }) : ''}<span style="flex:1"></span>${UI.btn(n === tpl.questions.length ? 'Lihat keputusan' : 'Terus', { type: 'submit' })}</div>
        </form>
        <p class="tiny muted">Jawapan disimpan setiap soalan bersama versi templat (v${esc(tpl.version)}) supaya pegawai melihat apa yang anda masukkan.</p>
      </div>`;
    },
    submit: {
      answer(d) {
        const tpl = Store.smeTemplate(d.industri);
        const c = current(); c.answers = c.answers || {};
        const q = tpl.questions[+d.q - 1];
        const wasUnsure = c.answers[q.key] === 'unsure';
        c.answers[q.key] = d.unsure ? 'unsure' : d.value;
        if (d.unsure && !wasUnsure) c.unsureCount = (c.unsureCount || 0) + 1;
        if (!d.unsure && wasUnsure) c.unsureCount = Math.max(0, (c.unsureCount || 0) - 1);
        setCurrent(c);
        const n = +d.q;
        if (n < tpl.questions.length) Router.go(`#/perniagaan/soal-selidik?industri=${tpl.industry}&q=${n + 1}`);
        else Router.go('#/perniagaan/keputusan');
      }
    }
  };

  /* ---------- S3 Penjelasan Pengiraan ---------- */
  const S3 = {
    path: '/perniagaan/keputusan', id: 'S3', title: 'Keputusan', nav: 'perniagaan', back: '#/perniagaan', roles: ROLES,
    render() {
      const c = current(); const tpl = c.industry ? Store.smeTemplate(c.industry) : null;
      if (!tpl) return UI.emptyState({ icon: 'store', text: 'Jawab soal selidik dahulu.', action: { label: 'Pilih industri', nav: '#/perniagaan' } });
      const r = compute(tpl, c.answers || {});
      const rows = [
        { label: 'Aset semasa', value: Fmt.rm(r.assets), knowledgeId: lineKnowledge(tpl, 0) },
        { label: '- Liabiliti semasa', value: Fmt.rm(r.liabilities), knowledgeId: lineKnowledge(tpl, 1) },
        { label: '= Asas zakat', value: Fmt.rm(r.base), knowledgeId: lineKnowledge(tpl, 2) },
        { label: `x ${Fmt.pct(r.rate, 1)}`, value: Fmt.rm(r.amount), total: true, knowledgeId: lineKnowledge(tpl, 3) }
      ];
      const unsure = Object.values(c.answers || {}).filter(v => v === 'unsure').length;
      return `<div class="stack">
        <div class="card">
          <div class="muted small">Kaedah: ${esc(tpl.method)} · ${esc(tpl.label)} v${esc(tpl.version)}</div>
          ${UI.kv(rows, { tappable: true })}
          <p class="tiny muted mt-1">Setiap baris boleh ditekan → rujukan yang diterbitkan.</p>
          ${!r.due ? UI.note(`Asas ${Fmt.rm(r.base)} di bawah nisab ${Fmt.rm(r.nisab)} — tidak diwajibkan tahun ini.`) : ''}
          ${unsure ? UI.note(`${unsure} jawapan "tidak pasti" dikira sebagai RM 0. Pegawai boleh mengesahkan angka sebenar.`, 'warn') : ''}
        </div>
        <div class="card card--muted">${UI.fixedText('Panduan, bukan fatwa')}<div class="row mt-1">${UI.btn('Tanya pegawai', { variant: 'secondary', sm: true, nav: '#/perniagaan/temu-janji' })}${UI.btn('Kesihatan ringkas', { variant: 'ghost', sm: true, nav: '#/perniagaan/kesihatan' })}${UI.btn('Kes saya', { variant: 'ghost', sm: true, nav: '#/perniagaan/kes' })}</div></div>
        ${pinned(UI.btn('Bayar di ' + SEED.meta.portal, { block: true, action: 'pay', icon: 'external', disabled: r.amount <= 0 }))}
        <div style="height:72px"></div>
      </div>`;
    },
    actions: {
      pay() {
        const c = current(); const tpl = Store.smeTemplate(c.industry); const r = compute(tpl, c.answers || {});
        const calc = Store.saveCalculation(me().id, tpl.id, tpl.version, c.answers, r.amount);
        const ref = Store.handOff(calc.id);
        location.href = `portal-bayaran.html?ref=${encodeURIComponent(ref.ref)}`;
      }
    }
  };

  /* ---------- S4 Semakan Kesihatan Perniagaan ---------- */
  const S4 = {
    path: '/perniagaan/kesihatan', id: 'S4', title: 'Kesihatan ringkas', nav: 'perniagaan', back: '#/perniagaan/keputusan', roles: ROLES,
    render() {
      const c = current(); const tpl = c.industry ? Store.smeTemplate(c.industry) : null;
      if (!tpl) return UI.emptyState({ icon: 'chart', text: 'Jawab soal selidik dahulu.', action: { label: 'Pilih industri', nav: '#/perniagaan' } });
      const r = compute(tpl, c.answers || {});
      const ratio = (a, b) => b > 0 ? (a / b).toFixed(1) : '—';
      const pnlKeys = Object.keys(r.pnl);
      const sales = r.pnl.annualSales !== undefined ? r.pnl.annualSales : (pnlKeys[0] ? r.pnl[pnlKeys[0]] : 0);
      const cost = r.pnl.costOfSales !== undefined ? r.pnl.costOfSales : (pnlKeys[1] ? r.pnl[pnlKeys[1]] : 0);
      const margin = sales > 0 ? Fmt.pct((sales - cost) / sales) : '—';
      const cashKey = tpl.questions.find(q => /cash|tunai|wallet/i.test(q.key + q.label));
      const cash = cashKey ? Fmt.parseMoney((c.answers || {})[cashKey.key]) : 0;
      const cashOk = cash > 0 && cash >= r.liabilities * 0.25;
      return `<div class="stack">
        <div class="card">
          ${UI.kv([
            { label: 'Nisbah semasa', value: ratio(r.assets, r.liabilities) },
            { label: 'Nisbah hutang', value: ratio(r.liabilities, r.assets) },
            { label: 'Margin kasar', value: margin },
            { label: 'Aliran tunai', html: UI.badge(cashOk ? 'ok' : 'menunggu', cashOk ? 'ok' : 'perhatian') }
          ])}
        </div>
        <div class="card"><h3 class="card__title">3 nota ringkas</h3><ul class="small stack stack--tight">${(tpl.healthNotes || []).slice(0, 3).map(n => `<li>${esc(n)}</li>`).join('')}</ul></div>
        ${UI.note('Semakan ini dikira daripada jawapan anda sahaja. Bukan nasihat kewangan; tiada data luar ditarik.', 'muted')}
      </div>`;
    }
  };

  /* ---------- S5 Temu Janji Pegawai ---------- */
  function nextWeekdays(from, count) {
    const out = []; const d = Fmt.parse(from); d.setDate(d.getDate() + 1);
    while (out.length < count) { if (d.getDay() >= 1 && d.getDay() <= 5) out.push(Fmt.toIso(new Date(d))); d.setDate(d.getDate() + 1); }
    return out;
  }
  const S5 = {
    path: '/perniagaan/temu-janji', id: 'S5', title: 'Temu janji', nav: 'perniagaan', back: '#/perniagaan/keputusan', roles: ROLES,
    render(params, query) {
      const p = me(); const c = current();
      const officers = Store.officersFor(p.district, c.industry).length ? Store.officersFor(p.district, c.industry) : Store.officersFor(null, c.industry).length ? Store.officersFor(null, c.industry) : Store.officersFor();
      const officerId = query.pegawai && officers.find(o => o.id === query.pegawai) ? query.pegawai : (officers[0] || {}).id;
      const dates = nextWeekdays(SEED.meta.today > Fmt.todayIso() ? SEED.meta.today : Fmt.todayIso(), 5);
      const date = query.tarikh && dates.includes(query.tarikh) ? query.tarikh : dates[0];
      const slots = Store.officerSlots(officerId, date);
      const free = slots.filter(s => s.status === 'free');
      const anyFree = dates.some(d => Store.officerSlots(officerId, d).some(s => s.status === 'free'));
      const slot = query.slot && free.find(s => s.time === query.slot) ? query.slot : '';
      const existing = Store.payerCases(p.id).find(k => k.industry === c.industry && k.status !== 'closed');
      return `<div class="stack">
        <form data-submit="book" class="card stack stack--tight">
          ${UI.field('Pegawai dibenarkan', UI.select('officerId', officers.map(o => ({ value: o.id, label: `${o.name}${o.district ? ' · ' + o.district : ''}` })), officerId, { change: 'officer' }), 'Ditapis mengikut daerah dan industri anda.')}
          <div class="field"><label>Cara</label>${UI.radios('mode', ['telefon', 'pejabat', 'video'], query.cara || 'telefon')}</div>
          ${UI.field('Tarikh', UI.select('date', dates.map(d => ({ value: d, label: `${Fmt.dayName(d)} ${Fmt.date(d)}` })), date, { change: 'date' }))}
          <div class="field"><label>Slot</label>${free.length ? `<div class="row">${free.map(s => UI.btn(s.time, { variant: s.time === slot ? 'primary' : 'secondary', sm: true, nav: `#/perniagaan/temu-janji?pegawai=${officerId}&tarikh=${date}&slot=${s.time}&cara=${query.cara || 'telefon'}` })).join('')}</div>` : `<div class="small muted">Tiada slot kosong pada tarikh ini.</div>`}</div>
          <input type="hidden" name="slot" value="${esc(slot)}">
          ${UI.field('Nota', UI.input('note', { placeholder: 'contoh: stok akhir tahun tidak pasti' }))}
          ${existing ? `<div class="tiny muted">Dilampirkan pada kes ${esc(existing.id)}.</div>` : '<div class="tiny muted">Tempahan membuka kes baharu dan melampirkan soal selidik anda.</div>'}
          ${UI.btn('Tempah', { type: 'submit', block: true, disabled: !slot })}
        </form>
        ${!anyFree ? UI.note(`Tiada slot minggu ini. ${UI.btn('Minta pegawai hubungi saya', { variant: 'secondary', sm: true, action: 'callback' })}`, 'warn') : ''}
      </div>`;
    },
    change: {
      officer(v) { const q = Router.parse(location.hash).query; Router.go(`#/perniagaan/temu-janji?pegawai=${v}&tarikh=${q.tarikh || ''}&cara=${q.cara || 'telefon'}`); },
      date(v) { const q = Router.parse(location.hash).query; Router.go(`#/perniagaan/temu-janji?pegawai=${q.pegawai || ''}&tarikh=${v}&cara=${q.cara || 'telefon'}`); }
    },
    submit: {
      book(d) {
        if (!d.slot) { UI.toast('Pilih slot dahulu', 'warn'); return; }
        const c = current(); const tpl = c.industry ? Store.smeTemplate(c.industry) : null;
        const existing = Store.payerCases(me().id).find(k => k.industry === c.industry && k.status !== 'closed');
        const r = tpl ? compute(tpl, c.answers || {}) : { amount: 0 };
        const apt = Store.bookAppointment({ caseId: existing ? existing.id : null, payerId: me().id, officerId: d.officerId, date: d.date, time: d.slot, mode: d.mode, note: d.note, business: c.business || `Perniagaan ${me().name.split(' ')[0]}`, industry: c.industry || 'runcit', templateId: tpl ? tpl.id : 'TPL-RUNCIT', version: tpl ? tpl.version : 1, answers: c.answers || {}, systemAmount: r.amount });
        UI.toast(`Ditempah: ${Fmt.date(d.date)} ${d.slot}`, 'ok');
        Router.go(`#/perniagaan/kes/${apt.caseId}`);
      }
    },
    actions: {
      callback() { const existing = Store.payerCases(me().id)[0]; Store.requestCallback(existing ? existing.id : '—', me().id, null); UI.toast('Permintaan direkod — pegawai akan hubungi anda', 'ok'); }
    }
  };

  /* ---------- S6 Kes Saya ---------- */
  const S6 = {
    path: '/perniagaan/kes', id: 'S6', title: 'Kes saya', nav: 'perniagaan', back: '#/perniagaan', roles: ROLES,
    render() {
      const cases = Store.payerCases(me().id);
      const msgs = cases.reduce((a, k) => a + (k.messages || []).filter(m => m.from === 'officer').length, 0);
      return `<div class="stack">
        ${cases.length ? `<div class="list">${cases.map(k => UI.listItem({ title: `${k.id} · ${UI.label(k.industry)}`, sub: `${k.business} · ${k.status === 'referred' ? 'Dirujuk' : 'Dihantar'} ${Fmt.dateShort(k.submitted)}`, rightHtml: UI.badge(k.status, k.status === 'new' ? 'menunggu pegawai' : undefined), right: '', nav: `#/perniagaan/kes/${k.id}`, card: true })).join('')}</div>` : UI.emptyState({ icon: 'store', text: 'Tiada kes lagi.', action: { label: 'Mula soal selidik', nav: '#/perniagaan' } })}
        ${cases.length ? `<div class="card card--muted row row--between"><span>Mesej pegawai</span><strong>${msgs}</strong></div>` : ''}
      </div>`;
    }
  };
  const S6detail = {
    path: '/perniagaan/kes/:id', id: 'S6', title: p => p.id, nav: 'perniagaan', back: '#/perniagaan/kes', roles: ROLES,
    render(params) {
      const k = Store.smeCase(params.id);
      if (!k || k.payerId !== me().id) return UI.emptyState({ icon: 'store', text: 'Kes tidak dijumpai.', action: { label: 'Kes saya', nav: '#/perniagaan/kes' } });
      const officer = k.officerId ? Store.officer(k.officerId) : null;
      const apts = Store.appointments().filter(a => a.caseId === k.id);
      return `<div class="stack">
        <div class="card">
          ${UI.kv([{ label: 'Perniagaan', value: k.business }, { label: 'Industri', value: UI.label(k.industry) }, { label: 'Dihantar', value: Fmt.date(k.submitted) }, { label: 'Pegawai', value: officer ? officer.name : 'belum ditugaskan' }, { label: 'Status', html: UI.badge(k.status) }])}
          ${k.verifiedAmount !== null && k.verifiedAmount !== undefined ? `<div class="card card--success mt-2"><div class="muted small">Angka disahkan pegawai</div><div class="kpi__value">${Fmt.rm(k.verifiedAmount)}</div>${k.verifiedAmount !== k.systemAmount ? `<div class="tiny muted">Pengiraan sistem: ${Fmt.rm(k.systemAmount)} (dibetulkan)</div>` : ''}</div>`
            : `<p class="tiny muted mt-1">Angka pegawai dipaparkan hanya selepas pegawai menandakan Sahkan.</p>`}
        </div>
        ${apts.length ? `<div class="card"><h3 class="card__title">Temu janji</h3>${apts.map(a => `<div class="small">${Fmt.dayName(a.date)} ${Fmt.date(a.date)} ${esc(a.time)} · ${UI.label(a.mode)} · ${esc((Store.officer(a.officerId) || {}).name || '')}</div>`).join('')}</div>` : ''}
        <div class="card"><h3 class="card__title">Mesej pegawai (${(k.messages || []).filter(m => m.from === 'officer').length})</h3>
          <div class="chat">${(k.messages || []).map(m => `<div class="chat__bubble ${m.from === 'officer' ? 'chat__bubble--ai' : 'chat__bubble--me'}"><div class="tiny muted">${m.from === 'officer' ? 'Pegawai' : 'Anda'} · ${Fmt.dateTime(m.at)}</div>${esc(m.text)}</div>`).join('') || '<div class="small muted">Tiada mesej lagi.</div>'}</div>
          <form data-submit="message" class="chat__composer mt-2"><input class="input" name="text" placeholder="tulis kepada pegawai..." required><button class="btn btn--primary" type="submit" aria-label="Hantar">${UI.icon('arrow')}</button></form>
        </div>
      </div>`;
    },
    submit: { message(d, form) { Store.addCaseMessage(Router.currentView().params.id, 'owner', d.text); Router.rerender(); } }
  };

  window.SME_VIEWS = [S1, S2, S3, S4, S5, S6, S6detail];
})();
