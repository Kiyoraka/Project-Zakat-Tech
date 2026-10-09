/* ZakatTech 360 prototype — demo state store (plain browser script, defines global Store)
 * - First run: deep copy of SEED. Afterwards: localStorage key zt360.demo.v1.
 * - Every mutation goes through a method here that appends an audit event and saves.
 * - Nothing is ever deleted from state.audit (append-only, rule #5). */
const Store = (() => {
  const KEY = 'zt360.demo.v1';
  const VERSION = 1;
  let state = null;

  /* ---------- lifecycle ---------- */
  function fresh() {
    const s = JSON.parse(JSON.stringify(SEED));
    s.__v = VERSION;
    s.session = { role: 'public', accountKey: 'awam', payerId: null, employerId: null, officerId: null, smeMode: false };
    s.paymentRefs = s.paymentRefs || [];
    s.conversations = s.conversations || {};      // payerId -> [{role, text, knowledgeId?, ticketId?}]
    s.employerChecklist = s.employerChecklist || {}; // employerId -> {key: true}
    s.corrections = s.corrections || [];           // case corrections (old vs new)
    s.otpAttempts = 0;
    return s;
  }
  function load() {
    if (state) return state;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.__v === VERSION) { state = parsed; return state; }
      }
    } catch (e) { /* private window or blocked storage: fall through to fresh */ }
    state = fresh();
    save();
    return state;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    state = fresh();
    save();
    return state;
  }
  function S() { return load(); }

  /* ---------- audit ---------- */
  function actorInfo() {
    const s = S().session;
    if (s.officerId) { const o = officer(s.officerId); return { actorId: o.id, actor: o.name }; }
    if (s.payerId) { const p = payer(s.payerId); return { actorId: p.id, actor: p.name }; }
    if (s.employerId) { const e = employer(s.employerId); return { actorId: e.id, actor: (e.hrName || 'HR') + ' (' + e.name + ')' }; }
    return { actorId: 'PUBLIC', actor: 'Awam' };
  }
  function audit(ev) {
    const st = S();
    const who = actorInfo();
    const row = {
      id: Fmt.nextId('AUD', st.audit),
      at: Fmt.nowIso(),
      actorId: ev.actorId || who.actorId,
      actor: ev.actor || who.actor,
      entity: ev.entity,
      entityId: ev.entityId,
      action: ev.action,
      detail: ev.detail || '',
      correlationId: ev.correlationId || ('COR-' + Fmt.djb2(ev.entity + ev.entityId + Date.now()).slice(0, 6)),
      hash: ''
    };
    row.hash = Fmt.djb2(JSON.stringify([row.at, row.actorId, row.entity, row.entityId, row.action, row.detail]));
    st.audit.unshift(row);
    save();
    return row;
  }

  /* ---------- session ---------- */
  function session() { return S().session; }
  function setSession(account) {
    const st = S();
    st.session = {
      role: account.role,
      accountKey: account.key,
      payerId: account.payerId || null,
      employerId: account.employerId || null,
      officerId: account.officerId || null,
      smeMode: account.role === 'sme_owner'
    };
    save();
    return st.session;
  }
  function setSmeMode(on) { S().session.smeMode = !!on; save(); }
  function account() { const k = S().session.accountKey; return S().accounts.find(a => a.key === k) || S().accounts[0]; }
  function role() { return S().session.role; }
  function currentPayer() { return S().session.payerId ? payer(S().session.payerId) : null; }
  function currentEmployer() { return S().session.employerId ? employer(S().session.employerId) : null; }
  function currentOfficer() { return S().session.officerId ? officer(S().session.officerId) : null; }
  function loginAsPayer(phone) {
    // Any phone logs in (section 11). Default demo payer is Ahmad unless the picker already chose a payer.
    const st = S();
    if (!st.session.payerId) {
      const acc = st.accounts.find(a => a.role === 'payer');
      setSession(acc);
    }
    st.session.phoneUsed = phone;
    st.otpAttempts = 0;
    save();
    audit({ entity: 'session', entityId: st.session.payerId, action: 'login', detail: 'OTP (stub identity gateway)' });
    return currentPayer();
  }
  function otpFail() { const st = S(); st.otpAttempts = (st.otpAttempts || 0) + 1; save(); return st.otpAttempts; }
  function logout() { const st = S(); st.session = fresh().session; save(); }

  /* ---------- lookups ---------- */
  function byId(list, id) { return (list || []).find(x => x.id === id) || null; }
  function payer(id) { return byId(S().payers, id); }
  function employer(id) { return byId(S().employers, id); }
  function officer(id) { return byId(S().officers, id); }
  function knowledge(id) { return byId(S().knowledgeItems, id); }
  function isPublished(id) { const k = knowledge(id); return !!k && k.status === 'published'; }
  function publishedKnowledge(kind) { return S().knowledgeItems.filter(k => k.status === 'published' && (!kind || k.kind === kind)); }
  function knowledgeByStatus(status) { return S().knowledgeItems.filter(k => k.status === status); }
  function story(knowledgeId) { return (S().stories || []).find(s => s.knowledgeId === knowledgeId) || null; }
  function publishedStories() { return publishedKnowledge('story').map(k => story(k.id)).filter(Boolean); }
  function publishedSnapshots() { return S().snapshots.filter(s => s.status === 'published').sort((a, b) => b.period.localeCompare(a.period)); }
  function snapshot(id) { return byId(S().snapshots, id); }
  function snapshotForPeriod(period) { return publishedSnapshots().find(s => s.period === period) || null; }
  function calculatorTemplates() { return S().calculatorTemplates.filter(t => t.status === 'published'); }
  function calculatorTemplate(type) { return S().calculatorTemplates.find(t => t.type === type || t.id === type) || null; }
  function smeTemplates() { return S().smeTemplates.filter(t => t.status === 'published' || isPublished(t.id)); }
  function smeTemplate(industry) { return S().smeTemplates.find(t => t.industry === industry || t.id === industry) || null; }
  function payerPayments(payerId, year) {
    return S().payments.filter(p => p.payerId === payerId && (!year || p.date.startsWith(String(year))))
      .sort((a, b) => b.date.localeCompare(a.date));
  }
  function payerPaid(payerId, year) { return payerPayments(payerId, year).reduce((a, p) => a + p.amount, 0); }
  function payerConsent(payerId) { return S().consents.find(c => c.payerId === payerId && c.status === 'active') || null; }
  function payerConsents(payerId) { return S().consents.filter(c => c.payerId === payerId); }
  function lastCalculation(payerId) {
    return S().calculations.filter(c => c.payerId === payerId).sort((a, b) => b.savedAt.localeCompare(a.savedAt))[0] || null;
  }
  function calculation(id) { return byId(S().calculations, id); }
  function paymentRef(ref) { return S().paymentRefs.find(r => r.ref === ref) || null; }
  function enrolmentFor(payerId) {
    return S().enrolments.filter(e => e.payerId === payerId && e.status !== 'stopped').sort((a, b) => (b.requestedAt || '').localeCompare(a.requestedAt || ''))[0] || null;
  }
  function enrolment(id) { return byId(S().enrolments, id); }
  function employerEnrolments(employerId) { return S().enrolments.filter(e => e.employerId === employerId); }
  function employerRuns(employerId) { return S().deductionRuns.filter(r => r.employerId === employerId).sort((a, b) => b.month.localeCompare(a.month)); }
  function run(id) { return byId(S().deductionRuns, id); }
  function approvedEmployers() { return S().employers.filter(e => e.status === 'active'); }
  function smeCase(id) { return byId(S().smeCases, id); }
  function payerCases(payerId) { return S().smeCases.filter(c => c.payerId === payerId).sort((a, b) => b.submitted.localeCompare(a.submitted)); }
  function allCases() { return S().smeCases.slice().sort((a, b) => b.submitted.localeCompare(a.submitted)); }
  function caseAnswers(caseId) { return (S().smeAnswers || {})[caseId] || null; }
  function appointments() { return S().appointments; }
  function appointment(id) { return byId(S().appointments, id); }
  function officerSlots(officerId, date) {
    return S().officerSlots.filter(s => (!officerId || s.officerId === officerId) && (!date || s.date === date));
  }
  function officersFor(district, industry) {
    return S().officers.filter(o => o.role === 'officer' && (!district || !o.district || o.district === district) && (!industry || (o.industries || []).includes(industry)));
  }
  function escalation(id) { return byId(S().escalations, id); }
  function escalations(status) { return S().escalations.filter(e => !status || e.status === status).sort((a, b) => b.at.localeCompare(a.at)); }
  function conversation(payerId) { const c = S().conversations; if (!c[payerId]) c[payerId] = []; return c[payerId]; }
  function auditLog() { return S().audit; }
  function settings() { return S().settings; }
  function checklist(employerId) { const c = S().employerChecklist; if (!c[employerId]) c[employerId] = {}; return c[employerId]; }

  /* ---------- payer: calculation + hand-off (#1 #5) ---------- */
  function saveCalculation(payerId, templateId, version, inputs, amount) {
    const st = S();
    const calc = { id: Fmt.nextId('CALC', st.calculations), payerId, templateId, version, inputs, amount, savedAt: Fmt.nowIso() };
    st.calculations.push(calc);
    audit({ entity: 'calculation', entityId: calc.id, action: 'saved', detail: `${templateId} v${version} = RM ${amount}` });
    return calc;
  }
  function handOff(calcId) {
    const st = S();
    const calc = calculation(calcId);
    if (!calc) return null;
    const t = calculatorTemplate(calc.templateId) || smeTemplate(calc.templateId) || { type: 'perniagaan' };
    const correlationId = 'COR-' + Fmt.djb2(calcId + Fmt.nowIso()).slice(0, 6);
    const ref = {
      ref: Fmt.nextId('PR-2026', st.paymentRefs, 'ref'),
      calcId, payerId: calc.payerId, amount: calc.amount, type: t.type || 'perniagaan',
      status: 'handed_off', correlationId, at: Fmt.nowIso()
    };
    st.paymentRefs.push(ref);
    audit({ entity: 'payment_reference', entityId: ref.ref, action: 'hand_off', correlationId, detail: 'Portal Bayaran Rasmi (stub payment navigation gateway)' });
    return ref;
  }
  function returnReceipt(refNo) {
    const st = S();
    const ref = paymentRef(refNo);
    if (!ref) return null;
    if (ref.status === 'returned') return st.payments.find(p => p.ref === refNo) || null;
    const today = Fmt.todayIso();
    const receiptNo = Fmt.nextId('R-' + today.slice(0, 4), st.payments, 'receipt');
    const payment = { payerId: ref.payerId, date: today, type: ref.type, amount: ref.amount, channel: 'portal', receipt: receiptNo, ref: ref.ref };
    st.payments.push(payment);
    ref.status = 'returned';
    ref.returnedAt = Fmt.nowIso();
    audit({ entity: 'receipt', entityId: receiptNo, action: 'receipt_returned', correlationId: ref.correlationId, detail: `ref ${ref.ref}, RM ${ref.amount} (stub)` });
    return payment;
  }

  /* ---------- payer: consent (#6) ---------- */
  function grantConsent(payerId, channels, frequency, text) {
    const st = S();
    st.consents.filter(c => c.payerId === payerId && c.status === 'active').forEach(c => { c.status = 'revoked'; c.revokedAt = Fmt.nowIso(); });
    const row = { id: Fmt.nextId('CON', st.consents), payerId, channels: channels.slice(), frequency, grantedAt: Fmt.todayIso(), status: 'active', text };
    st.consents.push(row);
    audit({ entity: 'consent', entityId: row.id, action: 'granted', detail: `${frequency}; ${channels.join(', ')}` });
    return row;
  }
  function revokeConsent(payerId) {
    const st = S();
    const active = st.consents.filter(c => c.payerId === payerId && c.status === 'active');
    active.forEach(c => { c.status = 'revoked'; c.revokedAt = Fmt.nowIso(); audit({ entity: 'consent', entityId: c.id, action: 'revoked', detail: 'semua peringatan dihentikan serta-merta' }); });
    return active.length;
  }
  function updatePayerDistrict(payerId, district) {
    const p = payer(payerId); if (!p) return;
    p.district = district;
    audit({ entity: 'payer', entityId: payerId, action: 'district_updated', detail: district });
  }

  /* ---------- Skim Potongan Gaji enrolment (#6) ---------- */
  function requestEnrolment(payerId, employerId, amount) {
    const st = S();
    const p = payer(payerId);
    const row = {
      id: Fmt.nextId('ENR', st.enrolments), payerId, employerId, employeeName: p.name,
      employeeNo: 'E-' + String(1000 + st.enrolments.length).slice(-4), department: '—', amount,
      status: 'pending_hr', consentGivenAt: Fmt.todayIso(), requestedAt: Fmt.nowIso(), confirmedAt: null, octStatus: null
    };
    st.enrolments.push(row);
    p.employerId = employerId; p.deduction = amount;
    audit({ entity: 'enrolment', entityId: row.id, action: 'requested', detail: `RM ${amount}/bulan, persetujuan potongan + perkongsian data` });
    return row;
  }
  function updateEnrolmentAmount(id, amount) {
    const e = enrolment(id); if (!e) return;
    const old = e.amount; e.amount = amount;
    const p = e.payerId ? payer(e.payerId) : null; if (p) p.deduction = amount;
    audit({ entity: 'enrolment', entityId: id, action: 'amount_changed', detail: `RM ${old} -> RM ${amount} (berkuat kuasa gaji seterusnya)` });
  }
  function stopEnrolment(id, by) {
    const e = enrolment(id); if (!e) return;
    e.status = 'stopping'; e.stopRequestedAt = Fmt.nowIso();
    audit({ entity: 'enrolment', entityId: id, action: 'stop_requested', detail: (by || 'pekerja') + ' — berkuat kuasa gaji seterusnya' });
  }
  function confirmEnrolment(id) {
    const e = enrolment(id); if (!e) return;
    e.status = 'active'; e.confirmedAt = Fmt.nowIso();
    audit({ entity: 'enrolment', entityId: id, action: 'confirmed', detail: 'disahkan HR' });
  }
  function inviteEmployee(employerId, name, contact) {
    audit({ entity: 'enrolment', entityId: employerId, action: 'invited', detail: `${name} <${contact}> — pautan Skim Potongan Gaji (tiada mesej dihantar: prototaip)` });
  }

  /* ---------- employer onboarding + settings ---------- */
  function saveEmployerDraft(data) {
    const st = S();
    let e = data.id ? employer(data.id) : null;
    if (!e) {
      e = { id: Fmt.nextId('EMP', st.employers), status: 'draft', departments: [], ssm: '?', payrollSystem: null, payDay: 25, fileMethod: 'csv', minDeduction: 10 };
      st.employers.push(e);
    }
    Object.assign(e, data, { id: e.id });
    save();
    return e;
  }
  function submitEmployer(id) {
    const e = employer(id); if (!e) return null;
    e.status = 'pending'; e.submittedAt = Fmt.nowIso(); e.reference = 'MJK-' + Fmt.djb2(id + e.submittedAt).slice(0, 6).toUpperCase();
    audit({ entity: 'employer', entityId: id, action: 'submitted', detail: `rujukan ${e.reference}; semakan 3 hari bekerja` });
    return e;
  }
  function approveEmployer(id) {
    const e = employer(id); if (!e) return;
    e.status = 'active'; e.approvedAt = Fmt.nowIso(); e.ssm = 'ok';
    audit({ entity: 'employer', entityId: id, action: 'approved_employer', detail: e.name });
  }
  function requestDocs(id, note) {
    const e = employer(id); if (!e) return;
    e.docsRequestedAt = Fmt.nowIso(); e.docsNote = note || 'Sila muat naik surat SSM / agensi terkini';
    audit({ entity: 'employer', entityId: id, action: 'documents_requested', detail: e.docsNote });
  }
  function suspendEmployer(id, reason) {
    const e = employer(id); if (!e) return;
    e.status = 'suspended'; e.suspendedAt = Fmt.nowIso(); e.suspendReason = reason;
    audit({ entity: 'employer', entityId: id, action: 'suspended', detail: reason });
  }
  function saveDeductionSettings(employerId, patch) {
    const e = employer(employerId); if (!e) return;
    Object.assign(e, patch);
    audit({ entity: 'employer', entityId: employerId, action: 'deduction_settings_saved', detail: `${patch.payrollSystem || e.payrollSystem} / tarikh gaji ${patch.payDay || e.payDay} / pengesah ${patch.approverName || e.approverName}` });
  }
  function toggleChecklist(employerId, key) {
    const c = checklist(employerId); c[key] = !c[key];
    audit({ entity: 'employer', entityId: employerId, action: c[key] ? 'checklist_ticked' : 'checklist_unticked', detail: key });
  }

  /* ---------- monthly deduction run (#5 #8) ---------- */
  function createRun(employerId, month, supersedesId) {
    const st = S();
    const e = employer(employerId);
    const rows = employerEnrolments(employerId);
    const matched = rows.filter(r => r.status === 'active' && r.consentGivenAt);
    const mismatched = rows.filter(r => !(r.status === 'active' && r.consentGivenAt)).map(r => ({
      employeeNo: r.employeeNo, employeeName: r.employeeName,
      reason: r.status === 'pending_hr' ? 'tiada persetujuan' : r.status === 'stopping' || r.status === 'stopped' ? 'berhenti potongan' : 'jumlah berubah'
    }));
    if (supersedesId) {
      const old = run(supersedesId);
      if (old) { old.status = 'superseded'; }
    }
    const r = {
      id: `RUN-${month}` + (supersedesId ? '-' + (st.deductionRuns.filter(x => x.month === month && x.employerId === employerId).length + 1) : ''),
      employerId, month, status: 'matched', matched: matched.length, mismatched,
      total: matched.reduce((a, x) => a + x.amount, 0), uploadedBy: e.hrName || 'HR', approvedBy: null,
      uploadedAt: Fmt.nowIso(), sentAt: null, file: `gaji-${month}.csv`, supersedes: supersedesId || null
    };
    st.deductionRuns.push(r);
    audit({ entity: 'deduction_run', entityId: r.id, action: 'matched', detail: `${r.matched} sepadan, ${mismatched.length} tidak sepadan` + (supersedesId ? `; pembetulan kepada ${supersedesId}` : '') });
    return r;
  }
  function confirmRun(runId, approverName) {
    const r = run(runId); if (!r) return { ok: false, error: 'Run tidak dijumpai' };
    const e = employer(r.employerId);
    if (!e.approverName) return { ok: false, error: 'Namakan pengesah di Tetapan Potongan dahulu' };
    if (approverName !== e.approverName) return { ok: false, error: `Hanya pengesah dinamakan (${e.approverName}) boleh mengesahkan` };
    r.status = 'sent'; r.approvedBy = approverName; r.sentAt = Fmt.nowIso();
    audit({ entity: 'deduction_run', entityId: runId, action: 'sent', detail: `RM ${r.total} oleh ${approverName} (stub payroll gateway) — menunggu pengesahan Pusat Zakat` });
    return { ok: true, run: r };
  }

  /* ---------- SME (#3 #5) ---------- */
  function createSmeCase(payerId, business, industry, templateId, version, answers, systemAmount) {
    const st = S();
    const c = { id: Fmt.nextId('KES', st.smeCases), payerId, business, industry, status: 'new', officerId: null, submitted: Fmt.todayIso(), systemAmount, verifiedAmount: null, officerNote: '', messages: [] };
    st.smeCases.push(c);
    st.smeAnswers = st.smeAnswers || {};
    st.smeAnswers[c.id] = { templateId, version, answers, systemAmount };
    audit({ entity: 'sme_case', entityId: c.id, action: 'created', detail: `${business} (${industry}) ${templateId} v${version}` });
    return c;
  }
  function bookAppointment({ caseId, payerId, officerId, date, time, mode, note, business, industry, templateId, version, answers, systemAmount }) {
    const st = S();
    let c = caseId ? smeCase(caseId) : null;
    if (!c) c = createSmeCase(payerId, business || 'Perniagaan saya', industry || 'runcit', templateId || 'TPL-RUNCIT', version || 1, answers || {}, systemAmount || 0);
    const slot = st.officerSlots.find(s => s.officerId === officerId && s.date === date && s.time === time);
    if (slot) slot.status = 'booked';
    const apt = { id: Fmt.nextId('APT', st.appointments), caseId: c.id, payerId, officerId, date, time, mode, note: note || '', business: c.business };
    st.appointments.push(apt);
    if (!c.officerId) { c.officerId = officerId; if (c.status === 'new') c.status = 'in_progress'; }
    audit({ entity: 'appointment', entityId: apt.id, action: 'booked', detail: `${c.id} ${date} ${time} ${mode} dengan ${officer(officerId).name}` });
    return apt;
  }
  function requestCallback(caseId, payerId, officerId) {
    audit({ entity: 'sme_case', entityId: caseId, action: 'callback_requested', detail: 'tiada slot minggu ini — pegawai akan hubungi' });
  }
  function assignCase(caseId, officerId) {
    const c = smeCase(caseId); if (!c) return;
    c.officerId = officerId; if (c.status === 'new') c.status = 'in_progress';
    audit({ entity: 'sme_case', entityId: caseId, action: 'assigned', detail: officer(officerId).name });
  }
  function verifyCase(caseId, amount) {
    const c = smeCase(caseId); if (!c) return;
    c.verifiedAmount = amount; c.status = 'closed'; c.verifiedAt = Fmt.nowIso();
    audit({ entity: 'sme_case', entityId: caseId, action: 'verified', detail: `RM ${amount} dilepaskan kepada pemilik` });
  }
  function correctCase(caseId, newAmount, reason) {
    const st = S();
    const c = smeCase(caseId); if (!c) return;
    const old = c.verifiedAmount !== null ? c.verifiedAmount : c.systemAmount;
    st.corrections.push({ caseId, oldAmount: old, newAmount, reason, at: Fmt.nowIso(), by: actorInfo().actor });
    c.verifiedAmount = newAmount; c.status = 'closed'; c.verifiedAt = Fmt.nowIso();
    audit({ entity: 'sme_case', entityId: caseId, action: 'corrected', detail: `RM ${old} -> RM ${newAmount}: ${reason}` });
  }
  function referCase(caseId, note) {
    const c = smeCase(caseId); if (!c) return;
    c.status = 'referred'; c.referredAt = Fmt.nowIso(); c.referralNote = note || '';
    audit({ entity: 'sme_case', entityId: caseId, action: 'referred', detail: 'dirujuk ke jawatankuasa' + (note ? ': ' + note : '') });
  }
  function addCaseMessage(caseId, from, text) {
    const c = smeCase(caseId); if (!c) return;
    c.messages = c.messages || [];
    c.messages.push({ from, at: Fmt.nowIso(), text });
    audit({ entity: 'sme_case', entityId: caseId, action: 'message', detail: from + ': ' + text.slice(0, 60) });
  }
  function blockSlot(officerId, date, time) {
    const st = S();
    let slot = st.officerSlots.find(s => s.officerId === officerId && s.date === date && s.time === time);
    if (!slot) { slot = { officerId, date, time, status: 'free' }; st.officerSlots.push(slot); }
    slot.status = slot.status === 'blocked' ? 'free' : 'blocked';
    audit({ entity: 'appointment', entityId: `${officerId}/${date}/${time}`, action: slot.status === 'blocked' ? 'slot_blocked' : 'slot_unblocked' });
    return slot;
  }
  function linkAppointmentCase(aptId, caseId) {
    const a = appointment(aptId); const c = smeCase(caseId);
    if (!a || !c) return;
    a.caseId = caseId;
    if (!c.officerId) { c.officerId = a.officerId; if (c.status === 'new') c.status = 'in_progress'; }
    audit({ entity: 'appointment', entityId: aptId, action: 'case_linked', detail: caseId });
  }
  function rescheduleAppointment(id, date, time) {
    const st = S();
    const a = appointment(id); if (!a) return;
    const oldSlot = st.officerSlots.find(s => s.officerId === a.officerId && s.date === a.date && s.time === a.time);
    if (oldSlot) oldSlot.status = 'free';
    const was = `${a.date} ${a.time}`;
    a.date = date; a.time = time;
    const slot = st.officerSlots.find(s => s.officerId === a.officerId && s.date === date && s.time === time);
    if (slot) slot.status = 'booked';
    const consent = a.payerId ? payerConsent(a.payerId) : null;
    audit({ entity: 'appointment', entityId: id, action: 'rescheduled', detail: `${was} -> ${date} ${time}; pemilik dimaklumkan melalui ${consent ? consent.channels.join('/') : 'tiada saluran (tiada kebenaran)'}` });
  }

  /* ---------- assistant (#2 #3) ---------- */
  function assistantAsk(payerId, text) {
    const st = S();
    const q = String(text || '').trim();
    const lower = q.toLowerCase();
    const conv = conversation(payerId);
    conv.push({ role: 'user', text: q, at: Fmt.nowIso() });
    const sensitive = (st.sensitiveKeywords || []).find(k => lower.includes(k));
    let reason = null;
    if (sensitive) reason = (['hukum', 'fatwa', 'haram', 'halal', 'wajib ke'].includes(sensitive)) ? 'ruling_request' : 'sensitive';
    let hit = null;
    if (!reason) {
      hit = (st.faqAnswers || []).find(f => f.intents.some(i => lower.includes(i)));
      if (!hit) reason = 'low_confidence';
      else if (!isPublished(hit.knowledgeId)) reason = 'low_confidence'; // cannot cite an unpublished source
    }
    if (reason) {
      const t = createEscalation(payerId, q, reason, 'portal', conv.slice(-4));
      const msg = { role: 'assistant', text: `Soalan ini dihantar ke pegawai (${t.id}). Pegawai akan membalas melalui saluran anda.`, ticketId: t.id, at: Fmt.nowIso() };
      conv.push(msg); save();
      return { kind: 'escalated', ticketId: t.id, reason, message: msg };
    }
    const msg = { role: 'assistant', text: hit.answer, knowledgeId: hit.knowledgeId, at: Fmt.nowIso() };
    conv.push(msg); save();
    audit({ entity: 'conversation', entityId: payerId, action: 'answered', detail: `sumber ${hit.knowledgeId}` });
    return { kind: 'answer', message: msg };
  }
  function createEscalation(payerId, question, reason, channel, convo) {
    const st = S();
    const p = payerId ? payer(payerId) : null;
    const t = { id: Fmt.nextId('ESK', st.escalations), question, reason, channel: channel || 'portal', payerId: payerId || null, status: 'new', at: Fmt.nowIso(), conversation: (convo || []).map(m => ({ role: m.role, text: m.text })), answer: null, answeredBy: null, answeredAt: null };
    st.escalations.push(t);
    audit({ entity: 'escalation', entityId: t.id, action: 'created', detail: `${st.escalationReasons ? st.escalationReasons[reason] : reason}${p ? ' — ' + p.name : ''}` });
    return t;
  }
  function requestOfficer(payerId) {
    const conv = conversation(payerId);
    const t = createEscalation(payerId, 'nak cakap dengan pegawai', 'user_requested', 'portal', conv.slice(-4));
    conv.push({ role: 'assistant', text: `Dihantar ke pegawai, ${t.id}. Anda boleh terus menulis di sini.`, ticketId: t.id, at: Fmt.nowIso() });
    save();
    return t;
  }
  function answerEscalation(id, text) {
    const t = escalation(id); if (!t) return;
    t.status = 'answered'; t.answer = text; t.answeredBy = actorInfo().actorId; t.answeredAt = Fmt.nowIso();
    if (t.payerId) conversation(t.payerId).push({ role: 'officer', text, ticketId: id, at: Fmt.nowIso() });
    audit({ entity: 'escalation', entityId: id, action: 'answered', detail: `melalui ${t.channel}` });
  }
  function closeEscalation(id) {
    const t = escalation(id); if (!t) return;
    t.status = 'closed'; t.closedAt = Fmt.nowIso();
    audit({ entity: 'escalation', entityId: id, action: 'closed' });
  }

  /* ---------- knowledge + Shariah review (#7) ---------- */
  function createDraft(kind, title, body, extra) {
    const st = S();
    const prefix = { faq: 'FAQ', template: 'TPL', story: 'STO', hr_kit: 'KIT', explanation: 'FAQ' }[kind] || 'KB';
    const k = Object.assign({
      id: Fmt.nextId(prefix, st.knowledgeItems), kind, title, body, version: 1, status: 'draft',
      owner: actorInfo().actorId, approver: null, approvedAt: null, publishedAt: null, previousBody: null,
      submittedAt: null, history: [{ status: 'draft', by: actorInfo().actorId, at: Fmt.nowIso() }]
    }, extra || {});
    st.knowledgeItems.push(k);
    audit({ entity: 'knowledge', entityId: k.id, action: 'created', detail: `${kind}: ${title}` });
    return k;
  }
  function draftFaqFromEscalation(ticketId) {
    const t = escalation(ticketId); if (!t) return null;
    const k = createDraft('faq', t.question.replace(/\?$/, ''), (t.answer ? t.answer : '') , { sourceTicket: ticketId });
    t.faqDraftId = k.id; save();
    return k;
  }
  function transition(id, status, note) {
    const k = knowledge(id); if (!k) return;
    k.status = status;
    k.history = k.history || [];
    k.history.push({ status, by: actorInfo().actorId, at: Fmt.nowIso(), note: note || '' });
    save();
  }
  function submitForReview(id) { const k = knowledge(id); if (!k) return; k.submittedAt = Fmt.nowIso(); transition(id, 'shariah_review'); audit({ entity: 'knowledge', entityId: id, action: 'submitted_for_review', detail: k.title }); }
  function approveKnowledge(id, note) { const k = knowledge(id); if (!k) return; k.approver = actorInfo().actorId; k.approvedAt = Fmt.nowIso(); k.reviewNote = note || ''; transition(id, 'approved', note); audit({ entity: 'knowledge', entityId: id, action: 'approved', detail: note || k.title }); }
  function rejectKnowledge(id, note) { const k = knowledge(id); if (!k) return; k.reviewNote = note || ''; transition(id, 'draft', note); audit({ entity: 'knowledge', entityId: id, action: 'rejected', detail: note || '' }); }
  function publishKnowledge(id) {
    const st = S();
    const k = knowledge(id); if (!k) return;
    // retire the previously published version of the same title/kind, if any
    st.knowledgeItems.filter(x => x.id !== id && x.kind === k.kind && x.title === k.title && x.status === 'published').forEach(x => {
      x.status = 'retired'; x.retiredAt = Fmt.nowIso();
      k.previousBody = x.body;
      audit({ entity: 'knowledge', entityId: x.id, action: 'retired', detail: `diganti oleh ${id}` });
    });
    k.publishedAt = Fmt.nowIso();
    transition(id, 'published');
    // keep mirrors in sync: SME templates are knowledge items too
    const tpl = st.smeTemplates.find(t => t.id === id); if (tpl) tpl.status = 'published';
    const ct = st.calculatorTemplates.find(t => t.id === id); if (ct) ct.status = 'published';
    audit({ entity: 'knowledge', entityId: id, action: 'published', detail: `${k.title} v${k.version}` });
  }
  function updateKnowledgeBody(id, body) { const k = knowledge(id); if (!k) return; k.body = body; audit({ entity: 'knowledge', entityId: id, action: 'edited' }); }

  /* ---------- dashboard snapshots (#4) ---------- */
  function generateSnapshot(period) {
    const st = S();
    const threshold = st.settings.privacyThreshold || 20;
    const base = publishedSnapshots()[0] || st.snapshots[0];
    const factor = 1 + ((parseInt(period.slice(5), 10) % 5) - 2) * 0.012; // deterministic small variation
    const scale = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v * factor / 1000) * 1000]));
    const byDistrict = scale(base.byDistrict);
    const byProgram = scale(base.byProgram);
    // privacy floor demo: a district/program cell is hidden when its estimated record count (RM value / 1000) is below the threshold * 10
    const hiddenCells = [];
    Object.keys(byDistrict).forEach(d => Object.keys(byProgram).forEach(p => {
      const est = Math.round(byDistrict[d] * (byProgram[p] / base.kpi.distribution) / 1000);
      if (est < threshold * 2) hiddenCells.push(`${d}/${p}`);
    }));
    // a period that already has a published snapshot gets a suffixed id (SNAP-2026-09-2) so the correction never overwrites it
    const taken = st.snapshots.filter(s => s.period === period && s.status === 'published').length;
    const snap = {
      id: `SNAP-${period}` + (taken ? `-${taken + 1}` : ''), period, status: 'generated', generatedBy: actorInfo().actorId, generatedAt: Fmt.nowIso(),
      approvedBy: null, approvedAt: null, publishedAt: null, publishedBy: null, threshold,
      kpi: { collection: Math.round(base.kpi.collection * factor), distribution: Math.round(base.kpi.distribution * factor), asnafSupported: Math.round(base.kpi.asnafSupported * factor), repeatPayers: Math.min(0.95, +(base.kpi.repeatPayers + 0.01).toFixed(2)) },
      byDistrict, byProgram, hiddenCells,
      trend: (base.trend || []).slice(1).concat([Math.round(base.kpi.collection * factor)]),
      supersedes: null
    };
    // a generated snapshot for an existing period replaces any earlier non-published one
    st.snapshots = st.snapshots.filter(s => !(s.period === period && s.status !== 'published'));
    st.snapshots.push(snap);
    audit({ entity: 'snapshot', entityId: snap.id, action: 'generated', detail: `ambang ${threshold}; ${hiddenCells.length} sel disembunyikan` });
    return snap;
  }
  function submitSnapshot(id) {
    const s = snapshot(id); if (!s) return;
    s.status = 'pending_approval'; s.submittedAt = Fmt.nowIso();
    audit({ entity: 'snapshot', entityId: id, action: 'submitted_for_approval' });
  }
  function publishSnapshot(id) {
    const st = S();
    const s = snapshot(id); if (!s) return { ok: false, error: 'Snapshot tidak dijumpai' };
    const me = actorInfo();
    if (role() !== 'admin') return { ok: false, error: 'Hanya admin boleh menerbitkan' };
    if (s.generatedBy === me.actorId) return { ok: false, error: 'Dua orang berbeza diperlukan: penjana tidak boleh menerbitkan' };
    st.snapshots.filter(x => x.id !== id && x.period === s.period && x.status === 'published').forEach(x => { x.status = 'superseded'; s.supersedes = x.id; });
    s.status = 'published'; s.publishedBy = me.actorId; s.publishedAt = Fmt.todayIso(); s.approvedBy = me.actorId; s.approvedAt = Fmt.nowIso();
    audit({ entity: 'snapshot', entityId: id, action: 'published', detail: s.supersedes ? `menggantikan ${s.supersedes}` : s.period });
    return { ok: true, snapshot: s };
  }

  /* ---------- settings (#8) ---------- */
  function updateSettings(patch) {
    const st = S();
    Object.keys(patch).forEach(k => {
      if (k === 'gateways') {
        Object.keys(patch.gateways).forEach(g => {
          if (st.settings.gateways[g] !== patch.gateways[g]) {
            st.settings.gateways[g] = patch.gateways[g];
            audit({ entity: 'settings', entityId: 'gateway:' + g, action: 'gateway_switched', detail: patch.gateways[g] });
          }
        });
      } else if (st.settings[k] !== patch[k]) {
        st.settings[k] = patch[k];
        audit({ entity: 'settings', entityId: k, action: 'setting_changed', detail: String(patch[k]) });
      }
    });
    save();
  }

  return {
    load, save, reset, state: S, audit,
    session, setSession, setSmeMode, account, role, currentPayer, currentEmployer, currentOfficer, loginAsPayer, otpFail, logout,
    payer, employer, officer, knowledge, isPublished, publishedKnowledge, knowledgeByStatus, story, publishedStories,
    publishedSnapshots, snapshot, snapshotForPeriod, calculatorTemplates, calculatorTemplate, smeTemplates, smeTemplate,
    payerPayments, payerPaid, payerConsent, payerConsents, lastCalculation, calculation, paymentRef, enrolmentFor, enrolment,
    employerEnrolments, employerRuns, run, approvedEmployers, smeCase, payerCases, allCases, caseAnswers, appointments, appointment,
    officerSlots, officersFor, escalation, escalations, conversation, auditLog, settings, checklist,
    saveCalculation, handOff, returnReceipt, grantConsent, revokeConsent, updatePayerDistrict,
    requestEnrolment, updateEnrolmentAmount, stopEnrolment, confirmEnrolment, inviteEmployee,
    saveEmployerDraft, submitEmployer, approveEmployer, requestDocs, suspendEmployer, saveDeductionSettings, toggleChecklist,
    createRun, confirmRun,
    createSmeCase, bookAppointment, requestCallback, assignCase, verifyCase, correctCase, referCase, addCaseMessage, blockSlot, linkAppointmentCase, rescheduleAppointment,
    assistantAsk, createEscalation, requestOfficer, answerEscalation, closeEscalation,
    createDraft, draftFaqFromEscalation, submitForReview, approveKnowledge, rejectKnowledge, publishKnowledge, updateKnowledgeBody,
    generateSnapshot, submitSnapshot, publishSnapshot, updateSettings
  };
})();
