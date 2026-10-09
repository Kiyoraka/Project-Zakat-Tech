/* ZakatTech 360 prototype — formatting helpers (plain browser script, defines global Fmt) */
const Fmt = (() => {
  const MONTHS = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogs', 'Sep', 'Okt', 'Nov', 'Dis'];
  const MONTHS_LONG = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  const DAYS = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];

  function pad(n) { return String(n).padStart(2, '0'); }

  function parse(iso) {
    if (!iso) return null;
    if (iso instanceof Date) return iso;
    // Accept YYYY-MM-DD, YYYY-MM-DDTHH:mm and YYYY-MM
    const m = String(iso).match(/^(\d{4})-(\d{2})(?:-(\d{2}))?(?:T(\d{2}):(\d{2}))?/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, m[3] ? +m[3] : 1, m[4] ? +m[4] : 0, m[5] ? +m[5] : 0);
  }

  function rm(n, decimals) {
    if (n === null || n === undefined || isNaN(n)) return 'RM —';
    const d = decimals === undefined ? (Number.isInteger(n) ? 0 : 2) : decimals;
    return 'RM ' + Number(n).toLocaleString('en-MY', { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  function num(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return Number(n).toLocaleString('en-MY');
  }

  function pct(x, decimals) {
    if (x === null || x === undefined || isNaN(x)) return '—';
    return (x * 100).toFixed(decimals || 0) + '%';
  }

  function date(iso) {           // 09 Okt 2026
    const d = parse(iso); if (!d) return '—';
    return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  function dateShort(iso) {      // 09 Okt
    const d = parse(iso); if (!d) return '—';
    return `${pad(d.getDate())} ${MONTHS[d.getMonth()]}`;
  }
  function time(iso) {           // 09:50
    const d = parse(iso); if (!d) return '—';
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function dateTime(iso) {       // 09 Okt 2026 09:50
    const d = parse(iso); if (!d) return '—';
    return `${date(d)} ${time(d)}`;
  }
  function month(ym) {           // Okt 2026
    const d = parse(ym); if (!d) return '—';
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  function monthLong(ym) {       // Oktober 2026
    const d = parse(ym); if (!d) return '—';
    return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
  }
  function dayName(iso) {        // Jum
    const d = parse(iso); if (!d) return '—';
    return DAYS[d.getDay()];
  }

  function toIso(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function nowIso() {
    const d = new Date();
    return `${toIso(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function todayIso() { return toIso(new Date()); }
  function thisMonth() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; }
  function addMonths(ym, k) {
    const d = parse(ym); d.setMonth(d.getMonth() + k);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  }
  function daysBetween(a, b) {
    const da = parse(a), db = parse(b);
    if (!da || !db) return 0;
    return Math.round((db - da) / 86400000);
  }

  function maskMyKad(s) {
    if (!s) return '—';
    const digits = String(s).replace(/\D/g, '');
    if (digits.length >= 4) return '****-**-' + digits.slice(-4);
    return s; // already masked
  }

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // djb2 hash -> 8 hex chars (audit-line look-alike, not cryptographic)
  function djb2(str) {
    let h = 5381;
    const s = String(str);
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  // Next sequential id for a prefix, e.g. nextId('ESK', list, 'id') -> 'ESK-119'
  function nextId(prefix, list, key) {
    let max = 0, width = 3;
    (list || []).forEach(x => {
      const v = String(x[key || 'id'] || '');
      if (v.startsWith(prefix + '-')) {
        const digits = v.slice(prefix.length + 1).replace(/\D/g, '');
        const n = parseInt(digits, 10);
        if (!isNaN(n) && n > max) max = n;
        if (digits.length > width) width = digits.length; // keep the seed's zero-padding (R-2026-0912 -> R-2026-0913)
      }
    });
    width = Math.max(width, String(max + 1).length);
    return `${prefix}-${String(max + 1).padStart(width, '0')}`;
  }

  // "FAQ-12" -> "FAQ #12", "TPL-RUNCIT" -> "Templat RUNCIT", "STO-021" -> "Kisah #21"
  function knowledgeRef(id) {
    if (!id) return '';
    const [kind, rest] = String(id).split('-');
    const n = rest ? rest.replace(/^0+/, '') : '';
    switch (kind) {
      case 'FAQ': return `FAQ #${n}`;
      case 'TPL': return `Templat ${rest}`;
      case 'STO': return `Kisah #${n}`;
      case 'KIT': return `Kit ${rest}`;
      default: return id;
    }
  }

  function parseMoney(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseFloat(String(v).replace(/[^\d.-]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function initials(name) {
    return String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  return {
    MONTHS, MONTHS_LONG, DAYS, pad, parse, rm, num, pct, date, dateShort, time, dateTime, month, monthLong, dayName,
    toIso, nowIso, todayIso, thisMonth, addMonths, daysBetween, maskMyKad, esc, djb2, nextId, knowledgeRef,
    parseMoney, initials
  };
})();
