/* ZakatTech 360 prototype — public surface: P1 Landing, P2 Trust and Impact Dashboard, P3 Impact Story Detail.
 * Reads published snapshots and published knowledge only (#4, #7). No login wall. */
(function () {
  const esc = UI.esc;
  const PROGRAMS = ['pelajar', 'perubatan', 'usahawan', 'lain'];

  function storyCard(st) {
    return `<a class="card card--feature card--link story" data-nav="#/impak/kisah/${esc(st.knowledgeId)}">
      ${UI.illustration(st.illustration, true)}
      <h3 class="card__title mt-2">${esc(st.title)}</h3>
      <div class="story__meta">${esc(st.district)} · ${esc(UI.label(st.program))} · ${esc(st.year)}</div>
    </a>`;
  }
  function storiesRow(title) {
    const stories = Store.publishedStories().slice(0, 3);
    if (!stories.length) return ''; // no stories published yet -> the row hides itself
    return `<section class="section"><div class="container">
      <div class="row row--between"><div>${UI.sectionTitle(title || 'Kisah impak terbaru', true)}</div>${UI.btn('Lihat semua', { variant: 'ghost', nav: '#/impak' })}</div>
      <div class="grid-3 mt-2">${stories.map(storyCard).join('')}</div>
    </div></section>`;
  }

  /* ---------- P1 Landing ---------- */
  const P1 = {
    path: '/', id: 'P1', title: 'Utama', nav: 'utama',
    render() {
      const pillars = [
        { n: 1, title: 'Pembayar', desc: 'Kira, bayar, simpan resit dan terima peringatan.', href: 'payer.html#/masuk' },
        { n: 2, title: 'Majikan', desc: 'Potongan gaji bulanan untuk pekerja anda.', href: 'employer.html#/daftar' },
        { n: 3, title: 'PKS', desc: 'Panduan zakat perniagaan ikut industri, disahkan pegawai.', href: 'payer.html#/perniagaan' },
        { n: 4, title: 'Impak', desc: 'Lihat ke mana zakat pergi, daerah demi daerah.', nav: '#/impak' },
        { n: 5, title: 'Tanya AI', desc: 'Jawapan daripada sumber yang diluluskan sahaja.', href: 'payer.html#/tanya' }
      ];
      return `
      <section class="hero"><div class="hero__inner container">
        <p class="small">Lapisan digital di atas Pusat Zakat</p>
        <h1>${esc(SEED.meta.tagline)}</h1>
        <div class="rule-ornament"></div>
        <p>Kira dengan kaedah rasmi, bayar melalui portal rasmi, dan lihat manfaatnya dengan jelas.</p>
        <div class="hero__actions">
          ${UI.btn('Kira zakat saya', { href: 'payer.html#/masuk', icon: 'calc' })}
          ${UI.btn('Bayar sekarang → Portal Bayaran Rasmi', { href: 'portal-bayaran.html', external: true, variant: 'secondary', icon: 'external' })}
        </div>
      </div></section>

      <section class="section"><div class="container">
        ${UI.sectionTitle('Lima pilar, satu klik masuk', true)}
        <div class="pillars mt-2">${pillars.map(p => `
          <a class="card card--feature card--link pillar" ${p.nav ? `data-nav="${p.nav}"` : `href="${p.href}"`}>
            <div class="pillar__num">${p.n}</div>
            <div class="pillar__title">${esc(p.title)}</div>
            <div class="pillar__desc">${esc(p.desc)}</div>
          </a>`).join('')}</div>
        <p class="small muted mt-2">Satu kad setiap pilar. Bayaran sentiasa dibuka di Portal Bayaran Rasmi; platform ini bukan gerbang bayaran.</p>
      </div></section>

      ${storiesRow()}`;
    }
  };

  /* ---------- P2 Trust and Impact Dashboard ---------- */
  const P2 = {
    path: '/impak', id: 'P2', title: 'Impak', nav: 'impak',
    render(params, query) {
      const published = Store.publishedSnapshots();
      const periods = published.map(s => s.period);
      const current = Fmt.thisMonth();
      if (!periods.includes(current)) periods.unshift(current); // lets the demo show the "not yet published" state
      const period = query.tempoh && periods.includes(query.tempoh) ? query.tempoh : (published[0] ? published[0].period : current);
      const district = query.daerah && SEED.districts.includes(query.daerah) ? query.daerah : '';
      const snap = Store.snapshotForPeriod(period);
      const selectors = `<div class="row">
        ${UI.select('tempoh', periods.map(p => ({ value: p, label: Fmt.month(p) + (Store.snapshotForPeriod(p) ? '' : ' (belum diterbit)') })), period, { change: 'period' })}
        ${UI.select('daerah', SEED.districts.map(d => ({ value: d, label: d, disabled: !snap || !(d in snap.byDistrict) })), district, { change: 'district', placeholder: 'Semua daerah' })}
      </div>`;
      let body;
      if (!snap) {
        body = UI.card(UI.emptyState({ icon: 'chart', text: 'Belum diterbitkan untuk tempoh ini.', action: published[0] ? { label: `Lihat ${Fmt.month(published[0].period)}`, nav: `#/impak?tempoh=${published[0].period}` } : null }));
      } else {
        const hidden = new Set(snap.hiddenCells || []);
        const districtRows = (district ? [district] : SEED.districts).map(d => ({ label: d, value: snap.byDistrict[d] || 0 }));
        const programRows = PROGRAMS.map(p => ({
          label: UI.label(p),
          value: district ? Math.round((snap.byDistrict[district] || 0) * (snap.byProgram[p] / snap.kpi.distribution)) : snap.byProgram[p],
          hidden: district ? hidden.has(`${district}/${p}`) : false
        }));
        const trend = snap.trend || [];
        const labels = trend.map((_, i) => Fmt.MONTHS[(Fmt.parse(period).getMonth() - (trend.length - 1 - i) + 24) % 12]);
        body = `
        <div class="grid-4">
          ${UI.kpi({ label: 'Kutipan bulan ini', value: Fmt.rm(snap.kpi.collection), period: Fmt.monthLong(period) })}
          ${UI.kpi({ label: 'Agihan bulan ini', value: Fmt.rm(snap.kpi.distribution), period: Fmt.monthLong(period) })}
          ${UI.kpi({ label: 'Asnaf dibantu', value: Fmt.num(snap.kpi.asnafSupported), period: 'penerima dalam tempoh' })}
          ${UI.kpi({ label: 'Pembayar berulang', value: Fmt.pct(snap.kpi.repeatPayers), period: 'bayar lebih sekali setahun' })}
        </div>
        <div class="grid-2 mt-3">
          ${UI.card(UI.sparkline(trend, labels), { title: 'Trend kutipan 12 bulan' })}
          ${UI.card(UI.bars(districtRows), { title: district ? `Agihan: ${district}` : 'Agihan ikut daerah' })}
          ${UI.card(UI.bars(programRows) + (programRows.some(r => r.hidden) ? '<p class="tiny muted mt-1">— : sel di bawah ambang privasi disembunyikan</p>' : ''), { title: 'Program: pelajar / perubatan / usahawan' })}
          ${UI.card(`<div class="stack--tight stack">
              <div>${UI.badge('published', 'Data disahkan, agregat')} <span class="small muted">diterbit ${Fmt.date(snap.publishedAt)}</span></div>
              <div class="small muted">Setiap angka datang daripada snapshot yang diterbitkan (${esc(snap.id)}), bukan pertanyaan langsung. Ambang privasi: ${esc(snap.threshold)} rekod setiap sel.</div>
              ${snap.supersedes ? `<div class="note note--warn small">Snapshot ini menggantikan ${esc(snap.supersedes)} (pembetulan).</div>` : ''}
            </div>`, { title: 'Tentang data ini' })}
        </div>`;
      }
      return `<section class="section"><div class="container">
        <div class="page-head"><div><h1>Impak Zakat</h1><div class="muted small">Pelaporan awam yang disahkan dan diagregat</div></div>${selectors}</div>
        ${body}
      </div></section>
      ${storiesRow('Kisah impak')}`;
    },
    change: {
      period(v) { const q = Router.parse(location.hash).query; Router.go(`#/impak?tempoh=${encodeURIComponent(v)}${q.daerah ? `&daerah=${encodeURIComponent(q.daerah)}` : ''}`); },
      district(v) { const q = Router.parse(location.hash).query; Router.go(`#/impak?tempoh=${encodeURIComponent(q.tempoh || '')}${v ? `&daerah=${encodeURIComponent(v)}` : ''}`); }
    }
  };

  /* ---------- P3 Impact Story Detail ---------- */
  const P3 = {
    path: '/impak/kisah/:id', id: 'P3', title: 'Kisah impak', nav: 'impak',
    render(params) {
      const k = Store.knowledge(params.id);
      const st = Store.story(params.id);
      if (!k || !st || k.status !== 'published') {
        return `<section class="section"><div class="container">${UI.emptyState({ icon: 'doc', text: 'Kisah ini belum diterbitkan.', action: { label: 'Kembali ke Impak', nav: '#/impak' } })}</div></section>`;
      }
      return `<section class="section"><div class="container" style="max-width:720px">
        <a class="btn btn--ghost btn--sm" data-nav="#/impak">${UI.icon('back')} Kembali</a>
        <div class="mt-2">${UI.illustration(st.illustration)}</div>
        <h1 class="mt-3">${esc(st.title)}</h1>
        <div class="muted small">${esc(st.district)} · ${esc(UI.label(st.program))} · ${esc(st.year)}</div>
        <div class="rule-ornament rule-ornament--left"></div>
        ${st.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}
        <div class="mt-3">${UI.badge('approved', 'Disemak & diluluskan')} <span class="small muted">${k.approvedAt ? Fmt.date(k.approvedAt) : ''} · tiada nama, tiada wajah, tiada butiran pengenalan</span></div>
      </div></section>`;
    }
  };

  Router.register([P1, P2, P3]);
  Router.start({ defaultHash: '#/' });
})();
