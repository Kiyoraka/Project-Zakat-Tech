/* ZakatTech 360 prototype — public surface: P1 Landing, P2 Trust and Impact Dashboard, P3 Impact Story Detail.
 * Reads published snapshots and published knowledge only (#4, #7). No login wall. */
(function () {
  const esc = UI.esc;
  const PROGRAMS = ['pelajar', 'perubatan', 'usahawan', 'lain'];

  /* ---------- small helpers ---------- */
  function compactRm(n) { // RM 1,850,000 -> "1.85" + "juta"
    if (n >= 1e6) return { value: (n / 1e6).toFixed(2).replace(/\.?0+$/, ''), unit: 'juta' };
    if (n >= 1e3) return { value: Math.round(n / 1e3).toString(), unit: 'ribu' };
    return { value: Fmt.num(n), unit: '' };
  }
  function reveal(root) {
    const items = root.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { items.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(el => io.observe(el));
  }

  function storyCard(st, i) {
    return `<a class="story-card reveal" style="--i:${i}" data-nav="#/impak/kisah/${esc(st.knowledgeId)}">
      <div class="illustration--arch" aria-hidden="true">${esc(st.illustration || '')}</div>
      <div class="story-card__body">
        <div class="story-card__meta">${esc(st.district)} · ${esc(UI.label(st.program))} · ${esc(st.year)}</div>
        <h3>${esc(st.title)}</h3>
        <span class="story-card__cta">Baca kisah ${UI.icon('arrow')}</span>
      </div>
    </a>`;
  }
  function storiesRow(title) {
    const stories = Store.publishedStories().slice(0, 3);
    if (!stories.length) return ''; // no stories published yet -> the row hides itself
    return `<section class="section"><div class="container">
      <div class="section-head reveal">
        <div><span class="eyebrow">Kisah impak</span><h2 class="section-title">${esc(title || 'Angka yang menjadi cerita')}</h2><div class="rule-ornament rule-ornament--left"></div><p>Setiap kisah disemak dan diluluskan sebelum diterbitkan. Tiada nama, tiada wajah, tiada butiran pengenalan.</p></div>
        ${UI.btn('Lihat semua', { variant: 'secondary', sm: true, nav: '#/impak' })}
      </div>
      <div class="story-grid">${stories.map(storyCard).join('')}</div>
    </div></section>`;
  }

  /* ---------- P1 Landing ---------- */
  const PILLARS = [
    { n: '01', title: 'Pembayar', icon: 'user', size: 'lg', desc: 'Kira dengan kaedah rasmi, bayar melalui portal rasmi, simpan resit dan terima peringatan yang anda benarkan.', href: 'payer.html#/masuk' },
    { n: '02', title: 'Majikan', icon: 'users', size: 'lg', desc: 'Skim Potongan Gaji untuk pekerja anda: pendaftaran, persetujuan, proses bulanan dan laporan dalam satu tempat.', href: 'employer.html#/daftar' },
    { n: '03', title: 'PKS', icon: 'store', size: 'sm', desc: 'Panduan zakat perniagaan ikut industri, disahkan pegawai.', href: 'payer.html#/perniagaan' },
    { n: '04', title: 'Impak', icon: 'chart', size: 'sm', desc: 'Lihat ke mana zakat pergi, daerah demi daerah.', nav: '#/impak' },
    { n: '05', title: 'Tanya AI', icon: 'chat', size: 'sm', desc: 'Jawapan daripada kandungan yang diluluskan sahaja.', href: 'payer.html#/tanya' }
  ];
  const STEPS = [
    { icon: 'calc', title: 'Kira', desc: 'Kalkulator mengikut kaedah rasmi Pusat Zakat, dengan penjelasan yang diluluskan.' },
    { icon: 'external', title: 'Bayar', desc: 'Serahan ke Portal Bayaran Rasmi dengan rujukan. Tiada butiran kad di sini.' },
    { icon: 'receipt', title: 'Resit', desc: 'Resit rasmi kembali ke peti resit anda secara automatik, sedia untuk musim cukai.' }
  ];

  function heroCard(snap) {
    if (!snap) {
      return `<div class="glass-stat"><div class="glass-stat__label">Pusat Zakat</div><div class="glass-stat__value" style="font-size:1.6rem">${esc(SEED.meta.tagline)}</div><p class="small mt-2" style="color:rgba(255,255,255,.75)">Papan pemuka impak diterbitkan selepas semakan.</p></div>`;
    }
    const c = compactRm(snap.kpi.collection);
    return `<div class="glass-stat">
      <div class="glass-stat__label">Impak · ${esc(Fmt.month(snap.period))}</div>
      <div class="glass-stat__value">RM ${esc(c.value)}<span class="glass-stat__unit">${esc(c.unit)}</span></div>
      <div class="tiny" style="color:rgba(255,255,255,.65)">kutipan bulan ini</div>
      <div class="glass-stat__row">
        <div><small>Agihan</small><strong>RM ${esc(compactRm(snap.kpi.distribution).value)} ${esc(compactRm(snap.kpi.distribution).unit)}</strong></div>
        <div><small>Asnaf dibantu</small><strong>${Fmt.num(snap.kpi.asnafSupported)}</strong></div>
      </div>
      ${UI.sparkline(snap.trend || [])}
      <div class="glass-stat__foot">${UI.badge('published', 'Data disahkan, agregat')}<a data-nav="#/impak">Lihat Impak →</a></div>
    </div>`;
  }

  const P1 = {
    path: '/', id: 'P1', title: 'Utama', nav: 'utama',
    render() {
      const snap = Store.publishedSnapshots()[0] || null;
      return `
      <section class="hero">
        <div class="container hero__grid">
          <div>
            <span class="hero__eyebrow">${UI.icon('star')} Lapisan digital rasmi · Pusat Zakat</span>
            <h1>Mudah Bayar,<br><span class="hero__accent">Jelas Manfaat.</span></h1>
            <div class="rule-ornament"></div>
            <p class="hero__lede">Kira dengan kaedah rasmi, bayar melalui portal rasmi, dan lihat dengan jelas ke mana setiap ringgit pergi.</p>
            <div class="hero__actions">
              ${UI.btn('Kira zakat saya', { href: 'payer.html#/masuk', cls: 'btn--sand', icon: 'calc' })}
              ${UI.btn('Bayar sekarang', { href: 'portal-bayaran.html', external: true, variant: 'secondary', icon: 'external' })}
            </div>
            <div class="hero__trust">
              <span>${UI.icon('check')} Sistem rasmi Pusat Zakat</span>
              <span>${UI.icon('check')} Tiada butiran kad</span>
              <span>${UI.icon('check')} Kandungan disemak Syariah</span>
            </div>
          </div>
          <div class="hero__visual">
            <div class="mihrab">
              ${heroCard(snap)}
              <div class="hero__chip">${UI.icon('receipt')} Resit rasmi kembali ke peti</div>
            </div>
          </div>
        </div>
        <div class="hero__arcade" aria-hidden="true"></div>
      </section>

      <section class="section--tight"><div class="container">
        <div class="trust-strip">
          ${[
            { icon: 'shield', t: 'Kaedah rasmi', s: 'Pengiraan mengikut Pusat Zakat' },
            { icon: 'external', t: 'Bayar di portal rasmi', s: 'Bukan gerbang bayaran baharu' },
            { icon: 'doc', t: 'Disemak Syariah', s: 'Diluluskan sebelum diterbit' },
            { icon: 'chart', t: 'Agregat, privasi terjaga', s: 'Snapshot yang disahkan sahaja' }
          ].map((x, i) => `<div class="trust-strip__item reveal" style="--i:${i}"><div class="octagon">${UI.icon(x.icon)}</div><div><strong>${esc(x.t)}</strong><span>${esc(x.s)}</span></div></div>`).join('')}
        </div>
      </div></section>

      <section class="section"><div class="container">
        <div class="section-head reveal">
          <div><span class="eyebrow">Perkhidmatan</span><h2 class="section-title">Lima pilar, satu klik masuk</h2><div class="rule-ornament rule-ornament--left"></div><p>Satu kad setiap pilar. Bayaran sentiasa dibuka di Portal Bayaran Rasmi — platform ini bukan gerbang bayaran.</p></div>
        </div>
        <div class="bento">
          ${PILLARS.map((p, i) => `<a class="pillar-card bento__item--${p.size} reveal" style="--i:${i}" ${p.nav ? `data-nav="${p.nav}"` : `href="${p.href}"`}>
            <div class="pillar-card__head"><div class="octagon">${UI.icon(p.icon)}</div><span class="pillar-card__num">${p.n}</span></div>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.desc)}</p>
            <span class="pillar-card__cta">Masuk ${UI.icon('arrow')}</span>
          </a>`).join('')}
        </div>
      </div></section>

      <section class="section--tight"><div class="container">
        <div class="section-head reveal"><div><span class="eyebrow">Tiga langkah</span><h2 class="section-title">Kira, bayar, resit — semuanya rasmi</h2><div class="rule-ornament rule-ornament--left"></div></div></div>
        <div class="steps-row">${STEPS.map((s, i) => `<div class="step-item reveal" style="--i:${i}"><div class="octagon">${UI.icon(s.icon)}</div><div><h4>${esc(s.title)}</h4><p>${esc(s.desc)}</p></div></div>`).join('')}</div>
      </div></section>

      ${snap ? `<section class="impact-band"><div class="container">
        <div class="section-head reveal">
          <div><span class="eyebrow eyebrow--light">Impak</span><h2 class="section-title">Setiap ringgit, jelas manfaatnya.</h2><div class="rule-ornament rule-ornament--left"></div><p>Angka daripada snapshot ${esc(snap.id)} yang diterbitkan ${Fmt.date(snap.publishedAt)}. Bukan pertanyaan langsung; sel di bawah ambang privasi disembunyikan.</p></div>
          ${UI.btn('Lihat papan pemuka', { variant: 'secondary', nav: '#/impak', icon: 'chart' })}
        </div>
        <div class="kpi-grid">
          ${[
            { l: 'Kutipan bulan ini', v: Fmt.rm(snap.kpi.collection), p: Fmt.monthLong(snap.period) },
            { l: 'Agihan bulan ini', v: Fmt.rm(snap.kpi.distribution), p: Fmt.monthLong(snap.period) },
            { l: 'Asnaf dibantu', v: Fmt.num(snap.kpi.asnafSupported), p: 'penerima dalam tempoh' },
            { l: 'Pembayar berulang', v: Fmt.pct(snap.kpi.repeatPayers), p: 'bayar lebih sekali setahun' }
          ].map((k, i) => `<div class="kpi--dark reveal" style="--i:${i}"><div class="kpi__label">${esc(k.l)}</div><div class="kpi__value">${esc(k.v)}</div><div class="kpi__period">${esc(k.p)}</div></div>`).join('')}
        </div>
      </div></section>` : ''}

      ${storiesRow()}

      <section class="section--tight" style="padding-top:0"><div class="container">
        <div class="assistant-band reveal">
          <div class="assistant-band__text">
            <div class="octagon">${UI.icon('chat')}</div>
            <div><h3>Tanya Pembantu Zakat</h3><p>Jawapan daripada kandungan yang diluluskan sahaja. Soalan hukum dihantar kepada pegawai.${UI.fixedText(SEED.assistantFixedText)}</p></div>
          </div>
          ${UI.btn('Mula bertanya', { href: 'payer.html#/tanya', icon: 'arrow' })}
        </div>
      </div></section>`;
    },
    mount(params, query, root) { reveal(root); }
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
        <div class="section-head"><div><span class="eyebrow">Impak</span><h1 class="section-title">Impak Zakat</h1><div class="rule-ornament rule-ornament--left"></div><p>Pelaporan awam yang disahkan dan diagregat.</p></div>${selectors}</div>
        ${body}
      </div></section>
      ${storiesRow('Kisah impak')}`;
    },
    mount(params, query, root) { reveal(root); },
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
      return `<section class="section"><div class="container" style="max-width:760px">
        <a class="btn btn--ghost btn--sm" data-nav="#/impak">${UI.icon('back')} Kembali</a>
        <div class="illustration--arch mt-3" style="margin-left:0;margin-right:0;aspect-ratio:16/7;font-size:3.5rem">${esc(st.illustration || '')}</div>
        <div class="story-card__meta mt-3">${esc(st.district)} · ${esc(UI.label(st.program))} · ${esc(st.year)}</div>
        <h1 class="section-title">${esc(st.title)}</h1>
        <div class="rule-ornament rule-ornament--left"></div>
        ${st.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}
        <div class="mt-3">${UI.badge('approved', 'Disemak & diluluskan')} <span class="small muted">${k.approvedAt ? Fmt.date(k.approvedAt) : ''} · tiada nama, tiada wajah, tiada butiran pengenalan</span></div>
      </div></section>`;
    }
  };

  Router.register([P1, P2, P3]);
  Router.start({ defaultHash: '#/' });
})();
