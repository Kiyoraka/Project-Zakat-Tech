/* ZakatTech 360 prototype — employer surface (Skim Potongan Gaji Employer Connect), desktop.
 * E1 Pendaftaran Majikan, E2 Dashboard, E3 Kit Onboarding HR, E4 Tetapan Potongan, E5 Pekerja dan Persetujuan,
 * E6 Proses Potongan Bulanan, E7 Laporan. Every state change goes through Store (#5); no consent, no deduction (#6). */
(function () {
  const esc = UI.esc;
  const HR = ['employer_hr'];
  const SECTORS = [
    { value: 'government', label: 'Kerajaan' }, { value: 'factory', label: 'Kilang' },
    { value: 'hospital', label: 'Hospital' }, { value: 'private', label: 'Swasta' }
  ];
  const SIZES = ['1-100', '100-500', '500-1000', '1000+'];
  const CHECKLIST = [
    { key: 'taklimat', text: 'Taklimat HR telah diadakan' },
    { key: 'edaran', text: 'Edaran kepada pekerja telah dihantar' },
    { key: 'sistem_gaji', text: 'Sistem gaji telah disediakan untuk fail CSV' }
  ];
  const WIZARD = ['Syarikat', 'Wakil HR', 'Dokumen', 'Sahkan'];
  const RUN_STEPS = ['Muat naik fail gaji', 'Padan pekerja', 'Sahkan', 'Hantar'];
  let refocusSearch = false;

  /* ---------- helpers ---------- */
  function emp() { return Store.currentEmployer(); }
  function isActive(e) { return !!e && e.status === 'active'; }
  function sectorLabel(v) { const s = SECTORS.find(x => x.value === v); return s ? s.label : (v || '—'); }
  function uniq(list) { return list.filter((x, i) => x && list.indexOf(x) === i); }
  function qs(obj) {
    const parts = Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    return parts.length ? '?' + parts.join('&') : '';
  }
  function eventsFor(pred) { return Store.auditLog().filter(pred); }
  // The live run of a month for an employer: the newest non-superseded one (a correction replaces the old run).
  function runsForMonth(employerId, month) { return Store.employerRuns(employerId).filter(r => r.month === month); }
  function liveRun(employerId, month) {
    const runs = runsForMonth(employerId, month);
    return runs.filter(r => r.status !== 'superseded').pop() || runs[runs.length - 1] || null;
  }
  function liveRuns(employerId) { return Store.employerRuns(employerId).filter(r => r.status !== 'superseded'); }
  function lastMonths(n) { const m = Fmt.thisMonth(); return Array.from({ length: n }, (_, i) => Fmt.addMonths(m, -i)); }
  function lockedView(title) {
    return UI.pageHead(title) + UI.card(UI.emptyState({
      icon: 'shield', text: 'Bahagian ini dibuka selepas pendaftaran majikan diluluskan oleh Pusat Zakat.',
      action: { label: 'Kembali ke Dashboard', nav: '#/' }
    }));
  }
  function wrap(html) { return `<div class="stack">${html}</div>`; }

  /* ---------- shell chrome: brand, nav from status (rule 10: absent, not disabled), HR name ---------- */
  function renderChrome(m) {
    const e = emp();
    const nameEl = document.getElementById('employer-name');
    const userEl = document.getElementById('employer-user');
    const navEl = document.getElementById('employer-nav');
    if (nameEl) nameEl.textContent = e ? e.name : 'Majikan';
    if (userEl) userEl.textContent = e ? (e.hrName || '') : '';
    if (!navEl) return;
    const items = [{ id: 'dashboard', label: 'Dashboard', hash: '#/' }];
    if (isActive(e)) {
      items.push({ id: 'pekerja', label: 'Pekerja', hash: '#/pekerja' });
      items.push({ id: 'potongan', label: 'Potongan', hash: `#/potongan/${Fmt.thisMonth()}` });
      items.push({ id: 'laporan', label: 'Laporan', hash: '#/laporan' });
    }
    items.push({ id: 'kit', label: 'Kit', hash: '#/kit' });
    const cur = m || Router.currentView();
    const activeId = cur && cur.view ? cur.view.nav : '';
    navEl.innerHTML = items.map(i => `<a href="${i.hash}" data-nav="${i.hash}" data-nav-id="${i.id}" class="${i.id === activeId ? 'active' : ''}">${esc(i.label)}</a>`).join('');
  }

  /* ---------- E1 Pendaftaran Majikan ---------- */
  function wizardHash(step, id) { return `#/daftar${qs({ langkah: step, id })}`; }
  function wizardPatch(step, data) {
    if (step === 0) return { name: (data.name || '').trim(), ssmNo: (data.ssmNo || '').trim(), sector: data.sector || '', size: data.size || '', district: data.district || '' };
    if (step === 1) return { hrName: (data.hrName || '').trim(), hrEmail: (data.hrEmail || '').trim(), hrPhone: (data.hrPhone || '').trim() };
    return {};
  }
  function wizardMissing(step, d) {
    if (step === 0 && !d.name) return 'Nama majikan diperlukan';
    if (step === 0 && !d.sector) return 'Pilih sektor';
    if (step === 1 && !d.hrName) return 'Nama wakil HR diperlukan';
    if (step === 1 && !d.hrEmail) return 'E-mel wakil HR diperlukan';
    if (step === 2 && !d.docFile) return 'Pilih surat SSM / agensi dahulu';
    return '';
  }
  function saveStep(step, data, id) {
    const patch = wizardPatch(step, data);
    if (id) patch.id = id;
    return Store.saveEmployerDraft(patch);
  }

  const E1 = {
    path: '/daftar', id: 'E1', title: 'Pendaftaran Majikan', nav: '',
    render(params, query) {
      const draft = query.id ? Store.employer(query.id) : null;
      if (draft && draft.status !== 'draft') {
        return wrap(`${UI.pageHead('Pendaftaran Majikan')}
          ${UI.card(`<div class="stack stack--tight">
              <div>${UI.badge(draft.status)} <strong>Permohonan diterima, semakan 3 hari bekerja</strong></div>
              ${UI.kv([
                { label: 'Majikan', value: draft.name },
                { label: 'No. rujukan', value: draft.reference || '—' },
                { label: 'Dihantar', value: Fmt.date(draft.submittedAt) },
                { label: 'Wakil HR', value: draft.hrName || '—' }
              ])}
              <p class="small muted">Tiada apa-apa diaktifkan sehingga pegawai Pusat Zakat meluluskan permohonan ini. Wakil HR akan menjadi pengguna HR pertama.</p>
            </div>`, { cls: 'card--success', title: 'Status permohonan' })}`);
      }
      const d = draft || {};
      const step = Math.max(0, Math.min(3, parseInt(query.langkah, 10) || 0));
      let body = '';
      if (step === 0) {
        body = `<div class="grid-2">
            ${UI.field('Nama majikan', UI.input('name', { value: d.name || '', placeholder: 'cth. Hospital Daerah', required: true }))}
            ${UI.field('No. SSM / Agensi', UI.input('ssmNo', { value: d.ssmNo || '', placeholder: 'cth. 201901000123' }))}
          </div>
          ${UI.field('Sektor', UI.radios('sector', SECTORS, d.sector || ''))}
          <div class="grid-2">
            ${UI.field('Saiz tenaga kerja', UI.select('size', SIZES.map(s => ({ value: s, label: s })), d.size || '', { placeholder: 'Pilih saiz' }))}
            ${UI.field('Daerah', UI.select('district', SEED.districts.map(x => ({ value: x, label: x })), d.district || '', { placeholder: 'Pilih daerah' }))}
          </div>`;
      } else if (step === 1) {
        body = `<p class="small muted">Wakil HR ini akan menjadi pengguna HR pertama selepas pendaftaran diluluskan.</p>
          <div class="grid-2">
            ${UI.field('Nama wakil HR', UI.input('hrName', { value: d.hrName || '', required: true }))}
            ${UI.field('E-mel', UI.input('hrEmail', { type: 'email', value: d.hrEmail || '', required: true }))}
            ${UI.field('Telefon', UI.input('hrPhone', { type: 'tel', value: d.hrPhone || '', placeholder: '+60 12-345 6789' }))}
          </div>`;
      } else if (step === 2) {
        body = `<div class="dropzone" data-action="pickDoc">${UI.icon('doc')}
            <div class="mt-1"><strong>Surat SSM / surat agensi</strong></div>
            <div class="small">${d.docFile ? `${esc(d.docFile)} — fail dipilih (simulasi)` : 'Klik untuk memilih fail (simulasi, tiada fail dimuat naik)'}</div>
          </div>
          ${d.docFile ? `<p class="mt-2">${UI.badge('ok', 'Fail dipilih')} <span class="small muted">${esc(d.docFile)}</span></p>` : ''}`;
      } else {
        body = `${UI.kv([
            { label: 'Nama majikan', value: d.name || '—' },
            { label: 'No. SSM / Agensi', value: d.ssmNo || '—' },
            { label: 'Sektor', value: sectorLabel(d.sector) },
            { label: 'Saiz tenaga kerja', value: d.size || '—' },
            { label: 'Daerah', value: d.district || '—' },
            { label: 'Wakil HR', value: d.hrName || '—' },
            { label: 'E-mel', value: d.hrEmail || '—' },
            { label: 'Telefon', value: d.hrPhone || '—' },
            { label: 'Dokumen', value: d.docFile ? `${d.docFile} (simulasi)` : 'belum dipilih' }
          ])}
          <div class="mt-2">${UI.check('truth', 'yes', 'Saya mengesahkan maklumat di atas adalah benar dan saya diberi kuasa untuk mendaftarkan majikan ini.', false)}</div>`;
      }
      const back = step > 0 ? UI.btn('Kembali', { variant: 'ghost', nav: wizardHash(step - 1, d.id) }) : '';
      const next = step < 3 ? UI.btn('Seterusnya', { type: 'submit' }) : UI.btn('Hantar', { type: 'submit', icon: 'check' });
      return wrap(`${UI.pageHead('Pendaftaran Majikan', '', 'Untuk agensi kerajaan, kilang, hospital dan majikan swasta yang besar')}
        ${UI.steps(WIZARD, step)}
        ${UI.card(`<form data-submit="${step < 3 ? 'next' : 'send'}" data-step="${step}">
            ${body}
            <div class="row row--between mt-3"><div>${back}</div><div class="row">${UI.btn('Simpan', { variant: 'secondary', action: 'saveDraft', data: { step } })}${next}</div></div>
          </form>`, { title: `Langkah ${step + 1}: ${WIZARD[step]}` })}
        ${d.id ? `<p class="small muted">Draf ${esc(d.id)} disimpan. Pautan ini kekal selepas muat semula halaman.</p>` : ''}`);
    },
    actions: {
      saveDraft(data, el) {
        const q = Router.parse(location.hash).query;
        const step = parseInt(data.step, 10) || 0;
        const form = el.closest('form');
        const row = saveStep(step, form ? UI.formData(form) : {}, q.id);
        UI.toast('Draf disimpan', 'ok');
        Router.go(wizardHash(step, row.id));
      },
      pickDoc() {
        const q = Router.parse(location.hash).query;
        const patch = { docFile: 'surat-ssm-agensi.pdf' };
        if (q.id) patch.id = q.id;
        const row = Store.saveEmployerDraft(patch);
        UI.toast('Fail dipilih (simulasi)', 'ok');
        Router.go(wizardHash(2, row.id));
      }
    },
    submit: {
      next(data, form) {
        const q = Router.parse(location.hash).query;
        const step = parseInt(form.dataset.step, 10) || 0;
        const row = saveStep(step, data, q.id);
        const missing = wizardMissing(step, row);
        if (missing) { UI.toast(missing, 'warn'); Router.go(wizardHash(step, row.id)); return; }
        Router.go(wizardHash(step + 1, row.id));
      },
      send(data) {
        const q = Router.parse(location.hash).query;
        const d = q.id ? Store.employer(q.id) : null;
        if (!d) { UI.toast('Sila lengkapkan langkah 1 dahulu', 'warn'); Router.go(wizardHash(0)); return; }
        for (let s = 0; s < 3; s++) {
          const missing = wizardMissing(s, d);
          if (missing) { UI.toast(missing, 'warn'); Router.go(wizardHash(s, d.id)); return; }
        }
        if (data.truth !== 'yes') { UI.toast('Sila sahkan maklumat adalah benar', 'warn'); return; }
        const e = Store.submitEmployer(d.id);
        UI.toast(`Permohonan dihantar · rujukan ${e.reference}`, 'ok');
        Router.go(`#/daftar?id=${encodeURIComponent(d.id)}`);
      }
    }
  };

  /* ---------- E2 Dashboard Majikan ---------- */
  function statusCard(e) {
    const draft = e.status === 'draft';
    const heading = e.status === 'pending' ? 'Permohonan diterima, semakan 3 hari bekerja'
      : e.status === 'suspended' ? 'Akaun majikan digantung' : 'Pendaftaran belum dihantar';
    return UI.card(`<div class="stack stack--tight">
        <div>${UI.badge(e.status)} <strong>${esc(heading)}</strong></div>
        ${UI.kv([
          { label: 'No. rujukan', value: e.reference || '—' },
          { label: 'Dihantar', value: e.submittedAt ? Fmt.date(e.submittedAt) : '—' },
          { label: 'Semakan', value: e.status === 'pending' ? 'Semakan 3 hari bekerja oleh pegawai Pusat Zakat' : e.status === 'suspended' ? (e.suspendReason || 'Hubungi pegawai Pusat Zakat') : 'Lengkapkan dan hantar pendaftaran' }
        ])}
        ${e.docsNote ? UI.note(`Pegawai meminta dokumen: ${esc(e.docsNote)}`, 'warn') : ''}
        <div class="row">
          ${draft ? UI.btn('Teruskan pendaftaran', { nav: `#/daftar?id=${encodeURIComponent(e.id)}` }) : ''}
          ${UI.btn('Buka Kit Onboarding HR', { variant: draft ? 'secondary' : 'primary', nav: '#/kit', icon: 'doc' })}
        </div>
      </div>`, { title: 'Status pendaftaran majikan', cls: e.status === 'suspended' ? 'card--warn' : '' });
  }

  const E2 = {
    path: '/', id: 'E2', title: 'Dashboard Majikan', roles: HR, nav: 'dashboard',
    render() {
      const e = emp();
      if (!e) return UI.emptyState({ text: 'Tiada majikan untuk akaun ini.' });
      if (!isActive(e)) {
        return wrap(`${UI.pageHead('Dashboard Majikan', '', esc(e.name))}
          ${statusCard(e)}
          ${UI.note('Pekerja, Potongan dan Laporan dibuka selepas pendaftaran diluluskan. Sementara itu, Kit Onboarding HR boleh digunakan untuk bersedia.', 'muted')}`);
      }
      const month = Fmt.thisMonth();
      const year = month.slice(0, 4);
      const enrolled = Store.employerEnrolments(e.id).filter(r => r.status !== 'stopped');
      const latest = liveRuns(e.id)[0] || null;
      const okCount = enrolled.filter(r => r.octStatus === 'ok').length;
      const failCount = enrolled.filter(r => r.octStatus === 'gagal').length;
      const pendingCount = enrolled.filter(r => r.status === 'pending_hr').length;
      const yearTotal = Store.employerRuns(e.id).filter(r => (r.status === 'sent' || r.status === 'acknowledged') && r.month.slice(0, 4) === year).reduce((a, r) => a + (r.total || 0), 0);
      const run = liveRun(e.id, month);
      // progress counts the register (same source as the KPI tiles) so the two never disagree on screen
      const rows = enrolled.length;
      const matched = okCount;
      return wrap(`${UI.pageHead('Dashboard Majikan', UI.btn('Tetapan potongan', { variant: 'ghost', nav: '#/potongan/tetapan', icon: 'settings' }), esc(e.name))}
        <div class="grid-4">
          ${UI.kpi({ label: 'Pekerja didaftar', value: Fmt.num(enrolled.length), period: 'rekod Skim Potongan Gaji' })}
          ${UI.kpi({ label: 'Potongan bulan ini', value: `${Fmt.num(okCount)} ok`, period: latest ? Fmt.month(latest.month) : 'belum diproses' })}
          ${UI.kpi({ label: 'Gagal / belum', value: Fmt.num(failCount + pendingCount), period: `${failCount} gagal · ${pendingCount} menunggu`, warn: true })}
          ${UI.kpi({ label: 'Jumlah tahun ini', value: Fmt.rm(yearTotal), period: `dihantar ${year}` })}
        </div>
        <div class="grid-2">
          ${UI.card(`<div class="stack stack--tight">
              ${UI.progress(matched, rows, true)}
              <div class="row row--between"><strong>${Fmt.num(matched)}/${Fmt.num(rows)}</strong><span class="small muted">${run ? `${esc(UI.label(run.status))} · ${esc(run.file || '')}` : 'Belum diproses'}</span></div>
              <div>${UI.btn('Jana fail potongan', { nav: `#/potongan/${month}`, icon: 'arrow' })}</div>
            </div>`, { title: `Status bulan ${Fmt.month(month)}` })}
          ${UI.card(`${UI.listItem({ title: `${failCount} potongan gagal`, right: 'Lihat', icon: 'warn', nav: '#/pekerja?status=gagal' })}
              ${UI.listItem({ title: `${pendingCount} persetujuan menunggu`, right: 'Lihat', icon: 'users', nav: '#/pekerja?status=pending_hr' })}
              ${run && run.mismatched.length ? UI.listItem({ title: `${run.mismatched.length} tidak sepadan dalam fail ${Fmt.month(month)}`, right: 'Lihat', icon: 'doc', nav: `#/potongan/${month}?senarai=1` }) : ''}
              <p class="tiny muted mt-2">Senarai ini turut dihantar ke e-mel wakil HR sekali setiap proses (tiada e-mel dihantar dalam prototaip).</p>`,
            { title: 'Tindakan diperlukan' })}
        </div>`);
    }
  };

  /* ---------- E3 Kit Onboarding HR ---------- */
  const E3 = {
    path: '/kit', id: 'E3', title: 'Kit Onboarding HR', roles: HR, nav: 'kit',
    render() {
      const e = emp();
      if (!e) return UI.emptyState({ text: 'Tiada majikan untuk akaun ini.' });
      const items = Store.publishedKnowledge('hr_kit');
      const done = Store.checklist(e.id);
      const grid = items.length ? `<div class="grid-3">${items.map(k => UI.card(`
          <p class="small">${esc(k.body.length > 140 ? k.body.slice(0, 140) + '…' : k.body)}</p>
          <div class="row row--between mt-2"><span class="small muted">versi ${esc(k.version)} · ${UI.badge('published')}</span>
            ${UI.btn('Muat turun', { variant: 'secondary', sm: true, icon: 'download', action: 'download', data: { title: k.title } })}</div>`,
        { title: k.title })).join('')}</div>`
        : UI.card(UI.emptyState({ icon: 'doc', text: 'Tiada item kit diterbitkan lagi.' }));
      return wrap(`${UI.pageHead('Kit untuk HR', '', 'Setiap item ialah kandungan yang diterbitkan; kit dikemas kini apabila kandungan diterbitkan semula.')}
        ${grid}
        ${UI.card(`<div class="stack stack--tight">${CHECKLIST.map(c => UI.check('checklist', c.key, esc(c.text), !!done[c.key], { change: 'toggle' })).join('')}</div>`, { title: 'Senarai semak' })}
        ${UI.auditStrip(eventsFor(ev => ev.entityId === e.id))}`);
    },
    actions: {
      download(data) { UI.toast(`Muat turun (simulasi): ${data.title}`); }
    },
    change: {
      toggle(value) {
        const e = emp(); if (!e) return;
        Store.toggleChecklist(e.id, value);
        UI.toast(Store.checklist(e.id)[value] ? 'Senarai semak ditanda' : 'Tanda dibuang', 'ok');
        Router.rerender();
      }
    }
  };

  /* ---------- E4 Tetapan Potongan Gaji ---------- */
  function approverOptions(e) { return uniq([e.approverName, e.hrName, 'En. Hafiz Azman', 'Pn. Norlela Saad']); }
  function csvTemplateToast() { UI.toast(`Templat CSV (simulasi): ${SEED.csvTemplateColumns.join(', ')}`); }

  const E4 = {
    path: '/potongan/tetapan', id: 'E4', title: 'Tetapan Potongan Gaji', roles: HR, nav: 'potongan',
    render() {
      const e = emp();
      if (!isActive(e)) return lockedView('Tetapan Potongan Gaji');
      return wrap(`${UI.pageHead('Tetapan Potongan Gaji', UI.btn('Proses bulan ini', { variant: 'ghost', nav: `#/potongan/${Fmt.thisMonth()}`, icon: 'arrow' }), 'Bagaimana potongan mengalir dari sistem gaji ke proses bulanan')}
        ${UI.card(`<form data-submit="save">
            <div class="grid-2">
              ${UI.field('Sistem gaji', UI.select('payrollSystem', ['SAGA', 'SAP', 'Manual'].map(s => ({ value: s, label: s })), e.payrollSystem || ''))}
              ${UI.field('Tarikh gaji', UI.input('payDay', { type: 'number', value: e.payDay || 25, min: 1, attrs: 'max="31"' }), 'Hari dalam bulan (1-31)')}
            </div>
            ${UI.field('Kaedah fail', UI.radios('fileMethod', [
              { value: 'csv', label: 'Muat naik CSV' },
              { value: 'api', label: 'API', disabled: true, hint: 'jika diluluskan' }
            ], 'csv'), 'CSV ialah kaedah lalai. Pilihan API dibuka selepas keputusan integrasi Pusat Zakat.')}
            <div class="grid-2">
              ${UI.field('Templat CSV', UI.btn('Muat turun', { variant: 'secondary', icon: 'download', action: 'template' }), `Lajur: ${esc(SEED.csvTemplateColumns.join(', '))}`)}
              ${UI.field('Pengesah', UI.select('approverName', approverOptions(e).map(n => ({ value: n, label: n })), e.approverName || '', { placeholder: 'Pilih pengesah' }), 'Hanya pengesah ini boleh mengesahkan proses bulanan')}
              ${UI.field('Had minimum potongan', UI.input('minDeduction', { rm: true, value: e.minDeduction != null ? e.minDeduction : '' }))}
              ${UI.field('Mula berkuat kuasa', UI.input('effectiveFrom', { type: 'month', value: e.effectiveFrom || '' }))}
            </div>
            <div class="row row--between"><span class="small muted">Setiap perubahan direkodkan dalam jejak audit.</span>${UI.btn('Simpan', { type: 'submit' })}</div>
          </form>`)}
        ${UI.auditStrip(eventsFor(ev => ev.entityId === e.id))}`);
    },
    actions: { template: csvTemplateToast },
    submit: {
      save(data) {
        const e = emp(); if (!isActive(e)) return;
        if (!data.approverName) { UI.toast('Namakan seorang pengesah sebelum menyimpan', 'danger'); return; }
        const payDay = parseInt(data.payDay, 10);
        if (!(payDay >= 1 && payDay <= 31)) { UI.toast('Tarikh gaji mesti antara 1 dan 31', 'danger'); return; }
        Store.saveDeductionSettings(e.id, {
          payrollSystem: data.payrollSystem, payDay, fileMethod: 'csv', approverName: data.approverName,
          minDeduction: Fmt.parseMoney(data.minDeduction), effectiveFrom: data.effectiveFrom || e.effectiveFrom
        });
        UI.toast('Tetapan potongan disimpan', 'ok');
        Router.rerender();
      }
    }
  };

  /* ---------- E5 Pekerja dan Persetujuan ---------- */
  function pekerjaHash(patch) {
    const q = Object.assign({}, Router.parse(location.hash).query, patch);
    return `#/pekerja${qs({ cari: q.cari, status: q.status, jabatan: q.jabatan })}`;
  }

  const E5 = {
    path: '/pekerja', id: 'E5', title: 'Pekerja dan Persetujuan', roles: HR, nav: 'pekerja',
    render(params, query) {
      const e = emp();
      if (!isActive(e)) return lockedView('Pekerja dan Persetujuan');
      const cari = (query.cari || '').trim().toLowerCase();
      const status = query.status || '';
      const jabatan = query.jabatan || '';
      const rows = Store.employerEnrolments(e.id).filter(r => {
        if (cari && !(`${r.employeeName} ${r.employeeNo}`.toLowerCase().includes(cari))) return false;
        if (status === 'gagal') { if (r.octStatus !== 'gagal') return false; } else if (status && r.status !== status) return false;
        if (jabatan && r.department !== jabatan) return false;
        return true;
      }).sort((a, b) => a.employeeName.localeCompare(b.employeeName));
      const month = Fmt.month(Fmt.thisMonth()).split(' ')[0];
      const toolbar = `<div class="row row--between"><div class="row">
          ${UI.input('cari', { value: query.cari || '', placeholder: 'Cari nama atau no. pekerja', attrs: 'data-input="search" autocomplete="off"' })}
          ${UI.select('status', [
            { value: 'pending_hr', label: 'Menunggu HR' }, { value: 'active', label: 'Aktif' }, { value: 'stopping', label: 'Berhenti (gaji seterusnya)' },
            { value: 'stopped', label: 'Dihentikan' }, { value: 'gagal', label: `Gagal (${month})` }
          ], status, { change: 'status', placeholder: 'Semua status' })}
          ${UI.select('jabatan', (e.departments || []).map(d => ({ value: d, label: d })), jabatan, { change: 'jabatan', placeholder: 'Semua jabatan' })}
        </div>${UI.btn('+ Jemput pekerja', { action: 'invite' })}</div>`;
      const table = UI.table({
        rows,
        columns: [
          { key: 'employeeName', label: 'Nama', render: r => `${esc(r.employeeName)}<div class="tiny muted">${esc(r.department || '—')}</div>` },
          { key: 'employeeNo', label: 'No. pekerja' },
          { key: 'amount', label: 'Potongan (RM)', num: true, render: r => esc(Fmt.num(r.amount)) },
          { key: 'consent', label: 'Persetujuan', render: r => r.consentGivenAt ? `${UI.badge('granted', 'Diberi')} <span class="small muted">${Fmt.date(r.consentGivenAt)}</span>` : UI.badge('pending', 'Menunggu') },
          { key: 'octStatus', label: `Status ${month}`, render: r => r.octStatus ? UI.badge(r.octStatus) : '<span class="muted">—</span>' },
          { key: 'actions', label: 'Tindakan', render: r => r.status === 'pending_hr' ? UI.btn('Sahkan', { sm: true, action: 'confirm', data: { id: r.id } })
            : r.status === 'active' ? UI.btn('Hentikan', { sm: true, variant: 'ghost', action: 'stop', data: { id: r.id, name: r.employeeName } })
            : UI.badge(r.status) }
        ],
        empty: 'Tiada pekerja sepadan',
        emptyAction: { label: 'Kosongkan tapisan', nav: '#/pekerja' }
      });
      return wrap(`${UI.pageHead('Pekerja dan Persetujuan', '', 'Daftar penyertaan Skim Potongan Gaji. Tiada baris tanpa persetujuan sampai ke proses bulanan.')}
        ${UI.card(`${toolbar}<div class="mt-2">${table}</div>`)}
        ${UI.note('HR hanya melihat maklumat potongan gaji pekerja; rekod zakat lain pekerja tidak dikongsi.', 'muted')}`);
    },
    mount(params, query, root) {
      if (!refocusSearch) return;
      refocusSearch = false;
      const el = root.querySelector('input[name="cari"]');
      if (el) { el.focus(); const n = el.value.length; try { el.setSelectionRange(n, n); } catch (err) { /* ignore */ } }
    },
    change: {
      search(v) { refocusSearch = true; Router.go(pekerjaHash({ cari: v })); },
      status(v) { Router.go(pekerjaHash({ status: v })); },
      jabatan(v) { Router.go(pekerjaHash({ jabatan: v })); }
    },
    actions: {
      confirm(data) {
        Store.confirmEnrolment(data.id);
        UI.toast('Penyertaan disahkan', 'ok');
        Router.rerender();
      },
      stop(data) {
        UI.confirm(`Hentikan potongan untuk ${data.name}? Berkuat kuasa gaji seterusnya.`, () => {
          Store.stopEnrolment(data.id, 'HR');
          UI.toast('Potongan akan dihentikan mulai gaji seterusnya', 'ok');
          Router.rerender();
        }, { yes: 'Hentikan', danger: true, title: 'Hentikan potongan' });
      },
      invite() {
        UI.openDrawer({
          title: 'Jemput pekerja',
          body: `<form data-submit="invite">
              ${UI.field('Nama pekerja', UI.input('name', { required: true }))}
              ${UI.field('E-mel atau telefon', UI.input('contact', { required: true, placeholder: 'nama@majikan.my atau +60 12-345 6789' }), 'Pautan Skim Potongan Gaji dihantar sekali sahaja. Tiada mesej lain dihantar.')}
              <div class="row">${UI.btn('Hantar pautan', { type: 'submit' })}${UI.btn('Batal', { variant: 'secondary', data: { 'close-panel': 'drawer' } })}</div>
            </form>`
        });
      }
    },
    submit: {
      invite(data) {
        const e = emp(); if (!e) return;
        const name = (data.name || '').trim(), contact = (data.contact || '').trim();
        if (!name || !contact) { UI.toast('Isi nama dan e-mel atau telefon', 'warn'); return; }
        Store.inviteEmployee(e.id, name, contact);
        UI.closePanels();
        UI.toast('Pautan Skim Potongan Gaji dihantar (simulasi)', 'ok');
        Router.rerender();
      }
    }
  };

  /* ---------- E6 Proses Potongan Bulanan ---------- */
  function runStepIndex(run) {
    if (!run) return 0;
    if (run.status === 'sent' || run.status === 'acknowledged') return 3;
    return 2; // matched / confirmed: waiting for the named approver
  }
  function potonganHash(month, patch) {
    const q = Object.assign({}, Router.parse(location.hash).query, patch);
    return `#/potongan/${month}${qs({ senarai: q.senarai })}`;
  }
  function mismatchBlock(run, open, month) {
    const n = run.mismatched.length;
    const head = `<div class="row row--between"><div><strong>${Fmt.num(run.matched)} sepadan</strong> · <span class="${n ? '' : 'muted'}">${Fmt.num(n)} tidak sepadan</span></div>
      ${n ? UI.btn(open ? 'Tutup senarai' : 'Lihat & betulkan', { variant: 'secondary', sm: true, nav: potonganHash(month, { senarai: open ? '' : '1' }) }) : ''}</div>`;
    if (!open || !n) return head;
    return head + `<div class="mt-2">${UI.table({
      rows: run.mismatched, pager: false,
      columns: [
        { key: 'employeeNo', label: 'No. pekerja' },
        { key: 'employeeName', label: 'Nama' },
        { key: 'reason', label: 'Sebab', render: r => UI.badge(r.reason === 'tiada persetujuan' ? 'gagal' : 'pending', r.reason) }
      ]
    })}</div>
    <p class="tiny muted mt-1">Baris tanpa persetujuan aktif tidak dipotong. Betulkan di ${'<a data-nav="#/pekerja?status=pending_hr">Pekerja</a>'} kemudian buat pembetulan.</p>`;
  }

  const E6 = {
    path: '/potongan/:bulan', id: 'E6', title: 'Proses Potongan Bulanan', roles: HR, nav: 'potongan',
    render(params, query) {
      const e = emp();
      if (!isActive(e)) return lockedView('Proses Potongan Bulanan');
      const month = params.bulan;
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return UI.emptyState({ icon: 'calendar', text: 'Bulan tidak sah.', action: { label: 'Bulan ini', nav: `#/potongan/${Fmt.thisMonth()}` } });
      }
      const months = lastMonths(6);
      if (!months.includes(month)) months.push(month);
      const run = liveRun(e.id, month);
      const older = runsForMonth(e.id, month).filter(r => r !== run);
      const idx = runStepIndex(run);
      const open = query.senarai === '1';
      const statusLine = run
        ? `Status: ${UI.badge(run.status)} <span class="small muted">${run.sentAt ? `dihantar ${Fmt.dateTime(run.sentAt)}` : `diproses ${Fmt.dateTime(run.uploadedAt)}`} · ${esc(run.id)}</span>`
        : `<span class="small muted">Status: belum dimuat naik</span>`;
      const header = `<div class="row">
          ${UI.select('bulan', months.map(m => ({ value: m, label: Fmt.month(m) })), month, { change: 'month' })}
          <div>${statusLine}</div>
        </div>`;
      let body;
      if (!run) {
        body = UI.card(`<div class="dropzone" data-action="upload">${UI.icon('download')}
            <div class="mt-1"><strong>Letak fail gaji di sini (simulasi)</strong></div>
            <div class="small">Klik untuk memuat naik fail gaji ${esc(Fmt.month(month))}. Hanya pekerja dengan persetujuan aktif akan dipadankan.</div>
          </div>
          <p class="small mt-2">Format fail: ${UI.btn('Templat CSV', { variant: 'ghost', sm: true, icon: 'doc', action: 'template' })}</p>`, { title: 'Muat naik fail gaji' });
      } else if (run.status === 'sent' || run.status === 'acknowledged') {
        body = `${UI.card(`<div class="stack stack--tight">
              <div>${UI.badge(run.status)} <strong>${run.status === 'acknowledged' ? 'Disahkan oleh Pusat Zakat' : 'Dihantar, menunggu pengesahan Pusat Zakat'}</strong></div>
              ${UI.kv([
                { label: 'Fail', value: run.file || '—' },
                { label: 'Disahkan oleh', value: run.approvedBy || '—' },
                { label: 'Dihantar', value: Fmt.dateTime(run.sentAt) },
                { label: 'Jumlah potongan', value: Fmt.rm(run.total), total: true }
              ])}
              <p class="tiny muted">Dihantar melalui gerbang gaji stub (prototaip). Proses tidak boleh dipadam; pembetulan mencipta proses baharu yang merujuk proses ini.</p>
              <div>${UI.btn('Pembetulan', { variant: 'secondary', action: 'correct', data: { id: run.id } })}</div>
            </div>`, { cls: 'card--success', title: `Proses ${Fmt.month(month)}` })}
          ${UI.card(mismatchBlock(run, open, month), { title: 'Padanan pekerja' })}`;
      } else {
        const opts = uniq([e.approverName, e.hrName]);
        body = `${UI.card(mismatchBlock(run, open, month), { title: 'Padanan pekerja' })}
          ${UI.card(`<form data-submit="confirm">
              <div class="row row--between"><div>Jumlah potongan</div><div class="kpi__value">${Fmt.rm(run.total)}</div></div>
              <div class="grid-2 mt-2">
                ${UI.field('Pengesah', UI.select('approver', opts.map(n => ({ value: n, label: n })), '', { placeholder: 'Pilih pengesah' }), `Pengesah dinamakan di Tetapan Potongan: ${esc(e.approverName || 'belum dinamakan')}`)}
              </div>
              <div class="row row--between"><span class="tiny muted">Dihantar melalui gerbang gaji stub sehingga integrasi disahkan.</span>
                <div class="row">${UI.btn('Muat naik semula', { variant: 'ghost', action: 'correct', data: { id: run.id } })}${UI.btn('Sahkan & hantar ke Pusat Zakat', { type: 'submit', icon: 'check' })}</div></div>
            </form>`, { title: 'Sahkan' })}`;
      }
      const supersededNote = older.length ? UI.note(`Proses terdahulu bulan ini diganti: ${older.map(r => `${esc(r.id)} (${esc(UI.label(r.status))})`).join(', ')}${run && run.supersedes ? ` · proses semasa merujuk ${esc(run.supersedes)}` : ''}`, 'muted') : '';
      return wrap(`${UI.pageHead('Proses Potongan Bulanan', UI.btn('Tetapan', { variant: 'ghost', nav: '#/potongan/tetapan', icon: 'settings' }))}
        ${header}
        ${UI.steps(RUN_STEPS, idx)}
        ${supersededNote}
        ${body}
        ${UI.auditStrip(eventsFor(ev => String(ev.entityId || '').startsWith(`RUN-${month}`)), 'jejak audit: siapa, bila, jumlah (tidak boleh dipadam)')}`);
    },
    change: {
      month(v) { Router.go(`#/potongan/${v}`); }
    },
    actions: {
      template: csvTemplateToast,
      upload() {
        const e = emp(); const cv = Router.currentView(); if (!e || !cv) return;
        const r = Store.createRun(e.id, cv.params.bulan);
        UI.toast(`Fail dimuat naik (simulasi): ${r.matched} sepadan, ${r.mismatched.length} tidak sepadan`, 'ok');
        Router.rerender();
      },
      correct(data) {
        const e = emp(); const cv = Router.currentView(); if (!e || !cv) return;
        UI.confirm(`Cipta proses pembetulan untuk ${Fmt.month(cv.params.bulan)}? Proses ${data.id} akan ditanda "Diganti" tetapi kekal dalam rekod.`, () => {
          const r = Store.createRun(e.id, cv.params.bulan, data.id);
          UI.toast(`Proses pembetulan ${r.id} dicipta`, 'ok');
          Router.rerender();
        }, { yes: 'Cipta pembetulan', title: 'Pembetulan' });
      }
    },
    submit: {
      confirm(data) {
        const e = emp(); const cv = Router.currentView(); if (!e || !cv) return;
        const run = liveRun(e.id, cv.params.bulan); if (!run) return;
        if (!data.approver) { UI.toast('Pilih pengesah', 'warn'); return; }
        const res = Store.confirmRun(run.id, data.approver);
        if (!res.ok) { UI.toast(res.error, 'danger'); return; }
        UI.toast(`Dihantar ke Pusat Zakat: ${Fmt.rm(res.run.total)}`, 'ok');
        Router.rerender();
      }
    }
  };

  /* ---------- E7 Laporan ---------- */
  const E7 = {
    path: '/laporan', id: 'E7', title: 'Laporan', roles: HR, nav: 'laporan',
    render(params, query) {
      const e = emp();
      if (!isActive(e)) return lockedView('Laporan');
      const all = Store.employerRuns(e.id);
      const years = uniq([Fmt.thisMonth().slice(0, 4)].concat(all.map(r => r.month.slice(0, 4)))).sort().reverse();
      const year = years.includes(query.tempoh) ? query.tempoh : years[0];
      const runs = all.filter(r => r.month.slice(0, 4) === year);
      const trend = runs.filter(r => r.status !== 'superseded').slice().sort((a, b) => a.month.localeCompare(b.month));
      const deptTotals = {};
      Store.employerEnrolments(e.id).filter(r => r.status === 'active').forEach(r => {
        const d = r.department || '—'; deptTotals[d] = (deptTotals[d] || 0) + (r.amount || 0);
      });
      const deptRows = Object.keys(deptTotals).sort((a, b) => deptTotals[b] - deptTotals[a]).map(d => ({ label: d, value: deptTotals[d] }));
      const actions = `${UI.select('tempoh', years.map(y => ({ value: y, label: y })), year, { change: 'year' })}
        ${UI.btn('Jana PDF', { variant: 'secondary', icon: 'doc', action: 'pdf' })}
        ${UI.btn('Eksport CSV', { variant: 'secondary', icon: 'download', action: 'csv' })}`;
      return wrap(`${UI.pageHead('Laporan', actions, 'Data peribadi majikan daripada proses potongan anda sendiri')}
        <div class="grid-2">
          ${UI.card(UI.sparkline(trend.map(r => r.matched), trend.map(r => Fmt.month(r.month))), { title: 'Trend penyertaan' })}
          ${UI.card(deptRows.length ? UI.bars(deptRows) : UI.emptyState({ icon: 'chart', text: 'Tiada penyertaan aktif' }), { title: 'Potongan ikut jabatan' })}
        </div>
        ${UI.card(UI.table({
          rows: runs.slice().sort((a, b) => b.month.localeCompare(a.month) || b.id.localeCompare(a.id)),
          rowHref: r => `#/potongan/${r.month}`,
          empty: `Tiada proses potongan untuk ${year}`,
          columns: [
            { key: 'month', label: 'Bulan', render: r => esc(Fmt.month(r.month)) + (r.supersedes ? ` <span class="tiny muted">(pembetulan)</span>` : '') },
            { key: 'matched', label: 'Pekerja', num: true, render: r => esc(Fmt.num(r.matched)) },
            { key: 'total', label: 'Jumlah (RM)', num: true, render: r => esc(Fmt.num(r.total)) },
            { key: 'gagal', label: 'Gagal', num: true, render: r => esc(Fmt.num((r.mismatched || []).length)) },
            { key: 'file', label: 'Fail', render: r => esc(r.file || '—') },
            { key: 'status', label: 'Status', render: r => UI.badge(r.status) }
          ]
        }), { title: 'Senarai bulanan' })}`);
    },
    change: {
      year(v) { Router.go(`#/laporan?tempoh=${encodeURIComponent(v)}`); }
    },
    actions: {
      pdf() { const q = Router.parse(location.hash).query; UI.toast(`Laporan PDF dijana (simulasi) untuk ${q.tempoh || Fmt.thisMonth().slice(0, 4)}`); },
      csv() { UI.toast('Eksport CSV (simulasi): bulan, pekerja, jumlah, gagal, fail, status'); }
    }
  };

  // E4 must be registered before E6 so /potongan/tetapan is not read as a month.
  Router.register([E1, E2, E3, E4, E5, E6, E7]);
  Router.start({ defaultHash: '#/', requireRoles: HR, onRender: renderChrome });
  renderChrome();
})();
