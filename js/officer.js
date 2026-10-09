/* ZakatTech 360 prototype — officer console work views: O1 Dashboard, O2 Barisan Nasihat PKS, O3 Butiran Kes,
 * O4 Kalendar Temu Janji, O5 Peti Eskalasi AI, plus the start block that registers every console view.
 * Rail and view roles follow section 2.1 (rule 10: absent, not disabled). Every change goes through Store. */
(function () {
  const { esc, WORK, ALL, SLOT_TIMES, INDUSTRIES, CASE_STATUSES, KNOWLEDGE_ORDER, SECTOR_LABELS, GATEWAY_LABELS, AI_PROVIDERS, openedCases, role, isWork, me, officerName, caseOfficers, refToday, addDays, mondayOf, buildHash, setQuery, replaceQuery, currentParams, done, eventsFor, textarea, hidden, applySearch, toolbar, backBtn, counts, NAV, renderRail } = window.OfficerKit;
  const O1 = {
    path: '/', id: 'O1', title: 'Dashboard Pegawai', nav: 'dashboard', roles: WORK,
    render() {
      const c = counts();
      const today = refToday();
      const o = me();
      const mine = Store.appointments()
        .filter(a => a.date === today && (role() === 'admin' || (o && a.officerId === o.id)))
        .sort((a, b) => a.time.localeCompare(b.time));
      const tasks = mine.length ? `<div class="list">${mine.map(a => UI.listItem({
        title: `${a.time}  ${a.business} (${UI.label(a.mode)})`,
        sub: (role() === 'admin' ? officerName(a.officerId) + ' · ' : '') + (a.note || ''),
        right: a.caseId || 'tiada kes',
        nav: a.caseId ? `#/kes/${a.caseId}` : `#/temu-janji?minggu=${mondayOf(a.date)}`,
        icon: 'calendar'
      })).join('')}</div>` : UI.emptyState({ icon: 'calendar', text: 'Tiada temu janji hari ini.' });
      return `
        ${UI.pageHead('Dashboard Pegawai', '', `Salam, ${esc(o ? o.name : '')} · ${esc(Fmt.dayName(today))}, ${esc(Fmt.date(today))}`)}
        <div class="counters">
          ${UI.counter({ label: 'Kes PKS baru', value: c.casesNew, href: '#/kes', warn: c.casesNew > 0 })}
          ${UI.counter({ label: 'Eskalasi AI', value: c.escNew, href: '#/eskalasi', warn: c.escNew > 0 })}
          ${UI.counter({ label: 'Temu janji', value: c.apts, href: '#/temu-janji' })}
          ${UI.counter({ label: 'Kandungan semak', value: c.review, href: '#/kandungan' })}
          ${UI.counter({ label: 'Majikan tunggu', value: c.employersPending, href: '#/majikan' })}
        </div>
        <div class="grid-2">
          ${UI.card(tasks, { title: role() === 'admin' ? 'Tugasan hari ini (semua pegawai)' : 'Tugasan saya hari ini' })}
          ${UI.card(UI.auditStrip(Store.auditLog().slice(0, 6), 'Jejak audit terkini') + `<div class="mt-2">${UI.btn('Lihat log audit', { variant: 'ghost', sm: true, nav: '#/audit' })}</div>`, { title: 'Jejak audit terkini' })}
        </div>`;
    }
  };

  /* =====================================================================
     O2 Barisan Nasihat PKS
     ===================================================================== */
  function isOverdue(c) { return !c.officerId && Fmt.daysBetween(c.submitted, Fmt.todayIso()) > 3; }
  const O2 = {
    path: '/kes', id: 'O2', title: 'Barisan Nasihat PKS', nav: 'kes', roles: WORK,
    render(params, query) {
      let rows = Store.allCases();
      if (query.industri) rows = rows.filter(c => c.industry === query.industri);
      if (query.status) rows = rows.filter(c => c.status === query.status);
      if (query.pegawai === 'none') rows = rows.filter(c => !c.officerId);
      else if (query.pegawai) rows = rows.filter(c => c.officerId === query.pegawai);
      const bar = toolbar(`
        <div style="flex:1;min-width:200px">${UI.input('q', { value: query.q || '', placeholder: 'Cari kes atau perniagaan', attrs: 'data-input="search" autocomplete="off"' })}</div>
        ${UI.select('industri', INDUSTRIES, query.industri || '', { change: 'industri', placeholder: 'Semua industri' })}
        ${UI.select('status', CASE_STATUSES, query.status || '', { change: 'status', placeholder: 'Semua status' })}
        ${UI.select('pegawai', [{ value: 'none', label: 'Belum ditugaskan' }].concat(caseOfficers().map(o => ({ value: o.id, label: o.name }))), query.pegawai || '', { change: 'pegawai', placeholder: 'Semua pegawai' })}
        ${UI.btn('Tugaskan', { action: 'assign', icon: 'user' })}`);
      const table = UI.table({
        columns: [
          { key: 'pick', label: '', render: c => `<input type="checkbox" class="kes-check" value="${esc(c.id)}" aria-label="Pilih ${esc(c.id)}">` },
          { key: 'id', label: 'Kes', render: c => `<span class="mono">${esc(c.id)}</span>` },
          { key: 'business', label: 'Perniagaan' },
          { key: 'industry', label: 'Industri', render: c => esc(UI.label(c.industry)) },
          { key: 'submitted', label: 'Dihantar', render: c => esc(Fmt.dateShort(c.submitted)) },
          { key: 'officerId', label: 'Pegawai', render: c => c.officerId ? esc(officerName(c.officerId)) : '<span class="muted">—</span>' },
          { key: 'status', label: 'Status', render: c => UI.badge(c.status) + (isOverdue(c) ? ' ' + UI.badge('menunggu', 'melebihi 3 hari') : '') }
        ],
        rows,
        rowHref: c => `#/kes/${c.id}`,
        empty: 'Tiada kes sepadan dengan penapis.'
      });
      return `
        ${UI.pageHead('Barisan Nasihat PKS', '', 'Pilih kes untuk menugaskan pegawai, atau buka kes untuk menyemak pengiraan.')}
        ${bar}
        ${table}
        <p class="small muted mt-2">Kes yang belum ditugaskan lebih daripada 3 hari ditanda kuning. Status: Baru · Dalam tindakan · Dirujuk · Selesai.</p>`;
    },
    mount(params, query, root) {
      // checkboxes live inside navigable rows: keep their clicks from reaching the row navigation
      root.querySelectorAll('.kes-check').forEach(cb => cb.addEventListener('click', e => e.stopPropagation()));
      if (query.q) applySearch(root, query.q, [1, 2]);
    },
    actions: {
      assign() {
        const ids = Array.from(document.querySelectorAll('.kes-check:checked')).map(cb => cb.value);
        if (!ids.length) { UI.toast('Tandakan sekurang-kurangnya satu kes dahulu', 'warn'); return; }
        UI.openDrawer({
          title: `Tugaskan ${ids.length} kes`,
          body: `<form data-submit="assign" class="stack">
            ${hidden('ids', ids.join(','))}
            <div class="small muted">${ids.map(esc).join(', ')}</div>
            ${UI.field('Pegawai', UI.select('officerId', caseOfficers().map(o => ({ value: o.id, label: `${o.name} · ${o.district} · ${(o.industries || []).map(UI.label).join(', ')}` })), (me() && me().role === 'officer') ? me().id : ''))}
            ${UI.btn('Tugaskan', { type: 'submit', block: true })}
          </form>`
        });
      }
    },
    submit: {
      assign(data) {
        const ids = String(data.ids || '').split(',').filter(Boolean);
        if (!data.officerId) { UI.toast('Pilih pegawai', 'warn'); return; }
        ids.forEach(id => Store.assignCase(id, data.officerId));
        done(`${ids.length} kes ditugaskan kepada ${officerName(data.officerId)}`);
      }
    },
    change: {
      search(v) { replaceQuery({ q: v }); applySearch(document.getElementById('view'), v, [1, 2]); },
      industri(v) { setQuery({ industri: v }); },
      status(v) { setQuery({ status: v }); },
      pegawai(v) { setQuery({ pegawai: v }); }
    }
  };

  /* =====================================================================
     O3 Butiran Kes
     ===================================================================== */
  function caseWorking(c) {
    const ans = Store.caseAnswers(c.id);
    const tpl = ans ? Store.smeTemplate(ans.templateId) : null;
    if (!ans || !tpl) return null;
    const a = ans.answers || {};
    const sum = group => tpl.questions.filter(q => q.group === group).reduce((t, q) => t + (Number(a[q.key]) || 0), 0);
    const assets = sum('asset');
    const liabilities = sum('liability');
    const base = assets - liabilities;
    const amount = Math.round(Math.max(0, base) * (SEED.meta.rate || 0.025) * 100) / 100;
    const systemAmount = ans.systemAmount !== undefined && ans.systemAmount !== null ? ans.systemAmount : c.systemAmount;
    return { ans, tpl, assets, liabilities, base, amount, systemAmount };
  }
  const O3 = {
    path: '/kes/:id', id: 'O3', title: 'Butiran Kes', nav: 'kes', back: '#/kes', roles: WORK,
    render(params) {
      const c = Store.smeCase(params.id);
      if (!c) return UI.emptyState({ icon: 'store', text: 'Kes tidak dijumpai.', action: { label: 'Kembali ke senarai kes', nav: '#/kes' } });
      if (!openedCases.has(c.id)) { openedCases.add(c.id); Store.audit({ entity: 'sme_case', entityId: c.id, action: 'opened' }); }
      const w = caseWorking(c);
      const officerSel = UI.select('officerId', caseOfficers().map(o => ({ value: o.id, label: o.name })), c.officerId || '', { change: 'assign', placeholder: '— belum ditugaskan —' });
      const head = UI.pageHead(c.id,
        `${backBtn('#/kes', 'Senarai kes')} <label class="small muted" style="align-self:center">Pegawai</label> ${officerSel}`,
        `${esc(c.business)} · ${esc(UI.label(c.industry))} · dihantar ${esc(Fmt.date(c.submitted))} · ${UI.badge(c.status)}`);

      let left, right;
      if (!w) {
        left = UI.card(UI.emptyState({ icon: 'doc', text: 'Tiada jawapan soal selidik untuk kes ini (dibuka daripada temu janji).' }), { title: 'Jawapan soal selidik (0)' });
        right = UI.card(`<p class="small muted">Pengiraan sistem memerlukan jawapan soal selidik. Gunakan mesej di bawah untuk meminta pemilik melengkapkannya.</p>
          <div class="row mt-2">${c.status !== 'referred' && c.status !== 'closed' ? UI.btn('Rujuk ke jawatankuasa', { variant: 'secondary', action: 'refer' }) : ''}</div>`, { title: 'Pengiraan sistem' });
      } else {
        const answered = w.tpl.questions.filter(q => w.ans.answers[q.key] !== undefined);
        left = UI.card(`<div class="small muted mb-2">${esc(w.ans.templateId)} v${esc(w.ans.version)} · ${esc(w.tpl.method || '')}</div>` +
          UI.kv(w.tpl.questions.map(q => ({
            label: q.label + (q.group === 'liability' ? ' (liabiliti)' : q.group === 'pnl' ? ' (rujukan)' : ''),
            value: w.ans.answers[q.key] !== undefined ? Fmt.rm(Number(w.ans.answers[q.key])) : '—'
          }))), { title: `Jawapan soal selidik (${answered.length})` });
        const values = { currentAssets: w.assets, currentLiabilities: w.liabilities, zakatBase: w.base, zakatAmount: w.amount };
        const lines = UI.kv(w.tpl.lines.map((l, i) => ({ label: l.label, value: Fmt.rm(values[l.key]), total: i === w.tpl.lines.length - 1 })));
        const mismatch = Math.abs(w.amount - w.systemAmount) > 0.5 ? UI.note(`Kiraan semula ${esc(Fmt.rm(w.amount))} berbeza daripada angka sistem ${esc(Fmt.rm(w.systemAmount))}. Semak sebelum mengesahkan.`, 'warn') : '';
        const verified = c.verifiedAmount !== null && c.verifiedAmount !== undefined
          ? `<div class="mt-2">Jumlah disahkan <strong>${esc(Fmt.rm(c.verifiedAmount))}</strong> ${UI.badge('ok', 'Dilepaskan kepada pemilik')}</div>` : '';
        const buttons = [
          c.status !== 'closed' ? UI.btn('Sahkan', { action: 'verify', icon: 'check' }) : '',
          UI.btn('Betulkan', { variant: 'secondary', action: 'correct' }),
          c.status !== 'referred' && c.status !== 'closed' ? UI.btn('Rujuk ke jawatankuasa', { variant: 'secondary', action: 'refer' }) : ''
        ].join(' ');
        right = UI.card(`${lines}${mismatch}${verified}
          <p class="tiny muted mt-1">Berdasarkan kaedah rasmi Pusat Zakat · ${esc(w.tpl.method || '')} · kadar ${esc(Fmt.pct(SEED.meta.rate, 1))}</p>
          <div class="row mt-2" style="flex-wrap:wrap;gap:8px">${buttons}</div>`, { title: `Pengiraan sistem ${Fmt.rm(w.systemAmount)}` });
      }

      const corrections = (Store.state().corrections || []).filter(x => x.caseId === c.id);
      const correctionHtml = corrections.length ? UI.card(corrections.map(x => `<div class="row row--between small" style="flex-wrap:wrap">
          <span><del>${esc(Fmt.rm(x.oldAmount))}</del> → <strong>${esc(Fmt.rm(x.newAmount))}</strong> · ${esc(x.reason)}</span>
          <span class="muted">${esc(x.by)} · ${esc(Fmt.dateTime(x.at))}</span></div>`).join(''), { title: 'Pembetulan (lama vs baharu)', cls: 'card--warn' }) : '';
      const referral = c.status === 'referred' ? UI.note(`Dirujuk ke jawatankuasa ${esc(c.referredAt ? Fmt.dateTime(c.referredAt) : '')}${c.referralNote ? ': ' + esc(c.referralNote) : ''}`, 'warn') : '';

      const msgs = (c.messages || []).map(m => `<div class="chat__bubble ${m.from === 'officer' ? 'chat__bubble--me' : 'chat__bubble--ai'}">
          ${esc(m.text)}<div class="tiny" style="opacity:.75">${m.from === 'officer' ? 'Pegawai' : 'Pemilik'} · ${esc(Fmt.dateTime(m.at))}</div></div>`).join('');
      const thread = UI.card(`
        ${c.officerNote ? UI.note(`<strong>Nota dalaman:</strong> ${esc(c.officerNote)}`, 'muted') : ''}
        <div class="chat mt-2">${msgs || '<div class="small muted">Belum ada mesej.</div>'}</div>
        <form data-submit="message" class="chat__composer mt-2">
          ${UI.input('text', { placeholder: 'Tulis mesej kepada pemilik...', required: true, attrs: 'autocomplete="off"' })}
          ${UI.btn('Hantar', { type: 'submit', icon: 'arrow' })}
        </form>
        <p class="tiny muted mt-1">Mesej direkod dalam jejak audit dan tidak boleh dipadam.</p>`, { title: 'Nota & mesej kepada pemilik' });

      return `${head}
        ${referral}
        <div class="grid-2">${left}${right}</div>
        ${correctionHtml ? `<div class="mt-3">${correctionHtml}</div>` : ''}
        <div class="mt-3">${thread}</div>
        <div class="mt-3">${UI.auditStrip(eventsFor(c.id), 'jejak: dibuka · diubah · (tidak padam)')}</div>`;
    },
    actions: {
      verify() {
        const c = Store.smeCase(currentParams().id); if (!c) return;
        const w = caseWorking(c);
        const amount = w ? w.systemAmount : c.systemAmount;
        UI.confirm(`Sahkan ${Fmt.rm(amount)} untuk ${c.business} dan lepaskan angka ini kepada pemilik?`, () => {
          Store.verifyCase(c.id, amount);
          done(`${c.id} disahkan: ${Fmt.rm(amount)} dilepaskan kepada pemilik`);
        }, { yes: 'Sahkan', title: 'Sahkan pengiraan' });
      },
      correct() {
        const c = Store.smeCase(currentParams().id); if (!c) return;
        const current = c.verifiedAmount !== null && c.verifiedAmount !== undefined ? c.verifiedAmount : c.systemAmount;
        UI.openDrawer({
          title: `Betulkan ${c.id}`,
          body: `<form data-submit="correct" class="stack">
            <p class="small muted">Angka semasa: <strong>${esc(Fmt.rm(current))}</strong>. Angka lama dan baharu akan direkod.</p>
            ${UI.field('Jumlah baharu', UI.input('amount', { rm: true, required: true, placeholder: '0.00' }))}
            ${UI.field('Sebab pembetulan (wajib)', textarea('reason', '', { required: true, placeholder: 'contoh: stok sebenar lebih rendah selepas semakan invois' }))}
            ${UI.btn('Simpan pembetulan', { type: 'submit', block: true })}
          </form>`
        });
      },
      refer() {
        const c = Store.smeCase(currentParams().id); if (!c) return;
        UI.openDrawer({
          title: `Rujuk ${c.id} ke jawatankuasa`,
          body: `<form data-submit="refer" class="stack">
            <p class="small muted">Untuk kes kompleks. Status kes menjadi Dirujuk.</p>
            ${UI.field('Nota kepada jawatankuasa', textarea('note', '', { placeholder: 'contoh: pemilik ada aset di luar negara' }))}
            ${UI.btn('Rujuk', { type: 'submit', block: true })}
          </form>`
        });
      }
    },
    submit: {
      correct(data) {
        const id = currentParams().id;
        const amount = Fmt.parseMoney(data.amount);
        const reason = String(data.reason || '').trim();
        if (data.amount === '' || amount < 0) { UI.toast('Masukkan jumlah baharu yang sah', 'warn'); return; }
        if (!reason) { UI.toast('Sebab pembetulan diperlukan', 'warn'); return; }
        Store.correctCase(id, amount, reason);
        done(`${id} dibetulkan kepada ${Fmt.rm(amount)}`);
      },
      refer(data) {
        const id = currentParams().id;
        Store.referCase(id, String(data.note || '').trim());
        done(`${id} dirujuk ke jawatankuasa`);
      },
      message(data) {
        const text = String(data.text || '').trim();
        if (!text) { UI.toast('Mesej kosong', 'warn'); return; }
        Store.addCaseMessage(currentParams().id, 'officer', text);
        done('Mesej dihantar kepada pemilik');
      }
    },
    change: {
      assign(v) {
        if (!v) return;
        const id = currentParams().id;
        Store.assignCase(id, v);
        done(`${id} ditugaskan kepada ${officerName(v)}`);
      }
    }
  };

  /* =====================================================================
     O4 Kalendar Temu Janji
     ===================================================================== */
  function calendarItems(date, officerId) {
    const apts = Store.appointments().filter(a => a.date === date && (!officerId || a.officerId === officerId));
    const slots = Store.officerSlots(officerId, date);
    const used = new Set();
    const items = slots.map(s => {
      if (s.status === 'booked') {
        const apt = apts.find(a => a.officerId === s.officerId && a.time === s.time);
        if (apt) used.add(apt.id);
        return { time: s.time, kind: 'booked', slot: s, apt };
      }
      return { time: s.time, kind: s.status, slot: s };
    });
    apts.filter(a => !used.has(a.id)).forEach(a => items.push({ time: a.time, kind: 'booked', apt: a }));
    return items.sort((a, b) => a.time.localeCompare(b.time) || String((a.slot || a.apt).officerId).localeCompare(String((b.slot || b.apt).officerId)));
  }
  function calendarItemHtml(it, showOfficer) {
    const owner = (it.slot || it.apt).officerId;
    const who = showOfficer ? ` <span class="tiny">· ${esc(Fmt.initials(officerName(owner)))}</span>` : '';
    if (it.kind === 'booked') {
      if (!it.apt) return `<div class="event"><strong>${esc(it.time)}</strong> Ditempah${who}</div>`;
      return `<div class="event" data-action="openApt" data-id="${esc(it.apt.id)}" title="Butiran temu janji"><strong>${esc(it.time)}</strong>${who}<br>${esc(it.apt.business)}<br><span class="tiny">(${esc(UI.label(it.apt.mode))})${it.apt.caseId ? '' : ' · tiada kes'}</span></div>`;
    }
    if (it.kind === 'blocked') {
      return `<div class="event event--blocked" data-action="toggleSlot" data-officer="${esc(owner)}" data-date="${esc(it.slot.date)}" data-time="${esc(it.time)}" title="Klik untuk buka sekatan"><strong>${esc(it.time)}</strong> Disekat${who}</div>`;
    }
    return `<div class="row small" style="gap:4px;align-items:center;justify-content:space-between"><span class="muted">${esc(it.time)}${who}</span>${UI.btn('Sekat', { variant: 'ghost', sm: true, action: 'toggleSlot', data: { officer: owner, date: it.slot.date, time: it.time } })}</div>`;
  }
  function weekLabel(monday) {
    const fri = addDays(monday, 4);
    const a = Fmt.parse(monday), b = Fmt.parse(fri);
    return a.getMonth() === b.getMonth()
      ? `Minggu ${a.getDate()}–${b.getDate()} ${Fmt.MONTHS[b.getMonth()]}`
      : `Minggu ${Fmt.dateShort(monday)} – ${Fmt.dateShort(fri)}`;
  }
  const O4 = {
    path: '/temu-janji', id: 'O4', title: 'Kalendar Temu Janji', nav: 'temu-janji', roles: WORK,
    render(params, query) {
      const monday = mondayOf(query.minggu || SEED.meta.today);
      const dates = [0, 1, 2, 3, 4].map(i => addDays(monday, i));
      const o = me();
      const pegawai = query.pegawai || (role() === 'officer' && o ? o.id : 'semua');
      const officerId = pegawai === 'semua' ? null : pegawai;
      const base = { minggu: monday, pegawai: query.pegawai };
      const nav = `<div class="row" style="gap:4px;align-items:center">
        ${UI.btn('<', { variant: 'ghost', sm: true, nav: buildHash('/temu-janji', Object.assign({}, base, { minggu: addDays(monday, -7) })) })}
        <strong>${esc(weekLabel(monday))}</strong>
        ${UI.btn('>', { variant: 'ghost', sm: true, nav: buildHash('/temu-janji', Object.assign({}, base, { minggu: addDays(monday, 7) })) })}
      </div>`;
      const modes = UI.tabs([
        { key: 'hari', label: 'Hari', href: '#paparan-hari' },
        { key: 'minggu', label: 'Minggu', href: buildHash('/temu-janji', base) },
        { key: 'bulan', label: 'Bulan', href: '#paparan-bulan' }
      ], 'minggu').replace(/data-nav="#paparan-(hari|bulan)"/g, 'data-action="otherView"');
      const sel = UI.select('pegawai', [{ value: 'semua', label: 'Semua pegawai' }].concat(caseOfficers().map(x => ({ value: x.id, label: x.name }))), pegawai, { change: 'pegawai' });
      const heads = dates.map(d => `<div class="calendar__head">${esc(Fmt.dayName(d))} ${Fmt.parse(d).getDate()}${d === refToday() ? ' · hari ini' : ''}</div>`).join('');
      const cells = dates.map(d => {
        const items = calendarItems(d, officerId);
        return `<div class="calendar__cell">${items.map(it => calendarItemHtml(it, !officerId)).join('') || '<span class="tiny muted">tiada slot</span>'}</div>`;
      }).join('');
      return `
        ${UI.pageHead('Kalendar Temu Janji', '', 'Ketersediaan pegawai dan tempahan pemilik PKS.')}
        ${toolbar(`${nav}<div style="flex:1"></div>${modes}<label class="small muted">Pegawai</label>${sel}`)}
        <div class="table-wrap"><div class="calendar">${heads}${cells}</div></div>
        <p class="small muted mt-2">Klik tempahan untuk butiran, buka kes atau jadual semula. Jadual semula memaklumkan pemilik melalui saluran yang dibenarkan sahaja. Klik slot Disekat untuk membuka sekatan.</p>`;
    },
    actions: {
      otherView() { UI.toast('Paparan ini tidak dalam prototaip', 'warn'); },
      toggleSlot(d) {
        const slot = Store.blockSlot(d.officer, d.date, d.time);
        done(`${Fmt.dateShort(d.date)} ${d.time} ${slot.status === 'blocked' ? 'disekat' : 'dibuka semula'}`);
      },
      openApt(d) {
        const a = Store.appointment(d.id); if (!a) return;
        const payer = a.payerId ? Store.payer(a.payerId) : null;
        const monday = mondayOf(a.date);
        const dateOpts = [0, 1, 2, 3, 4, 7, 8, 9, 10, 11].map(i => addDays(monday, i)).map(x => ({ value: x, label: `${Fmt.dayName(x)} ${Fmt.date(x)}` }));
        const caseBtn = a.caseId
          ? UI.btn(`Buka kes ${a.caseId}`, { nav: `#/kes/${a.caseId}`, icon: 'arrow' })
          : UI.btn('Buka kes', { action: 'createCase', data: { id: a.id }, icon: 'plus' });
        UI.openDrawer({
          title: `Temu janji ${a.id}`,
          body: `${UI.kv([
              { label: 'Perniagaan', value: a.business },
              { label: 'Pemilik', value: payer ? payer.name : '—' },
              { label: 'Pegawai', value: officerName(a.officerId) },
              { label: 'Tarikh', value: `${Fmt.dayName(a.date)}, ${Fmt.date(a.date)}` },
              { label: 'Masa', value: a.time },
              { label: 'Cara', value: UI.label(a.mode) },
              { label: 'Kes', value: a.caseId || 'belum dipautkan' },
              { label: 'Nota', value: a.note || '—' }
            ])}
            <div class="mt-2">${caseBtn}</div>
            <h4 class="mt-3">Jadual semula</h4>
            <form data-submit="reschedule" class="stack">
              ${hidden('id', a.id)}
              ${UI.field('Tarikh', UI.select('date', dateOpts, a.date))}
              ${UI.field('Masa', UI.select('time', SLOT_TIMES, a.time))}
              <p class="small muted">Pemilik dimaklumkan melalui saluran yang dibenarkan (${esc(payer && Store.payerConsent(payer.id) ? Store.payerConsent(payer.id).channels.map(UI.label).join(', ') : 'tiada kebenaran: tiada mesej')}).</p>
              ${UI.btn('Jadual semula', { type: 'submit', block: true, variant: 'secondary' })}
            </form>`
        });
      },
      createCase(d) {
        const a = Store.appointment(d.id); if (!a) return;
        const c = Store.createSmeCase(a.payerId || 'PAY-004', a.business, 'runcit', 'TPL-RUNCIT', 3, {}, 0);
        // no Store method links an appointment to a case: set the field, then write the audit event (Store.audit saves)
        a.caseId = c.id;
        Store.audit({ entity: 'appointment', entityId: a.id, action: 'case_linked', detail: c.id });
        if (a.officerId) Store.assignCase(c.id, a.officerId);
        UI.toast(`Kes ${c.id} dibuka dan dipautkan ke ${a.id}`, 'ok');
        renderRail();
        Router.go(`#/kes/${c.id}`);
      }
    },
    submit: {
      reschedule(data) {
        const a = Store.appointment(data.id); if (!a) return;
        if (data.date === a.date && data.time === a.time) { UI.toast('Tarikh dan masa tidak berubah', 'warn'); return; }
        const clash = Store.officerSlots(a.officerId, data.date).find(s => s.time === data.time && s.status !== 'free');
        const aptClash = Store.appointments().find(x => x.id !== a.id && x.officerId === a.officerId && x.date === data.date && x.time === data.time);
        if (clash || aptClash) { UI.toast('Slot itu tidak kosong untuk pegawai ini', 'warn'); return; }
        Store.rescheduleAppointment(a.id, data.date, data.time);
        done(`${a.id} dijadual semula ke ${Fmt.dateShort(data.date)} ${data.time}; pemilik dimaklumkan`);
      }
    },
    change: {
      pegawai(v) { setQuery({ pegawai: v }); }
    }
  };

  /* =====================================================================
     O5 Peti Eskalasi AI
     ===================================================================== */
  function chatBubbles(conv) {
    return `<div class="chat">${(conv || []).map(m => {
      const cls = m.role === 'user' ? 'chat__bubble--ai' : m.role === 'officer' ? 'chat__bubble--me' : 'chat__bubble--escalated';
      const who = m.role === 'user' ? 'Pengguna' : m.role === 'officer' ? 'Pegawai' : 'Pembantu';
      return `<div class="chat__bubble ${cls}"><div class="tiny" style="opacity:.75">${who}</div>${esc(m.text)}</div>`;
    }).join('') || '<div class="small muted">Tiada perbualan dilampirkan.</div>'}</div>`;
  }
  function escalationFrom(t) {
    const p = t.payerId ? Store.payer(t.payerId) : null;
    return `dari: ${UI.label(t.channel)} · ${p ? p.name : '+60..'} · ${Fmt.time(t.at)}`;
  }
  const O5 = {
    path: '/eskalasi', id: 'O5', title: 'Peti Eskalasi AI', nav: 'eskalasi', roles: WORK,
    render(params, query) {
      const status = ['new', 'answered', 'closed'].includes(query.status) ? query.status : 'new';
      const reasons = SEED.escalationReasons || {};
      let list = Store.escalations(status);
      if (query.sebab) list = list.filter(t => t.reason === query.sebab);
      const tabs = UI.tabs([
        { key: 'new', label: 'Baru', count: Store.escalations('new').length, badge: 'menunggu', href: buildHash('/eskalasi', { status: 'new', sebab: query.sebab }) },
        { key: 'answered', label: 'Dijawab', href: buildHash('/eskalasi', { status: 'answered', sebab: query.sebab }) },
        { key: 'closed', label: 'Ditutup', href: buildHash('/eskalasi', { status: 'closed', sebab: query.sebab }) }
      ], status);
      const sel = UI.select('sebab', Object.keys(reasons).map(k => ({ value: k, label: reasons[k] })), query.sebab || '', { change: 'sebab', placeholder: 'Semua sebab' });
      const cards = list.map(t => {
        const actions = [
          t.status === 'new' ? UI.btn('Jawab', { sm: true, action: 'answer', data: { id: t.id }, icon: 'chat' }) : '',
          t.faqDraftId ? UI.btn(`Draf ${t.faqDraftId}`, { sm: true, variant: 'ghost', nav: `#/kandungan/${t.faqDraftId}`, icon: 'doc' })
            : UI.btn('Tambah FAQ', { sm: true, variant: 'secondary', action: 'faq', data: { id: t.id }, icon: 'plus' }),
          t.status === 'answered' ? UI.btn('Tutup', { sm: true, variant: 'ghost', action: 'close', data: { id: t.id } }) : ''
        ].join(' ');
        const answer = t.answer ? UI.note(`<strong>Jawapan ${esc(officerName(t.answeredBy))} · ${esc(Fmt.dateTime(t.answeredAt))}:</strong> ${esc(t.answer)}`, 'muted') : '';
        return UI.card(`
          <div class="row row--between" style="flex-wrap:wrap;gap:8px">
            <div><span class="mono">${esc(t.id)}</span> <strong>"${esc(t.question)}"</strong> ${UI.badge(t.reason === 'low_confidence' ? 'in_progress' : 'menunggu', UI.label(t.reason))}</div>
            ${UI.badge(t.status)}
          </div>
          <div class="small muted mt-1">${esc(escalationFrom(t))} · ${esc(Fmt.date(t.at))}</div>
          ${answer ? `<div class="mt-2">${answer}</div>` : ''}
          <div class="row mt-2" style="flex-wrap:wrap;gap:8px">${actions}</div>`, { cls: 'mb-2' });
      }).join('');
      return `
        ${UI.pageHead('Peti Eskalasi AI', '', 'Setiap soalan yang ditolak oleh pembantu AI mendarat di sini.')}
        ${toolbar(`${tabs}<div style="flex:1"></div><label class="small muted">sebab</label>${sel}`)}
        ${cards || UI.emptyState({ icon: 'inbox', text: 'Tiada tiket dalam senarai ini.' })}
        <p class="small muted mt-2">Tiket tidak pernah ditutup secara automatik. Setiap jawapan ialah acara audit.</p>`;
    },
    actions: {
      answer(d) {
        const t = Store.escalation(d.id); if (!t) return;
        UI.openDrawer({
          title: `Jawab ${t.id}`,
          body: `<p><strong>"${esc(t.question)}"</strong></p>
            <div class="small muted mb-2">${esc(escalationFrom(t))} · ${esc(UI.label(t.reason))}</div>
            ${chatBubbles(t.conversation)}
            <form data-submit="answer" class="stack mt-3">
              ${hidden('id', t.id)}
              ${UI.field('Jawapan', textarea('text', '', { rows: 5, required: true, placeholder: 'Tulis jawapan berdasarkan kaedah rasmi Pusat Zakat' }))}
              <p class="small muted">Dihantar melalui saluran asal: ${esc(UI.label(t.channel))} (gerbang stub, tiada mesej sebenar).</p>
              ${UI.btn('Hantar jawapan', { type: 'submit', block: true })}
            </form>`
        });
      },
      faq(d) {
        const k = Store.draftFaqFromEscalation(d.id);
        if (!k) { UI.toast('Tiket tidak dijumpai', 'danger'); return; }
        UI.toast(`Draf ${k.id} dibuat daripada ${d.id}`, 'ok');
        renderRail();
        Router.go(`#/kandungan/${k.id}`);
      },
      close(d) {
        UI.confirm(`Tutup tiket ${d.id}? Tiket kekal dalam rekod.`, () => {
          Store.closeEscalation(d.id);
          done(`${d.id} ditutup`);
        }, { yes: 'Tutup tiket' });
      }
    },
    submit: {
      answer(data) {
        const text = String(data.text || '').trim();
        if (!text) { UI.toast('Jawapan kosong', 'warn'); return; }
        const t = Store.escalation(data.id);
        Store.answerEscalation(data.id, text);
        done(`Jawapan ${data.id} dihantar melalui ${UI.label(t ? t.channel : 'portal')}`);
      }
    },
    change: {
      sebab(v) { setQuery({ sebab: v }); }
    }
  };

  /* ---------- start ---------- */
  Store.load(); // idempotent; the role decides the default route
  const REQUIRE = ALL;
  const accKey = Router.parse(location.hash).query.acc;
  const accFromLink = accKey ? SEED.accounts.find(a => a.key === accKey) : null;
  let startRole = accFromLink ? accFromLink.role : Store.role();
  if (!REQUIRE.includes(startRole)) { const fallback = SEED.accounts.find(a => REQUIRE.includes(a.role)); startRole = fallback ? fallback.role : 'officer'; }
  const defaultHash = startRole === 'shariah_reviewer' ? '#/kandungan' : '#/';

  Router.register([O1, O2, O3, O4, O5].concat(window.OFFICER_CONTENT_VIEWS || []));
  Router.start({ defaultHash, requireRoles: REQUIRE });
  const brand = document.getElementById('topbar-brand');
  if (brand) { brand.setAttribute('href', defaultHash); brand.setAttribute('data-nav', defaultHash); }
  renderRail();
  window.addEventListener('hashchange', renderRail);
})();
