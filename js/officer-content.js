/* ZakatTech 360 prototype — officer console content and data views: O6 Semakan Kandungan (+ open item with diff),
 * O7 Penerbitan Snapshot Impak, O8 Kelulusan Majikan, O9 Log Audit, O10 Tetapan.
 * Loaded after officer-core.js and before officer.js; exposes window.OFFICER_CONTENT_VIEWS. */
(function () {
  const { esc, WORK, ALL, SLOT_TIMES, INDUSTRIES, CASE_STATUSES, KNOWLEDGE_ORDER, SECTOR_LABELS, GATEWAY_LABELS, AI_PROVIDERS, openedCases, role, isWork, me, officerName, caseOfficers, refToday, addDays, mondayOf, buildHash, setQuery, replaceQuery, currentParams, done, eventsFor, textarea, hidden, applySearch, toolbar, backBtn, counts, NAV, renderRail } = window.OfficerKit;
  /* =====================================================================
     O6 Semakan Kandungan (+ open item)
     ===================================================================== */
  function wordDiff(prev, next) {
    const A = String(prev || '').split(/\s+/).filter(Boolean);
    const B = String(next || '').split(/\s+/).filter(Boolean);
    const n = A.length, m = B.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const ops = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (A[i] === B[j]) { ops.push(['=', A[i]]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push(['-', A[i]]); i++; }
      else { ops.push(['+', B[j]]); j++; }
    }
    while (i < n) ops.push(['-', A[i++]]);
    while (j < m) ops.push(['+', B[j++]]);
    // group runs of the same op so a changed phrase reads as one block
    const out = [];
    ops.forEach(([t, w]) => {
      const last = out[out.length - 1];
      if (last && last.t === t) last.w.push(w); else out.push({ t, w: [w] });
    });
    return out.map(g => {
      const text = esc(g.w.join(' '));
      return g.t === '=' ? text : g.t === '-' ? `<del>${text}</del>` : `<ins>${text}</ins>`;
    }).join(' ');
  }
  function knowledgeKinds() { return ['faq', 'template', 'story', 'hr_kit']; }
  const O6 = {
    path: '/kandungan', id: 'O6', title: 'Semakan Kandungan', nav: 'kandungan', roles: ALL,
    render(params, query) {
      const items = Store.state().knowledgeItems;
      const n = s => items.filter(k => k.status === s).length;
      const status = query.status || '';
      const rows = items.filter(k => !status || k.status === status)
        .slice().sort((a, b) => KNOWLEDGE_ORDER.indexOf(a.status) - KNOWLEDGE_ORDER.indexOf(b.status) || a.id.localeCompare(b.id));
      const table = UI.table({
        columns: [
          { key: 'id', label: 'ID', render: k => `<span class="mono">${esc(k.id)}</span>` },
          { key: 'title', label: 'Tajuk' },
          { key: 'kind', label: 'Jenis', render: k => esc(UI.label(k.kind)) },
          { key: 'version', label: 'Versi', render: k => `v${esc(k.version)}` },
          { key: 'status', label: 'Status', render: k => UI.badge(k.status) },
          { key: 'owner', label: 'Pemilik', render: k => esc(officerName(k.owner)) },
          { key: 'act', label: 'Tindakan', render: k => `<div class="row" style="gap:6px;flex-wrap:nowrap">${UI.btn('Buka', { sm: true, variant: 'secondary', nav: `#/kandungan/${k.id}` })}${k.status === 'approved' && isWork() ? UI.btn('Terbit', { sm: true, action: 'publish', data: { id: k.id } }) : ''}</div>` }
        ],
        rows,
        empty: 'Tiada kandungan dengan status ini.'
      });
      const actions = isWork() ? UI.btn('+ Draf baharu', { action: 'newDraft' }) : '';
      return `
        ${UI.pageHead('Semakan Kandungan', actions, role() === 'shariah_reviewer' ? 'Buka item dalam Semakan Syariah untuk Lulus atau Tolak.' : 'Draf → Semakan Syariah → Diluluskan → Diterbit')}
        <div class="counters">
          ${UI.counter({ label: 'Draf', value: n('draft'), href: buildHash('/kandungan', { status: 'draft' }) })}
          ${UI.counter({ label: 'Semakan Syariah', value: n('shariah_review'), href: buildHash('/kandungan', { status: 'shariah_review' }), warn: n('shariah_review') > 0 })}
          ${UI.counter({ label: 'Diluluskan', value: n('approved'), href: buildHash('/kandungan', { status: 'approved' }) })}
          ${UI.counter({ label: 'Diterbit', value: n('published'), href: buildHash('/kandungan', { status: 'published' }) })}
        </div>
        ${status ? `<div class="row mb-2" style="gap:8px;align-items:center"><span class="small">Penapis: ${UI.badge(status)}</span>${UI.btn('Tunjuk semua', { variant: 'ghost', sm: true, nav: '#/kandungan' })}</div>` : ''}
        ${table}
        <p class="small muted mt-2">setiap status: siapa, bila · hanya Diterbit dibaca AI</p>`;
    },
    actions: {
      publish(d) { publishKnowledgeFlow(d.id); },
      newDraft() {
        UI.openDrawer({
          title: 'Draf baharu',
          body: `<form data-submit="createDraft" class="stack">
            ${UI.field('Jenis', UI.select('kind', knowledgeKinds(), 'faq'))}
            ${UI.field('Tajuk', UI.input('title', { required: true, placeholder: 'contoh: Zakat wang pampasan' }))}
            ${UI.field('Teks', textarea('body', '', { rows: 8, required: true }))}
            <p class="small muted">Draf tidak dibaca oleh pembantu AI sehingga diterbitkan.</p>
            ${UI.btn('Simpan draf', { type: 'submit', block: true })}
          </form>`
        });
      }
    },
    submit: {
      createDraft(data) {
        const title = String(data.title || '').trim();
        const body = String(data.body || '').trim();
        if (!title || !body) { UI.toast('Tajuk dan teks diperlukan', 'warn'); return; }
        const k = Store.createDraft(data.kind || 'faq', title, body);
        UI.toast(`Draf ${k.id} disimpan`, 'ok');
        renderRail();
        Router.go(`#/kandungan/${k.id}`);
      }
    }
  };
  function publishKnowledgeFlow(id) {
    const k = Store.knowledge(id); if (!k) return;
    UI.confirm(`Terbit "${k.title}" v${k.version}? Versi diterbit sebelum ini dengan tajuk yang sama akan ditarik, dan pembantu AI mula membaca versi ini.`, () => {
      Store.publishKnowledge(id);
      done(`${id} diterbitkan`);
    }, { yes: 'Terbit', title: 'Terbit kandungan' });
  }

  const O6open = {
    path: '/kandungan/:id', id: 'O6', title: 'Semakan Kandungan', nav: 'kandungan', back: '#/kandungan', roles: ALL,
    render(params) {
      const k = Store.knowledge(params.id);
      if (!k) return UI.emptyState({ icon: 'doc', text: 'Kandungan tidak dijumpai.', action: { label: 'Kembali', nav: '#/kandungan' } });
      const r = role();
      const editable = k.status === 'draft' && WORK.includes(r);
      const left = `<div class="diff__pane"><h4>Teks${editable ? ' (boleh disunting)' : ''}</h4>${editable ? textarea('body', k.body, { rows: 10, id: 'kb-body' }) : esc(k.body)}</div>`;
      const right = `<div class="diff__pane"><h4>Diff vs versi diterbit sebelum ini</h4>${k.previousBody ? wordDiff(k.previousBody, k.body) : '<span class="muted">Tiada versi sebelum ini</span>'}</div>`;
      let actions = '';
      if (k.status === 'draft' && WORK.includes(r)) {
        actions = `${UI.btn('Simpan teks', { variant: 'secondary', action: 'saveBody' })} ${UI.btn('Hantar untuk semakan', { action: 'submitReview', icon: 'arrow' })}`;
      } else if (k.status === 'shariah_review' && r === 'shariah_reviewer') {
        actions = `${UI.btn('Lulus', { action: 'approve', icon: 'check' })} ${UI.btn('Tolak', { variant: 'danger', action: 'reject' })}`;
      } else if (k.status === 'approved' && WORK.includes(r)) {
        actions = UI.btn('Terbit', { action: 'publish', icon: 'share' });
      }
      const waiting = !actions ? `<span class="small muted">${
        k.status === 'shariah_review' ? 'Menunggu Penyemak Syariah.' :
        k.status === 'approved' ? 'Diluluskan; menunggu pegawai atau admin menerbitkan.' :
        k.status === 'draft' ? 'Draf; menunggu pegawai menghantar untuk semakan.' :
        k.status === 'published' ? 'Diterbit; dibaca oleh pembantu AI dan halaman awam.' : 'Ditarik; tidak lagi dibaca oleh AI.'}</span>` : '';
      const history = (k.history || []).map(h => `<div class="row row--between small" style="flex-wrap:wrap;padding:6px 0;border-bottom:1px solid var(--line)">
          <span>${UI.badge(h.status)} ${esc(officerName(h.by))}${h.note ? ` · <span class="muted">${esc(h.note)}</span>` : ''}</span>
          <span class="muted">${esc(Fmt.dateTime(h.at))}</span></div>`).join('');
      return `
        ${UI.pageHead(`${Fmt.knowledgeRef(k.id)} · ${k.title}`, backBtn('#/kandungan', 'Senarai kandungan'),
          `${esc(UI.label(k.kind))} · v${esc(k.version)} · ${UI.badge(k.status)} · Pemilik ${esc(officerName(k.owner))}${k.approver ? ` · Penyemak ${esc(officerName(k.approver))}` : ''}`)}
        ${k.sourceTicket ? UI.note(`Dibuat daripada eskalasi <span class="mono">${esc(k.sourceTicket)}</span>.`, 'muted') : ''}
        ${k.reviewNote ? UI.note(`<strong>Nota semakan:</strong> ${esc(k.reviewNote)}`, k.status === 'draft' ? 'warn' : 'muted') : ''}
        <div class="diff mt-2">${left}${right}</div>
        <div class="row mt-3" style="gap:8px;flex-wrap:wrap;align-items:center">${actions}${waiting}</div>
        <div class="mt-3">${UI.card(history || '<div class="small muted">Tiada sejarah.</div>', { title: 'Sejarah status (siapa, bila)' })}</div>
        <div class="mt-3">${UI.auditStrip(eventsFor(k.id))}</div>`;
    },
    actions: {
      saveBody() {
        const id = currentParams().id;
        const el = document.getElementById('kb-body');
        const body = el ? String(el.value || '').trim() : '';
        if (!body) { UI.toast('Teks tidak boleh kosong', 'warn'); return; }
        Store.updateKnowledgeBody(id, body);
        done('Teks disimpan');
      },
      submitReview() {
        const id = currentParams().id;
        const k = Store.knowledge(id); if (!k) return;
        const el = document.getElementById('kb-body');
        const body = el ? String(el.value || '').trim() : k.body;
        if (!body) { UI.toast('Teks tidak boleh kosong', 'warn'); return; }
        UI.confirm(`Hantar "${k.title}" kepada Penyemak Syariah?`, () => {
          if (body !== k.body) Store.updateKnowledgeBody(id, body);
          Store.submitForReview(id);
          done(`${id} dihantar untuk Semakan Syariah`);
        }, { yes: 'Hantar' });
      },
      approve() {
        const k = Store.knowledge(currentParams().id); if (!k) return;
        UI.openDrawer({
          title: `Lulus ${k.id}`,
          body: `<form data-submit="approve" class="stack">
            ${UI.field('Nota (pilihan)', textarea('note', '', { placeholder: 'contoh: selaras dengan kaedah rasmi' }))}
            ${UI.btn('Lulus', { type: 'submit', block: true, icon: 'check' })}
          </form>`
        });
      },
      reject() {
        const k = Store.knowledge(currentParams().id); if (!k) return;
        UI.openDrawer({
          title: `Tolak ${k.id}`,
          body: `<form data-submit="reject" class="stack">
            <p class="small muted">Item kembali kepada Draf dengan nota anda.</p>
            ${UI.field('Nota (wajib)', textarea('note', '', { required: true, placeholder: 'apa yang perlu dibetulkan' }))}
            ${UI.btn('Tolak', { type: 'submit', block: true, variant: 'danger' })}
          </form>`
        });
      },
      publish() { publishKnowledgeFlow(currentParams().id); }
    },
    submit: {
      approve(data) {
        const id = currentParams().id;
        Store.approveKnowledge(id, String(data.note || '').trim());
        done(`${id} diluluskan`);
      },
      reject(data) {
        const note = String(data.note || '').trim();
        if (!note) { UI.toast('Nota penolakan diperlukan', 'warn'); return; }
        const id = currentParams().id;
        Store.rejectKnowledge(id, note);
        done(`${id} ditolak dan kembali ke Draf`, 'warn');
      }
    }
  };

  /* =====================================================================
     O7 Penerbitan Snapshot Impak
     ===================================================================== */
  function snapshotPreview(s) {
    const hiddenCells = new Set(s.hiddenCells || []);
    const districtRows = SEED.districts.map(d => ({ label: d, value: s.byDistrict[d] || 0 }));
    const programRows = Object.keys(s.byProgram).map(p => ({ label: UI.label(p), value: s.byProgram[p], hidden: Array.from(hiddenCells).length > 0 && SEED.districts.every(d => hiddenCells.has(`${d}/${p}`)) }));
    return `
      <div class="grid-4">
        ${UI.kpi({ label: 'Kutipan bulan ini', value: Fmt.rm(s.kpi.collection), period: Fmt.monthLong(s.period) })}
        ${UI.kpi({ label: 'Agihan bulan ini', value: Fmt.rm(s.kpi.distribution), period: Fmt.monthLong(s.period) })}
        ${UI.kpi({ label: 'Asnaf dibantu', value: Fmt.num(s.kpi.asnafSupported), period: 'penerima dalam tempoh' })}
        ${UI.kpi({ label: 'Pembayar berulang', value: Fmt.pct(s.kpi.repeatPayers), period: 'bayar lebih sekali setahun' })}
      </div>
      <div class="grid-2 mt-3">
        ${UI.card(UI.bars(districtRows), { title: 'Agihan ikut daerah' })}
        ${UI.card(UI.bars(programRows) + (hiddenCells.size ? `<p class="tiny muted mt-1">— : ${hiddenCells.size} sel daerah/program di bawah ambang privasi disembunyikan</p>` : ''), { title: 'Program: pelajar / perubatan / usahawan' })}
      </div>`;
  }
  const O7 = {
    path: '/impak', id: 'O7', title: 'Penerbitan Snapshot Impak', nav: 'impak', roles: WORK,
    render(params, query) {
      const periods = [0, 1, 2, 3, 4, 5].map(k => Fmt.addMonths(Fmt.thisMonth(), -k));
      const period = periods.includes(query.tempoh) ? query.tempoh : periods[0];
      const all = Store.state().snapshots.filter(s => s.period === period);
      const working = all.find(s => s.status === 'generated' || s.status === 'pending_approval');
      const published = all.find(s => s.status === 'published');
      const snap = working || published;
      const threshold = Store.settings().privacyThreshold;
      // a published snapshot shares the SNAP-<period> id a new generation would get, so corrections are not offered here
      const canGenerate = !published && (!working || working.status === 'generated');
      const toolbarHtml = toolbar(`
        <label class="small muted">Tempoh</label>
        ${UI.select('tempoh', periods.map(p => {
          const s = Store.state().snapshots.filter(x => x.period === p);
          const tag = s.some(x => x.status === 'published') ? ' (diterbit)' : s.some(x => x.status === 'pending_approval') ? ' (menunggu)' : s.some(x => x.status === 'generated') ? ' (dijana)' : '';
          return { value: p, label: Fmt.month(p) + tag };
        }), period, { change: 'period' })}
        ${UI.btn(working ? 'Jana semula agregat' : 'Jana agregat', { action: 'generate', icon: 'chart', disabled: !canGenerate })}
        <span class="small muted">ambang min: ${esc(threshold)} rekod</span>`);

      let body;
      if (!snap) {
        body = UI.card(UI.emptyState({ icon: 'chart', text: `Belum ada agregat untuk ${Fmt.monthLong(period)}. Tekan Jana agregat.` }));
      } else {
        const districtsWithData = SEED.districts.filter(d => (snap.byDistrict[d] || 0) > 0).length;
        const hiddenList = snap.hiddenCells || [];
        const kpis = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">
          ${UI.kpi({ label: 'Kutipan', value: Fmt.rm(snap.kpi.collection) })}
          ${UI.kpi({ label: 'Agihan', value: Fmt.rm(snap.kpi.distribution) })}
          ${UI.kpi({ label: 'Asnaf', value: Fmt.num(snap.kpi.asnafSupported) })}
          ${UI.kpi({ label: 'Daerah', value: `${districtsWithData}/${SEED.districts.length}` })}
          ${UI.kpi({ label: 'Program', value: String(Object.keys(snap.byProgram).length) })}
        </div>`;
        const hiddenNote = hiddenList.length ? UI.note(`(!) ${hiddenList.length} sel bawah ambang -> disembunyikan: ${hiddenList.map(esc).join(', ')}`, 'warn') : '';
        let actionRow = '';
        if (snap.status === 'generated') {
          actionRow = UI.btn('Hantar untuk kelulusan', { action: 'submitSnap', data: { id: snap.id }, icon: 'arrow' });
        } else if (snap.status === 'pending_approval') {
          actionRow = role() === 'admin'
            ? `${UI.btn('Terbit', { action: 'publishSnap', data: { id: snap.id }, icon: 'share' })} <span class="small muted">Penjana: ${esc(officerName(snap.generatedBy))}. Penerbit mesti orang berbeza.</span>`
            : UI.note('Menunggu admin menerbitkan (dua orang berbeza diperlukan)', 'muted');
        } else if (snap.status === 'published') {
          actionRow = `<span class="small">${UI.badge('published')} ${esc(Fmt.date(snap.publishedAt))} oleh ${esc(officerName(snap.publishedBy))}. Snapshot diterbit adalah kekal; pembetulan ialah snapshot baharu yang menggantikannya.</span>`;
        }
        body = `
          ${UI.card(`<div class="row row--between mb-2" style="flex-wrap:wrap;gap:8px">
              <span><span class="mono">${esc(snap.id)}</span> ${UI.badge(snap.status)}</span>
              <span class="small muted">dijana oleh ${esc(officerName(snap.generatedBy))} · ${esc(Fmt.dateTime(snap.generatedAt))} · ambang ${esc(snap.threshold)}</span>
            </div>${kpis}${hiddenNote ? `<div class="mt-2">${hiddenNote}</div>` : ''}`, { title: `Agregat ${Fmt.monthLong(period)}` })}
          <div class="mt-3">${UI.card(snapshotPreview(snap), { title: 'Pratonton dashboard awam' })}</div>
          <div class="row mt-3" style="gap:8px;flex-wrap:wrap;align-items:center">${actionRow}</div>`;
      }
      const historyRows = Store.state().snapshots.filter(s => s.status === 'published' || s.status === 'superseded')
        .slice().sort((a, b) => b.period.localeCompare(a.period));
      const history = UI.table({
        columns: [
          { key: 'period', label: 'Tempoh', render: s => esc(Fmt.month(s.period)) },
          { key: 'status', label: 'Status', render: s => UI.badge(s.status) },
          { key: 'publishedAt', label: 'Diterbit', render: s => esc(Fmt.date(s.publishedAt)) },
          { key: 'publishedBy', label: 'Oleh', render: s => esc(officerName(s.publishedBy)) },
          { key: 'supersedes', label: 'Menggantikan', render: s => s.supersedes ? `<span class="mono">${esc(s.supersedes)}</span>` : '—' }
        ],
        rows: historyRows, pager: false, empty: 'Belum ada snapshot diterbit.'
      });
      return `
        ${UI.pageHead('Penerbitan Snapshot Impak', '', 'Agregat → ambang privasi → pratonton → kelulusan → terbit. Dua orang berbeza diperlukan.')}
        ${toolbarHtml}
        ${published && !working ? UI.note('Tempoh ini sudah diterbitkan. Snapshot diterbit tidak boleh diubah.', 'muted') : ''}
        ${body}
        <div class="mt-3">${UI.sectionTitle('Sejarah', true)}${history}</div>
        <div class="mt-3">${UI.auditStrip(Store.auditLog().filter(e => e.entity === 'snapshot'))}</div>`;
    },
    actions: {
      generate() {
        const periods = [0, 1, 2, 3, 4, 5].map(k => Fmt.addMonths(Fmt.thisMonth(), -k));
        const q = Router.parse(location.hash).query.tempoh;
        const s = Store.generateSnapshot(periods.includes(q) ? q : periods[0]);
        done(`Agregat ${Fmt.month(s.period)} dijana (${s.hiddenCells.length} sel disembunyikan)`);
      },
      submitSnap(d) {
        Store.submitSnapshot(d.id);
        done(`${d.id} dihantar untuk kelulusan admin`);
      },
      publishSnap(d) {
        UI.confirm(`Terbit ${d.id} ke dashboard awam? Snapshot diterbit adalah kekal.`, () => {
          const res = Store.publishSnapshot(d.id);
          if (!res || !res.ok) { UI.toast(res ? res.error : 'Gagal menerbitkan', 'danger'); return; }
          done(`${d.id} diterbitkan ke dashboard awam`);
        }, { yes: 'Terbit', title: 'Terbit snapshot' });
      }
    },
    change: {
      period(v) { setQuery({ tempoh: v }); }
    }
  };

  /* =====================================================================
     O8 Kelulusan Majikan
     ===================================================================== */
  const O8 = {
    path: '/majikan', id: 'O8', title: 'Kelulusan Majikan', nav: 'majikan', roles: WORK,
    render(params, query) {
      const all = Store.state().employers.filter(e => e.status !== 'draft');
      const n = s => all.filter(e => e.status === s).length;
      const rows = all.filter(e => !query.status || e.status === query.status)
        .slice().sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1) || String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')));
      const table = UI.table({
        columns: [
          { key: 'name', label: 'Majikan', render: e => `${esc(e.name)}<div class="tiny muted">${esc(e.hrName || '')}</div>` },
          { key: 'sector', label: 'Sektor', render: e => esc(SECTOR_LABELS[e.sector] || e.sector || '—') },
          { key: 'size', label: 'Saiz', render: e => esc(e.size || '—') },
          { key: 'ssm', label: 'SSM', render: e => e.ssm === 'ok' ? UI.badge('ok', 'ok') : UI.badge('menunggu', '?') },
          { key: 'district', label: 'Daerah' },
          { key: 'submittedAt', label: 'Dihantar', render: e => esc(Fmt.date(e.submittedAt)) },
          { key: 'status', label: 'Status', render: e => UI.badge(e.status) },
          { key: 'act', label: 'Tindakan', render: e => {
            if (e.status === 'pending') {
              return `<div class="row" style="gap:6px;flex-wrap:nowrap">${UI.btn('Lulus', { sm: true, action: 'approve', data: { id: e.id } })}${UI.btn('Minta dok', { sm: true, variant: 'secondary', action: 'docs', data: { id: e.id } })}</div>`
                + (e.docsRequestedAt ? `<div class="tiny muted">dok diminta ${esc(Fmt.dateTime(e.docsRequestedAt))}</div>` : '');
            }
            if (e.status === 'active') return UI.btn('Gantung', { sm: true, variant: 'danger', action: 'suspend', data: { id: e.id } });
            if (e.status === 'suspended') return `<span class="small muted">${esc(e.suspendReason || 'Digantung')}</span>`;
            return '—';
          } }
        ],
        rows, empty: 'Tiada majikan dalam senarai ini.'
      });
      return `
        ${UI.pageHead('Kelulusan Majikan', '', 'Semak pendaftaran majikan sebelum mereka boleh mendaftarkan pekerja.')}
        <div class="counters">
          ${UI.counter({ label: 'Menunggu', value: n('pending'), href: buildHash('/majikan', { status: 'pending' }), warn: n('pending') > 0 })}
          ${UI.counter({ label: 'Aktif', value: n('active'), href: buildHash('/majikan', { status: 'active' }) })}
          ${UI.counter({ label: 'Digantung', value: n('suspended'), href: buildHash('/majikan', { status: 'suspended' }) })}
        </div>
        ${query.status ? `<div class="row mb-2" style="gap:8px;align-items:center"><span class="small">Penapis: ${UI.badge(query.status)}</span>${UI.btn('Tunjuk semua', { variant: 'ghost', sm: true, nav: '#/majikan' })}</div>` : ''}
        ${table}
        <div class="mt-2">${UI.note('Penggantungan membekukan Pekerja dan Proses Potongan majikan itu.', 'muted')}</div>
        <div class="mt-3">${UI.auditStrip(Store.auditLog().filter(e => e.entity === 'employer'))}</div>`;
    },
    actions: {
      approve(d) {
        const e = Store.employer(d.id); if (!e) return;
        UI.confirm(`Luluskan ${e.name}? HR boleh mula mendaftarkan pekerja ke ${SEED.meta.scheme}.`, () => {
          Store.approveEmployer(e.id);
          done(`${e.name} diluluskan`);
        }, { yes: 'Lulus' });
      },
      docs(d) {
        const e = Store.employer(d.id); if (!e) return;
        UI.openDrawer({
          title: `Minta dokumen: ${e.name}`,
          body: `<form data-submit="docs" class="stack">
            ${hidden('id', e.id)}
            ${UI.field('Nota kepada wakil HR', textarea('note', 'Sila muat naik surat SSM / agensi terkini', { required: true }))}
            <p class="small muted">Dihantar kepada ${esc(e.hrName || 'wakil HR')} &lt;${esc(e.hrEmail || '—')}&gt; (gerbang stub, tiada e-mel sebenar).</p>
            ${UI.btn('Hantar permintaan', { type: 'submit', block: true })}
          </form>`
        });
      },
      suspend(d) {
        const e = Store.employer(d.id); if (!e) return;
        UI.openDrawer({
          title: `Gantung ${e.name}`,
          body: `<form data-submit="suspend" class="stack">
            ${hidden('id', e.id)}
            ${UI.note('Penggantungan membekukan Pekerja dan Proses Potongan majikan itu.', 'warn')}
            ${UI.field('Sebab (wajib)', textarea('reason', '', { required: true, placeholder: 'contoh: fail potongan tidak sepadan berulang kali' }))}
            ${UI.btn('Gantung majikan', { type: 'submit', block: true, variant: 'danger' })}
          </form>`
        });
      }
    },
    submit: {
      docs(data) {
        Store.requestDocs(data.id, String(data.note || '').trim());
        done('Permintaan dokumen dihantar kepada wakil HR');
      },
      suspend(data) {
        const reason = String(data.reason || '').trim();
        if (!reason) { UI.toast('Sebab penggantungan diperlukan', 'warn'); return; }
        Store.suspendEmployer(data.id, reason);
        done('Majikan digantung', 'warn');
      }
    }
  };

  /* =====================================================================
     O9 Log Audit (read-only, append-only: no edit or delete control for any role)
     ===================================================================== */
  const O9 = {
    path: '/audit', id: 'O9', title: 'Log Audit', nav: 'audit', roles: ALL,
    render(params, query) {
      const log = Store.auditLog();
      const actors = Array.from(new Set(log.map(e => e.actor).filter(Boolean))).sort();
      const entities = Array.from(new Set(log.map(e => e.entity).filter(Boolean))).sort();
      const rows = log.filter(e => (!query.tarikh || String(e.at).startsWith(query.tarikh))
        && (!query.pengguna || e.actor === query.pengguna)
        && (!query.entiti || e.entity === query.entiti));
      const bar = toolbar(`
        ${UI.input('tarikh', { type: 'date', value: query.tarikh || '', change: 'tarikh' })}
        ${UI.select('pengguna', actors.map(a => ({ value: a, label: a })), query.pengguna || '', { change: 'pengguna', placeholder: 'Semua pengguna' })}
        ${UI.select('entiti', entities.map(a => ({ value: a, label: a })), query.entiti || '', { change: 'entiti', placeholder: 'Semua entiti' })}
        <div style="flex:1;min-width:200px">${UI.input('q', { value: query.q || '', placeholder: 'cari id korelasi atau id entiti', attrs: 'data-input="search" autocomplete="off"' })}</div>`);
      const table = UI.table({
        columns: [
          { key: 'at', label: 'Masa', render: e => esc(Fmt.dateTime(e.at)) },
          { key: 'actor', label: 'Pengguna' },
          { key: 'entity', label: 'Entiti', render: e => `${esc(e.entity)} <span class="mono">${esc(e.entityId)}</span>` },
          { key: 'action', label: 'Tindakan' },
          { key: 'detail', label: 'Butiran', render: e => `<span class="small">${esc(e.detail || '')}</span>` },
          { key: 'hash', label: 'Hash', render: e => `<span class="mono">${esc(e.hash)}</span>` },
          { key: 'correlationId', label: 'Korelasi', render: e => `<span class="mono">${esc(e.correlationId || '')}</span>` }
        ],
        rows, cls: 'table-wrap--tall', empty: 'Tiada acara sepadan dengan penapis.'
      });
      return `
        ${UI.pageHead('Log Audit', '', 'Siapa buat apa, bila, pada entiti mana. Id korelasi memautkan tindakan pembayar kepada acara susulannya.')}
        ${bar}
        ${table}
        <div class="row row--between mt-2" style="flex-wrap:wrap;gap:8px;align-items:center">
          <span class="small muted">baca sahaja · tambah sahaja · eksport CSV</span>
          ${UI.btn('Eksport CSV', { variant: 'secondary', sm: true, icon: 'download', action: 'exportCsv' })}
        </div>`;
    },
    mount(params, query, root) { if (query.q) applySearch(root, query.q, [2, 6]); },
    actions: {
      exportCsv() { UI.toast('Eksport CSV disediakan (prototaip: tiada fail dimuat turun)', 'ok'); }
    },
    change: {
      search(v) { replaceQuery({ q: v }); applySearch(document.getElementById('view'), v, [2, 6]); },
      tarikh(v) { setQuery({ tarikh: v }); },
      pengguna(v) { setQuery({ pengguna: v }); },
      entiti(v) { setQuery({ entiti: v }); }
    }
  };

  /* =====================================================================
     O10 Tetapan (admin only)
     ===================================================================== */
  const SETTINGS_TABS = [
    { key: 'peranan', label: 'Peranan & pengguna' },
    { key: 'daerah', label: 'Daerah' },
    { key: 'templat', label: 'Templat industri' },
    { key: 'saluran', label: 'Saluran WhatsApp' },
    { key: 'ambang', label: 'Had ambang privasi' },
    { key: 'ai', label: 'Penyedia AI' },
    { key: 'integrasi', label: 'Integrasi' }
  ];
  const O10 = {
    path: '/tetapan', id: 'O10', title: 'Tetapan', nav: 'tetapan', roles: ['admin'],
    render(params, query) {
      const tab = SETTINGS_TABS.some(t => t.key === query.tab) ? query.tab : 'peranan';
      const s = Store.settings();
      let body = '';
      if (tab === 'peranan') {
        body = UI.card(UI.table({
          columns: [
            { key: 'label', label: 'Peranan', render: r => `${esc(r.label)} <span class="mono">${esc(r.role)}</span>` },
            { key: 'canDo', label: 'Boleh', render: r => esc((r.canDo || []).join('; ')) },
            { key: 'cannot', label: 'Tidak boleh', render: r => esc((r.cannot || []).join('; ')) }
          ],
          rows: s.roles || [], pager: false
        }), { title: 'Peranan' }) + `<div class="mt-3">${UI.card(UI.table({
          columns: [
            { key: 'name', label: 'Nama' },
            { key: 'title', label: 'Jawatan' },
            { key: 'role', label: 'Peranan', render: o => esc(UI.label(o.role)) },
            { key: 'district', label: 'Daerah', render: o => esc(o.district || 'Semua') },
            { key: 'industries', label: 'Industri', render: o => esc((o.industries || []).map(UI.label).join(', ') || '—') },
            { key: 'email', label: 'E-mel', render: o => `<span class="mono">${esc(o.email)}</span>` }
          ],
          rows: Store.state().officers, pager: false
        }), { title: 'Pengguna konsol' })}</div>`;
      } else if (tab === 'daerah') {
        body = UI.card(`<div class="list">${SEED.districts.map(d => UI.listItem({ title: d, icon: 'mosque', right: `${Store.state().officers.filter(o => o.district === d).length} pegawai` })).join('')}</div>
          <p class="small muted mt-2">Daerah digunakan untuk agregat snapshot (O7) dan padanan pegawai PKS.</p>`, { title: `Daerah (${SEED.districts.length})` });
      } else if (tab === 'templat') {
        body = UI.card(UI.table({
          columns: [
            { key: 'id', label: 'ID', render: t => `<span class="mono">${esc(t.id)}</span>` },
            { key: 'label', label: 'Industri' },
            { key: 'version', label: 'Versi', render: t => `v${esc(t.version)}` },
            { key: 'method', label: 'Kaedah' },
            { key: 'status', label: 'Status', render: t => { const k = Store.knowledge(t.id); return UI.badge(k ? k.status : t.status); } },
            { key: 'open', label: '', render: t => Store.knowledge(t.id) ? UI.btn('Buka', { sm: true, variant: 'ghost', nav: `#/kandungan/${t.id}` }) : '' }
          ],
          rows: Store.state().smeTemplates, pager: false
        }) + '<p class="small muted mt-2">Versi templat diurus melalui Semakan Kandungan; hanya versi Diterbit digunakan oleh kalkulator.</p>', { title: 'Templat industri' });
      } else if (tab === 'saluran') {
        body = UI.card(`<form data-submit="whatsapp" class="stack" style="max-width:480px">
          ${UI.field('Nombor penghantar WhatsApp rasmi', UI.input('whatsappSender', { value: s.whatsappSender, required: true }), 'Nombor yang dipaparkan kepada pembayar. Mesej hanya dihantar kepada pembayar yang memberi kebenaran.')}
          ${UI.btn('Simpan', { type: 'submit' })}
        </form>`, { title: 'Saluran WhatsApp' });
      } else if (tab === 'ambang') {
        body = UI.card(`<form data-submit="threshold" class="stack" style="max-width:480px">
          ${UI.field('Bilangan rekod minimum setiap sel', UI.input('privacyThreshold', { type: 'number', value: s.privacyThreshold, min: 1, step: 1, required: true }), 'Sel daerah/program dengan rekod kurang daripada ambang ini disembunyikan sebelum snapshot boleh diterbitkan (O7).')}
          ${UI.btn('Simpan', { type: 'submit' })}
        </form>`, { title: 'Had ambang privasi' });
      } else if (tab === 'ai') {
        body = UI.card(`<form data-submit="ai" class="stack" style="max-width:480px">
          ${UI.field('Penyesuai penyedia AI', UI.select('aiProvider', AI_PROVIDERS, s.aiProvider), 'Neutral vendor. Pembantu hanya membaca kandungan Diterbit, tanpa mengira penyedia.')}
          ${UI.btn('Simpan', { type: 'submit' })}
        </form>`, { title: 'Penyedia AI' });
      } else if (tab === 'integrasi') {
        const gws = s.gateways || {};
        body = UI.card(UI.table({
          columns: [
            { key: 'name', label: 'Gerbang', render: g => `${esc(GATEWAY_LABELS[g.name] || g.name)} <span class="mono">${esc(g.name)}</span>` },
            { key: 'value', label: 'Status', render: g => UI.badge(g.value === 'real' ? 'ok' : 'menunggu', UI.label(g.value)) },
            { key: 'switch', label: 'Mod', render: g => `<div class="radio-group">${['stub', 'real'].map(v => `<label class="radio"><input type="radio" name="gw-${esc(g.name)}" value="${v}" ${g.value === v ? 'checked' : ''} data-change="gateway" data-gateway="${esc(g.name)}"> ${esc(UI.label(v))}</label>`).join('')}</div>` }
          ],
          rows: Object.keys(gws).map(name => ({ name, value: gws[name] })), pager: false
        }) + '<p class="small muted mt-2">Setiap gerbang Pusat Zakat kekal stub sehingga ditukar di sini. Setiap pertukaran ialah acara audit.</p>', { title: 'Integrasi: stub / sebenar' });
      }
      return `
        ${UI.pageHead('Tetapan', '', 'Konfigurasi pentadbir. Setiap perubahan ialah acara audit.')}
        ${UI.tabs(SETTINGS_TABS.map(t => ({ key: t.key, label: t.label, href: buildHash('/tetapan', { tab: t.key }) })), tab)}
        <div class="mt-3">${body}</div>
        <div class="mt-3">${UI.note('Rahsia tidak pernah dipaparkan atau dimasukkan di sini; ia hidup dalam konfigurasi persekitaran.', 'muted')}</div>
        <div class="mt-3">${UI.auditStrip(Store.auditLog().filter(e => e.entity === 'settings'), 'Jejak tetapan (tidak boleh dipadam)')}</div>`;
    },
    submit: {
      whatsapp(data) {
        const v = String(data.whatsappSender || '').trim();
        if (!v) { UI.toast('Nombor penghantar diperlukan', 'warn'); return; }
        Store.updateSettings({ whatsappSender: v });
        done('Nombor penghantar WhatsApp disimpan');
      },
      threshold(data) {
        const v = parseInt(data.privacyThreshold, 10);
        if (!(v >= 1)) { UI.toast('Ambang mesti sekurang-kurangnya 1', 'warn'); return; }
        Store.updateSettings({ privacyThreshold: v });
        done(`Ambang privasi ditetapkan kepada ${v} rekod`);
      },
      ai(data) {
        Store.updateSettings({ aiProvider: data.aiProvider });
        done(`Penyedia AI: ${data.aiProvider}`);
      }
    },
    change: {
      gateway(value, el) {
        const name = el.dataset.gateway;
        if (!name) return;
        Store.updateSettings({ gateways: { [name]: value } });
        done(`Gerbang ${GATEWAY_LABELS[name] || name}: ${UI.label(value)}`, value === 'real' ? 'warn' : 'ok');
      }
    }
  };

  window.OFFICER_CONTENT_VIEWS = [O6, O6open, O7, O8, O9, O10];
})();
