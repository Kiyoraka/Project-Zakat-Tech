/* ZakatTech 360 prototype — UI helpers returning HTML strings (plain browser script, defines global UI)
 * Class names follow css/components.css. Interactive elements use data-action / data-nav. */
const UI = (() => {
  const esc = Fmt.esc;

  /* ---------- status vocabulary (BM labels, badge classes) ---------- */
  const LABELS = {
    ok: 'ok', gagal: 'Gagal', menunggu: 'Menunggu',
    new: 'Baru', in_progress: 'Dalam tindakan', referred: 'Dirujuk', closed: 'Selesai',
    pending_hr: 'Menunggu HR', active: 'Aktif', stopping: 'Berhenti (gaji seterusnya)', stopped: 'Dihentikan',
    draft: 'Draf', shariah_review: 'Semakan Syariah', approved: 'Diluluskan', published: 'Diterbit', retired: 'Ditarik',
    generated: 'Dijana', pending_approval: 'Menunggu kelulusan', superseded: 'Diganti',
    answered: 'Dijawab', pending: 'Menunggu', suspended: 'Digantung',
    matched: 'Dipadan', confirmed: 'Disahkan', sent: 'Dihantar', acknowledged: 'Disahkan Pusat Zakat',
    handed_off: 'Menunggu pengesahan', returned: 'Resit diterima', revoked: 'Ditarik balik', granted: 'Diberi',
    free: 'Kosong', booked: 'Ditempah', blocked: 'Disekat',
    low_confidence: 'keyakinan rendah', sensitive: 'sensitif', ruling_request: 'permintaan hukum', user_requested: 'pengguna minta pegawai',
    portal: 'Portal Bayaran', deduction: 'Potongan gaji',
    pendapatan: 'Pendapatan', simpanan: 'Simpanan', emas: 'Emas / Perak', kwsp: 'KWSP', saham: 'Saham / ASB', perniagaan: 'Perniagaan',
    runcit: 'Runcit', fnb: 'F&B', online: 'Penjual online', professional: 'Perkhidmatan profesional',
    pelajar: 'Pelajar', perubatan: 'Perubatan', usahawan: 'Usahawan', lain: 'Lain-lain',
    telefon: 'Telefon', pejabat: 'Pejabat', video: 'Video',
    whatsapp: 'WhatsApp', sms: 'SMS', email: 'E-mel', monthly: 'Bulanan', yearly: 'Tahunan',
    public: 'Awam', payer: 'Pembayar', sme_owner: 'Pemilik PKS', employer_hr: 'HR Majikan', officer: 'Pegawai', shariah_reviewer: 'Penyemak Syariah', admin: 'Admin',
    faq: 'FAQ', template: 'Templat', story: 'Kisah', hr_kit: 'Kit HR', explanation: 'Penjelasan',
    stub: 'Stub', real: 'Sebenar'
  };
  const BADGE = {
    ok: 'ok', active: 'ok', approved: 'ok', confirmed: 'ok', acknowledged: 'ok', answered: 'ok', closed: 'ok', returned: 'ok', granted: 'ok', matched: 'ok', free: 'ok',
    published: 'diterbit',
    menunggu: 'menunggu', pending: 'menunggu', pending_hr: 'menunggu', pending_approval: 'menunggu', shariah_review: 'menunggu', new: 'menunggu', in_progress: 'info', generated: 'menunggu', handed_off: 'menunggu', sent: 'menunggu', stopping: 'menunggu', booked: 'info',
    gagal: 'gagal', suspended: 'gagal', revoked: 'gagal', stopped: 'gagal', blocked: 'gagal',
    draft: 'draf', retired: 'draf', superseded: 'draf',
    referred: 'info'
  };
  function label(key) { return LABELS[key] !== undefined ? LABELS[key] : (key || '—'); }
  function badge(status, text) {
    const cls = BADGE[status] || 'neutral';
    return `<span class="badge badge--${cls}">${esc(text !== undefined ? text : label(status))}</span>`;
  }

  /* ---------- icons (inline SVG, stroke based) ---------- */
  const ICONS = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h3M13 12h3M8 16h3M13 16h3"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    chat: '<path d="M4 5h16v11H8l-4 4z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    store: '<path d="M4 9l1-5h14l1 5M4 9h16v11H4zM4 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 4 0"/>',
    chart: '<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    inbox: '<path d="M4 13l2-8h12l2 8v6H4zM4 13h5l1 2h4l1-2h5"/>',
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M15 20a5 5 0 0 1 7-4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
    audit: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    star: '<path d="M12 2l2.4 6.6L21 9l-5 4.4L17.5 21 12 17.5 6.5 21 8 13.4 3 9l6.6-.4z"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
    heart: '<path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7v.5"/>',
    warn: '<path d="M12 3l10 18H2zM12 10v5M12 18v.5"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M19 14v6H4V5h6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
    share: '<circle cx="6" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 11l8-4M8 13l8 4"/>',
    mosque: '<path d="M4 21V12h16v9M12 3c0 3-4 4-4 7h8c0-3-4-4-4-7zM2 21h20M7 12V9M17 12V9"/>'
  };
  function icon(name, cls) {
    const d = ICONS[name] || ICONS.info;
    return `<svg class="icon ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  }

  /* ---------- small building blocks ---------- */
  function btn(text, opts) {
    const o = opts || {};
    const cls = ['btn', o.variant ? `btn--${o.variant}` : 'btn--primary', o.block ? 'btn--block' : '', o.sm ? 'btn--sm' : '', o.cls || ''].join(' ');
    const data = Object.entries(o.data || {}).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
    const dis = o.disabled ? 'disabled' : '';
    const ic = o.icon ? icon(o.icon) + ' ' : '';
    if (o.href) return `<a class="${cls}" href="${esc(o.href)}" ${o.external ? 'target="_blank" rel="noopener"' : ''} ${data} ${o.title ? `title="${esc(o.title)}"` : ''}>${ic}${esc(text)}</a>`;
    if (o.nav) return `<button type="button" class="${cls}" data-nav="${esc(o.nav)}" ${data} ${dis}>${ic}${esc(text)}</button>`;
    return `<button type="${o.type || 'button'}" class="${cls}" ${o.action ? `data-action="${esc(o.action)}"` : ''} ${data} ${dis} ${o.title ? `title="${esc(o.title)}"` : ''}>${ic}${esc(text)}</button>`;
  }
  function card(body, opts) {
    const o = opts || {};
    return `<div class="card ${o.cls || ''}" ${o.attrs || ''}>${o.title ? `<h3 class="card__title">${esc(o.title)}</h3>` : ''}<div class="card__body">${body}</div>${o.footer ? `<div class="card__footer">${o.footer}</div>` : ''}</div>`;
  }
  function kpi(o) {
    return `<div class="kpi ${o.warn ? 'kpi--warn' : ''}">
      <div class="kpi__label">${esc(o.label)}</div>
      <div class="kpi__value">${esc(o.value)}</div>
      ${o.period ? `<div class="kpi__period">${esc(o.period)}</div>` : ''}
      ${o.trend ? `<div class="kpi__trend ${o.trendDir || ''}">${esc(o.trend)}</div>` : ''}
    </div>`;
  }
  function counter(o) {
    return `<a class="counter ${o.warn ? 'counter--warn' : ''}" href="${esc(o.href || '#')}"><div class="counter__value">${esc(o.value)}</div><div class="counter__label">${esc(o.label)}</div></a>`;
  }
  function table(o) {
    const cols = o.columns;
    const rows = o.rows || [];
    if (!rows.length) return emptyState({ icon: o.emptyIcon || 'inbox', text: o.empty || 'Tiada rekod', action: o.emptyAction });
    const head = cols.map(c => `<th class="${c.num ? 'num' : ''}">${esc(c.label)}</th>`).join('');
    const body = rows.map(r => {
      const nav = o.rowHref ? `class="row-link" data-nav="${esc(o.rowHref(r))}"` : '';
      return `<tr ${nav}>${cols.map(c => `<td class="${c.num ? 'num' : ''}">${c.render ? c.render(r) : esc(r[c.key])}</td>`).join('')}</tr>`;
    }).join('');
    const pager = o.pager === false ? '' : `<div class="pager"><span>${rows.length} rekod</span><span>muka surat 1/${Math.max(1, Math.ceil(rows.length / 50))}</span></div>`;
    return `<div class="table-wrap ${o.cls || ''}"><table class="table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>${pager}</div>`;
  }
  function stepper(n, total, title) {
    const pctv = Math.round((n / total) * 100);
    return `<div class="stepper"><div class="row row--between"><span class="stepper__label">langkah ${n}/${total}</span>${title ? `<span class="small muted">${esc(title)}</span>` : ''}</div><div class="stepper__bar"><div class="stepper__fill" style="width:${pctv}%"></div></div></div>`;
  }
  function steps(items, activeIndex) {
    return `<div class="steps">${items.map((s, i) => `<div class="step ${i === activeIndex ? 'active' : i < activeIndex ? 'done' : ''}">${i + 1} ${esc(s)}</div>`).join('')}</div>`;
  }
  function progress(value, max, goldCap) {
    const p = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return `<div class="progress"><div class="progress__fill ${goldCap ? 'progress__fill--gold-cap' : ''}" style="width:${p}%"></div></div>`;
  }
  function sourceChip(knowledgeId, href) {
    return `<a class="chip-source" href="${esc(href || `#/sumber/${knowledgeId}`)}" data-nav="${esc(href || `#/sumber/${knowledgeId}`)}">${icon('doc')} sumber: ${esc(Fmt.knowledgeRef(knowledgeId))}</a>`;
  }
  function consentBlock(consent, opts) {
    const o = opts || {};
    if (!consent) return `<div class="consent consent--revoked"><div class="consent__text">Tiada kebenaran aktif. Tiada peringatan akan dihantar.</div></div>`;
    return `<div class="consent">
      <div class="consent__text">${esc(consent.text || 'Saya bersetuju menerima peringatan zakat.')}</div>
      <div class="consent__meta">Kebenaran diberi ${Fmt.date(consent.grantedAt)} · ${esc(label(consent.frequency))} · ${consent.channels.map(label).join(', ')}
        ${o.revokeAction ? ` · <a class="consent__revoke" data-action="${esc(o.revokeAction)}">Tarik balik kebenaran</a>` : ''}</div>
    </div>`;
  }
  function auditLine(ev) {
    return `<div class="audit-line"><span class="audit-line__time">${esc(Fmt.time(ev.at))}</span><span class="audit-line__actor">${esc(ev.actor)}</span><span class="audit-line__entity">${esc(ev.entity)} ${esc(ev.entityId)}</span><span class="audit-line__action">${esc(ev.action)}</span>${ev.detail ? `<span class="muted">${esc(ev.detail)}</span>` : ''}<span class="audit-line__hash">${esc(ev.hash)}</span></div>`;
  }
  function auditStrip(events, title) {
    return `<div class="audit-strip"><div class="audit-strip__title">${esc(title || 'Jejak audit (tidak boleh dipadam)')}</div>${(events || []).slice(0, 8).map(auditLine).join('') || '<div class="small muted">Tiada acara lagi</div>'}</div>`;
  }
  function emptyState(o) {
    return `<div class="empty"><div class="empty__icon">${icon(o.icon || 'inbox')}</div><div class="empty__text">${esc(o.text)}</div>${o.action ? btn(o.action.label, { nav: o.action.nav, href: o.action.href, variant: o.action.variant || 'primary', action: o.action.action }) : ''}</div>`;
  }
  function note(text, type) { return `<div class="note ${type ? `note--${type}` : ''}">${text}</div>`; }
  function kv(rows, opts) {
    const o = opts || {};
    return `<dl class="kv ${o.tappable ? 'kv--tappable' : ''}">${rows.map(r => `<dt ${r.knowledgeId ? `data-nav="#/sumber/${esc(r.knowledgeId)}"` : ''}>${esc(r.label)}</dt><dd class="${r.total ? 'total' : ''}">${r.html !== undefined ? r.html : esc(r.value)}</dd>`).join('')}</dl>`;
  }
  function listItem(o) {
    const nav = o.nav ? `data-nav="${esc(o.nav)}"` : '';
    const action = o.action ? `data-action="${esc(o.action)}" ${Object.entries(o.data || {}).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')}` : '';
    return `<div class="list-item ${o.nav || o.action ? 'list-item--link' : ''} ${o.card ? 'list-item--card' : ''}" ${nav} ${action}>
      ${o.icon ? `<div class="list-item__icon">${icon(o.icon)}</div>` : ''}
      <div class="list-item__main"><div class="list-item__title">${o.titleHtml || esc(o.title)}</div>${o.sub ? `<div class="list-item__sub">${o.subHtml || esc(o.sub)}</div>` : ''}</div>
      ${o.right !== undefined ? `<div class="list-item__right">${o.rightHtml || esc(o.right)}</div>` : ''}
    </div>`;
  }
  function pageHead(title, actions, sub) {
    return `<div class="page-head"><div><h1>${esc(title)}</h1>${sub ? `<div class="muted small">${sub}</div>` : ''}</div>${actions ? `<div class="page-head__actions">${actions}</div>` : ''}</div>`;
  }
  function sectionTitle(text, left) {
    return `<h2 class="section-title">${esc(text)}</h2><div class="rule-ornament ${left ? 'rule-ornament--left' : ''}"></div>`;
  }
  function tabs(items, activeKey) {
    return `<div class="tabs">${items.map(t => `<a class="tab ${t.key === activeKey ? 'active' : ''}" data-nav="${esc(t.href)}">${esc(t.label)}${t.count !== undefined ? ` <span class="badge badge--${t.badge || 'neutral'}">${esc(t.count)}</span>` : ''}</a>`).join('')}</div>`;
  }
  function field(labelText, inputHtml, help, err) {
    return `<div class="field ${err ? 'field--error' : ''}"><label>${esc(labelText)}</label>${inputHtml}${help ? `<div class="help">${help}</div>` : ''}${err ? `<div class="error-text">${esc(err)}</div>` : ''}</div>`;
  }
  function input(name, opts) {
    const o = opts || {};
    const attrs = `name="${esc(name)}" class="input" ${o.type ? `type="${o.type}"` : 'type="text"'} ${o.value !== undefined ? `value="${esc(o.value)}"` : ''} ${o.placeholder ? `placeholder="${esc(o.placeholder)}"` : ''} ${o.required ? 'required' : ''} ${o.readonly ? 'readonly' : ''} ${o.min !== undefined ? `min="${o.min}"` : ''} ${o.step ? `step="${o.step}"` : ''} ${o.change ? `data-change="${esc(o.change)}"` : ''} ${o.attrs || ''}`;
    if (o.rm) return `<div class="input-rm"><span class="input-rm__prefix">RM</span><input ${attrs} inputmode="decimal"></div>`;
    return `<input ${attrs}>`;
  }
  function select(name, options, value, opts) {
    const o = opts || {};
    return `<select name="${esc(name)}" class="input" ${o.change ? `data-change="${esc(o.change)}"` : ''} ${o.attrs || ''}>${o.placeholder ? `<option value="">${esc(o.placeholder)}</option>` : ''}${options.map(op => {
      const v = typeof op === 'string' ? op : op.value;
      const l = typeof op === 'string' ? label(op) : op.label;
      const dis = typeof op === 'object' && op.disabled ? 'disabled' : '';
      return `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''} ${dis}>${esc(l)}</option>`;
    }).join('')}</select>`;
  }
  function radios(name, options, value) {
    return `<div class="radio-group">${options.map(op => {
      const v = typeof op === 'string' ? op : op.value;
      const l = typeof op === 'string' ? label(op) : op.label;
      const dis = typeof op === 'object' && op.disabled ? 'disabled' : '';
      return `<label class="radio"><input type="radio" name="${esc(name)}" value="${esc(v)}" ${String(v) === String(value) ? 'checked' : ''} ${dis}> ${esc(l)}${typeof op === 'object' && op.hint ? ` <span class="muted small">${esc(op.hint)}</span>` : ''}</label>`;
    }).join('')}</div>`;
  }
  function check(name, value, text, checked, opts) {
    const o = opts || {};
    return `<label class="check"><input type="checkbox" name="${esc(name)}" value="${esc(value)}" ${checked ? 'checked' : ''} ${o.change ? `data-change="${esc(o.change)}"` : ''} ${o.attrs || ''}> <span>${text}</span></label>`;
  }

  /* ---------- charts (CSS bars, inline SVG sparkline) ---------- */
  function bars(rows) {
    const max = Math.max(1, ...rows.filter(r => !r.hidden).map(r => r.value || 0));
    return `<div class="bars">${rows.map(r => `<div class="bar-row ${r.hidden ? 'bar-row--hidden' : ''}" ${r.hidden ? 'title="bawah ambang"' : ''}>
      <span>${esc(r.label)}</span>
      <div class="bar"><div class="bar__fill" style="width:${r.hidden ? 0 : Math.round((r.value / max) * 100)}%"></div></div>
      <span class="bar__value">${r.hidden ? '—' : esc(r.display !== undefined ? r.display : Fmt.rm(r.value))}</span>
    </div>`).join('')}</div>`;
  }
  function sparkline(values, labels) {
    const w = 600, h = 120, pad = 8;
    const vals = values || [];
    if (!vals.length) return '<div class="muted small">Tiada data</div>';
    const min = Math.min(...vals), max = Math.max(...vals);
    const span = max - min || 1;
    const pts = vals.map((v, i) => {
      const x = pad + (i * (w - 2 * pad)) / Math.max(1, vals.length - 1);
      const y = h - pad - ((v - min) / span) * (h - 2 * pad);
      return [x.toFixed(1), y.toFixed(1)];
    });
    const line = pts.map(p => p.join(',')).join(' ');
    const area = `${pts[0][0]},${h} ${line} ${pts[pts.length - 1][0]},${h}`;
    return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="trend"><polygon class="sparkline__area" points="${area}"/><polyline points="${line}"/></svg>
      ${labels ? `<div class="sparkline-labels">${labels.map(l => `<span>${esc(l)}</span>`).join('')}</div>` : ''}`;
  }

  /* ---------- toast / sheet / drawer / confirm ---------- */
  function host(id, cls) {
    let el = document.getElementById(id);
    if (!el) { el = document.createElement('div'); el.id = id; if (cls) el.className = cls; document.body.appendChild(el); }
    return el;
  }
  function toast(msg, type) {
    const h = host('toast-host');
    const t = document.createElement('div');
    t.className = 'toast' + (type ? ` toast--${type}` : '');
    t.textContent = msg;
    h.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2800);
  }
  function openPanel(kind, o) {
    const backdrop = host('backdrop', 'backdrop');
    const el = host(kind, kind);
    el.innerHTML = `<div class="${kind}__header"><h3>${esc(o.title || '')}</h3><button type="button" class="btn btn--ghost btn--sm" data-close-panel="${kind}" aria-label="Tutup">${icon('close')}</button></div>
      <div class="${kind}__body">${o.body || ''}</div>
      ${o.footer ? `<div class="${kind}__footer">${o.footer}</div>` : ''}`;
    el.className = kind + (o.cls ? ' ' + o.cls : '');
    requestAnimationFrame(() => { el.classList.add('open'); backdrop.classList.add('open'); });
    if (o.mount) o.mount(el);
  }
  function closePanels() {
    ['sheet', 'drawer'].forEach(k => { const el = document.getElementById(k); if (el) el.classList.remove('open'); });
    const b = document.getElementById('backdrop'); if (b) b.classList.remove('open');
  }
  function openSheet(o) { openPanel('sheet', o); }
  function openDrawer(o) { openPanel('drawer', o); }
  // confirm uses the surface's own panel (sheet on mobile shells, drawer elsewhere) — never window.confirm
  function confirm(text, onYes, opts) {
    const o = opts || {};
    const mobile = document.body.classList.contains('shell-mobile');
    const open = mobile ? openSheet : openDrawer;
    open({
      title: o.title || 'Sahkan',
      body: `<p>${esc(text)}</p>`,
      footer: `${btn(o.no || 'Batal', { variant: 'secondary', action: '__cancel' })}${btn(o.yes || 'Ya, teruskan', { variant: o.danger ? 'danger' : 'primary', action: '__confirm' })}`,
      mount(el) {
        el.querySelector('[data-action="__confirm"]').addEventListener('click', () => { closePanels(); onYes(); });
        el.querySelector('[data-action="__cancel"]').addEventListener('click', closePanels);
      }
    });
  }
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-close-panel]');
    if (c) { closePanels(); return; }
    if (e.target.id === 'backdrop') closePanels();
  });

  /* ---------- misc ---------- */
  function illustration(glyph, small) { return `<div class="illustration ${small ? 'illustration--sm' : ''}" aria-hidden="true">${esc(glyph || '')}</div>`; }
  function fixedText(text) { return `<div class="fixed-text">${esc(text)}</div>`; }
  function formData(form) {
    const fd = new FormData(form); const out = {};
    fd.forEach((v, k) => { if (out[k] !== undefined) { out[k] = [].concat(out[k], v); } else out[k] = v; });
    form.querySelectorAll('input[type=checkbox]').forEach(cb => { if (!(cb.name in out)) out[cb.name] = cb.checked ? cb.value : ''; });
    return out;
  }

  return {
    esc, label, badge, icon, btn, card, kpi, counter, table, stepper, steps, progress, sourceChip, consentBlock, auditLine, auditStrip,
    emptyState, note, kv, listItem, pageHead, sectionTitle, tabs, field, input, select, radios, check, bars, sparkline,
    toast, openSheet, openDrawer, closePanels, confirm, illustration, fixedText, formData, LABELS
  };
})();
