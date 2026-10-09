// ZakatTech 360 - hardcoded prototype seed data.
// Plain browser script: defines one global, SEED. Load before every other script.
// All values are demo data. Nothing here is an official authority figure.

const SEED = {
  meta: {
    product: "ZakatTech 360",
    authority: "Pusat Zakat",
    portal: "Portal Bayaran Rasmi",
    scheme: "Skim Potongan Gaji",
    tagline: "Mudah Bayar, Jelas Manfaat",
    today: "2026-10-09",
    nisabYear: 2026,
    nisab: 24000, // demo value, RM, used by calculators
    rate: 0.025
  },

  // Demo account picker (roles come from a picker, no real login)
  accounts: [
    { key: "awam",   label: "Awam",                 role: "public",           surface: "public.html",   hash: "#/" },
    { key: "ahmad",  label: "Ahmad bin Ali",        sub: "Pembayar",                   role: "payer",            payerId: "PAY-001",    surface: "payer.html",    hash: "#/masuk" },
    { key: "aisyah", label: "Aisyah Lim",           sub: "Pemilik PKS (Kedai Ali)",    role: "sme_owner",        payerId: "PAY-004",    surface: "payer.html",    hash: "#/perniagaan" },
    { key: "hr1",    label: "HR Hospital Negeri",   sub: "Majikan aktif",              role: "employer_hr",      employerId: "EMP-001", surface: "employer.html", hash: "#/" },
    { key: "hr2",    label: "HR Kilang Elektronik", sub: "Majikan menunggu kelulusan", role: "employer_hr",      employerId: "EMP-002", surface: "employer.html", hash: "#/" },
    { key: "aminah", label: "Pn. Aminah",           sub: "Pegawai",                    role: "officer",          officerId: "OFF-001",  surface: "officer.html",  hash: "#/" },
    { key: "harun",  label: "Ustaz Harun",          sub: "Penyemak Syariah",           role: "shariah_reviewer", officerId: "OFF-003",  surface: "officer.html",  hash: "#/kandungan" },
    { key: "admin",  label: "Admin",                sub: "Pentadbir",                  role: "admin",            officerId: "OFF-004",  surface: "officer.html",  hash: "#/" }
  ],

  districts: ["Timur", "Barat", "Utara", "Tengah", "Selatan"],

  // ---------------------------------------------------------------- employers
  employers: [
    { id: "EMP-001", name: "Hospital Negeri (demo)", sector: "hospital", size: "500-1000", district: "Timur", status: "active",
      hrName: "Pn. Rohana Idris", hrEmail: "hr@hospitalnegeri.demo", ssm: "ok", payrollSystem: "SAGA", payDay: 25, fileMethod: "csv",
      approverName: "En. Shamsul Bahri", minDeduction: 10, effectiveFrom: "2026-07", submittedAt: "2026-06-24", approvedAt: "2026-06-30",
      departments: ["Kecemasan", "Farmasi", "Kejururawatan", "Pentadbiran", "Radiologi", "Makmal Patologi"] },
    { id: "EMP-002", name: "Kilang Elektronik (demo)", sector: "factory", size: "100-500", district: "Barat", status: "pending",
      hrName: "Cik Liyana Ramli", hrEmail: "hr@kilangelektronik.demo", ssm: "ok", payrollSystem: "SAP", payDay: 25, fileMethod: "csv",
      approverName: "En. Daniel Tan", minDeduction: 10, effectiveFrom: "2026-11", submittedAt: "2026-10-06", approvedAt: null,
      departments: ["Pengeluaran", "Kawalan Kualiti", "Gudang", "Kejuruteraan", "Sumber Manusia"] },
    { id: "EMP-003", name: "Jabatan Negeri (demo)", sector: "government", size: "100-500", district: "Timur", status: "active",
      hrName: "En. Kamarul Ariffin", hrEmail: "hr@jabatannegeri.demo", ssm: "ok", payrollSystem: "SAGA", payDay: 25, fileMethod: "csv",
      approverName: "Pn. Salmah Jusoh", minDeduction: 10, effectiveFrom: "2026-08", submittedAt: "2026-07-10", approvedAt: "2026-07-15",
      departments: ["Pentadbiran", "Kewangan", "Perancangan", "Teknologi Maklumat"] },
    { id: "EMP-004", name: "Kilang XYZ (demo)", sector: "factory", size: "100-500", district: "Utara", status: "pending",
      hrName: "En. Rizal Hamdan", hrEmail: "hr@kilangxyz.demo", ssm: "?", payrollSystem: "Manual", payDay: 25, fileMethod: "csv",
      approverName: "Pn. Juliana Mat", minDeduction: 10, effectiveFrom: "2026-11", submittedAt: "2026-10-08", approvedAt: null,
      departments: ["Pengeluaran", "Pembungkusan", "Penyelenggaraan", "Pentadbiran"] }
  ],

  // ---------------------------------------------------------------- payers
  payers: [
    { id: "PAY-001", name: "Ahmad bin Ali", district: "Timur", employerId: "EMP-001", deduction: 100, consent: { channels: ["whatsapp", "email"], frequency: "yearly", grantedAt: "2026-10-09" },
      mykadMasked: "****-**-1234", phone: "+60 12-345 6789" },
    { id: "PAY-002", name: "Siti Nur", district: "Timur", employerId: "EMP-001", deduction: 150, consent: null,
      mykadMasked: "****-**-5521", phone: "+60 13-218 4470" },
    { id: "PAY-003", name: "Faiz Rahman", district: "Barat", employerId: "EMP-001", deduction: 100, consent: { channels: ["sms"], frequency: "monthly", grantedAt: "2026-08-02" },
      mykadMasked: "****-**-8093", phone: "+60 17-602 3315" },
    { id: "PAY-004", name: "Aisyah Lim", district: "Tengah", employerId: null, consent: { channels: ["whatsapp"], frequency: "yearly", grantedAt: "2026-06-11" },
      mykadMasked: "****-**-4408", phone: "+60 16-455 1290" },
    { id: "PAY-005", name: "Hafiz Omar", district: "Utara", employerId: "EMP-003", deduction: 80, consent: null,
      mykadMasked: "****-**-2765", phone: "+60 19-330 8812" },
    { id: "PAY-006", name: "Nadia Hassan", district: "Barat", employerId: null, consent: { channels: ["email"], frequency: "yearly", grantedAt: "2026-03-20" },
      mykadMasked: "****-**-6134", phone: "+60 11-274 5503" },
    { id: "PAY-007", name: "Zul Ikhwan", district: "Selatan", employerId: null, consent: null,
      mykadMasked: "****-**-9057", phone: "+60 14-887 2021" },
    { id: "PAY-008", name: "Maria Abdullah", district: "Timur", employerId: "EMP-003", deduction: 120, consent: { channels: ["whatsapp", "sms"], frequency: "monthly", grantedAt: "2026-09-01" },
      mykadMasked: "****-**-3382", phone: "+60 12-919 0476" }
  ],

  // ---------------------------------------------------------------- officers
  officers: [
    { id: "OFF-001", name: "Pn. Aminah", role: "officer", district: "Timur", industries: ["runcit", "fnb"], email: "aminah@pusatzakat.demo", title: "Pegawai Zakat" },
    { id: "OFF-002", name: "En. Razak", role: "officer", district: "Barat", industries: ["online", "professional"], email: "razak@pusatzakat.demo", title: "Pegawai Zakat" },
    { id: "OFF-003", name: "Ustaz Harun", role: "shariah_reviewer", district: null, industries: [], email: "harun@pusatzakat.demo", title: "Penyemak Syariah" },
    { id: "OFF-004", name: "Admin", role: "admin", district: null, industries: [], email: "admin@pusatzakat.demo", title: "Pentadbir" }
  ],

  // ---------------------------------------------------------------- payments (mirrored receipts)
  payments: [
    { payerId: "PAY-001", date: "2026-07-12", type: "simpanan", amount: 600, channel: "portal", receipt: "R-2026-0712" },
    { payerId: "PAY-001", date: "2026-08-12", type: "pendapatan", amount: 300, channel: "deduction", receipt: "R-2026-0812" },
    { payerId: "PAY-001", date: "2026-09-12", type: "pendapatan", amount: 300, channel: "portal", receipt: "R-2026-0912" }
  ],

  // ---------------------------------------------------------------- consent registry
  consents: [
    { id: "CON-001", payerId: "PAY-001", channels: ["whatsapp", "email"], frequency: "yearly", grantedAt: "2026-10-09", status: "active",
      text: "Saya bersetuju menerima peringatan zakat tahunan daripada Pusat Zakat melalui WhatsApp dan e-mel. Saya boleh menarik balik kebenaran ini pada bila-bila masa." },
    { id: "CON-002", payerId: "PAY-003", channels: ["sms"], frequency: "monthly", grantedAt: "2026-08-02", status: "active",
      text: "Saya bersetuju menerima peringatan zakat bulanan daripada Pusat Zakat melalui SMS. Saya boleh menarik balik kebenaran ini pada bila-bila masa." },
    { id: "CON-003", payerId: "PAY-004", channels: ["whatsapp"], frequency: "yearly", grantedAt: "2026-06-11", status: "active",
      text: "Saya bersetuju menerima peringatan zakat tahunan daripada Pusat Zakat melalui WhatsApp. Saya boleh menarik balik kebenaran ini pada bila-bila masa." },
    { id: "CON-004", payerId: "PAY-006", channels: ["email"], frequency: "yearly", grantedAt: "2026-03-20", status: "active",
      text: "Saya bersetuju menerima peringatan zakat tahunan daripada Pusat Zakat melalui e-mel. Saya boleh menarik balik kebenaran ini pada bila-bila masa." },
    { id: "CON-005", payerId: "PAY-008", channels: ["whatsapp", "sms"], frequency: "monthly", grantedAt: "2026-09-01", status: "active",
      text: "Saya bersetuju menerima peringatan zakat bulanan daripada Pusat Zakat melalui WhatsApp dan SMS. Saya boleh menarik balik kebenaran ini pada bila-bila masa." }
  ],

  // ---------------------------------------------------------------- Skim Potongan Gaji enrolments (E5, Y9, Y11)
  enrolments: [
    // Real payers
    { id: "ENR-001", payerId: "PAY-001", employerId: "EMP-001", employeeName: "Ahmad bin Ali", employeeNo: "E-0012", department: "Kecemasan", amount: 100, status: "active",
      consentGivenAt: "2026-07-20", requestedAt: "2026-07-20", confirmedAt: "2026-07-22", octStatus: "ok" },
    { id: "ENR-002", payerId: "PAY-002", employerId: "EMP-001", employeeName: "Siti Nur", employeeNo: "E-0031", department: "Farmasi", amount: 150, status: "pending_hr",
      consentGivenAt: null, requestedAt: "2026-10-07", confirmedAt: null, octStatus: null },
    { id: "ENR-003", payerId: "PAY-003", employerId: "EMP-001", employeeName: "Faiz Rahman", employeeNo: "E-0044", department: "Radiologi", amount: 100, status: "active",
      consentGivenAt: "2026-08-02", requestedAt: "2026-08-02", confirmedAt: "2026-08-05", octStatus: "gagal" },
    { id: "ENR-004", payerId: "PAY-005", employerId: "EMP-003", employeeName: "Hafiz Omar", employeeNo: "E-0107", department: "Kewangan", amount: 80, status: "active",
      consentGivenAt: "2026-08-04", requestedAt: "2026-08-04", confirmedAt: "2026-08-06", octStatus: "ok" },
    { id: "ENR-005", payerId: "PAY-008", employerId: "EMP-003", employeeName: "Maria Abdullah", employeeNo: "E-0115", department: "Perancangan", amount: 120, status: "active",
      consentGivenAt: "2026-09-01", requestedAt: "2026-09-01", confirmedAt: "2026-09-03", octStatus: "ok" },
    // Invented employees of EMP-001 (no payer account in the demo)
    { id: "ENR-006", payerId: null, employerId: "EMP-001", employeeName: "Rosli Kamarudin", employeeNo: "E-0003", department: "Pentadbiran", amount: 120, status: "active",
      consentGivenAt: "2026-07-02", requestedAt: "2026-07-02", confirmedAt: "2026-07-03", octStatus: "ok" },
    { id: "ENR-007", payerId: null, employerId: "EMP-001", employeeName: "Noraini Yusof", employeeNo: "E-0007", department: "Kejururawatan", amount: 80, status: "active",
      consentGivenAt: "2026-07-03", requestedAt: "2026-07-03", confirmedAt: "2026-07-06", octStatus: "ok" },
    { id: "ENR-008", payerId: null, employerId: "EMP-001", employeeName: "Kamal Hisyam", employeeNo: "E-0015", department: "Makmal Patologi", amount: 200, status: "active",
      consentGivenAt: "2026-07-08", requestedAt: "2026-07-08", confirmedAt: "2026-07-09", octStatus: "ok" },
    { id: "ENR-009", payerId: null, employerId: "EMP-001", employeeName: "Farah Zulkifli", employeeNo: "E-0019", department: "Farmasi", amount: 100, status: "active",
      consentGivenAt: "2026-07-10", requestedAt: "2026-07-10", confirmedAt: "2026-07-13", octStatus: "ok" },
    { id: "ENR-010", payerId: null, employerId: "EMP-001", employeeName: "Suresh a/l Muthu", employeeNo: "E-0023", department: "Kecemasan", amount: 50, status: "active",
      consentGivenAt: "2026-07-14", requestedAt: "2026-07-14", confirmedAt: "2026-07-15", octStatus: "ok" },
    { id: "ENR-011", payerId: null, employerId: "EMP-001", employeeName: "Lee Mei Ling", employeeNo: "E-0026", department: "Radiologi", amount: 150, status: "active",
      consentGivenAt: "2026-07-21", requestedAt: "2026-07-21", confirmedAt: "2026-07-22", octStatus: "ok" },
    { id: "ENR-012", payerId: null, employerId: "EMP-001", employeeName: "Haslinda Ismail", employeeNo: "E-0038", department: "Kejururawatan", amount: 100, status: "active",
      consentGivenAt: "2026-08-11", requestedAt: "2026-08-11", confirmedAt: "2026-08-12", octStatus: "ok" },
    { id: "ENR-013", payerId: null, employerId: "EMP-001", employeeName: "Shahrul Nizam", employeeNo: "E-0041", department: "Pentadbiran", amount: 60, status: "pending_hr",
      consentGivenAt: null, requestedAt: "2026-10-05", confirmedAt: null, octStatus: null },
    { id: "ENR-014", payerId: null, employerId: "EMP-001", employeeName: "Wan Nurul Huda", employeeNo: "E-0047", department: "Makmal Patologi", amount: 90, status: "pending_hr",
      consentGivenAt: null, requestedAt: "2026-10-08", confirmedAt: null, octStatus: null },
    { id: "ENR-015", payerId: null, employerId: "EMP-001", employeeName: "Mohd Firdaus", employeeNo: "E-0052", department: "Kecemasan", amount: 70, status: "stopping",
      consentGivenAt: "2026-07-16", requestedAt: "2026-07-16", confirmedAt: "2026-07-17", octStatus: "ok" }
  ],

  // ---------------------------------------------------------------- monthly deduction runs (E6, E7)
  deductionRuns: [
    { id: "RUN-2026-07", employerId: "EMP-001", month: "2026-07", status: "acknowledged", matched: 290, mismatched: [], total: 29000,
      uploadedBy: "Pn. Rohana Idris", approvedBy: "En. Shamsul Bahri", sentAt: "2026-07-25T10:30", file: "gaji-2026-07.csv" },
    { id: "RUN-2026-08", employerId: "EMP-001", month: "2026-08", status: "acknowledged", matched: 294, mismatched: [], total: 29400,
      uploadedBy: "Pn. Rohana Idris", approvedBy: "En. Shamsul Bahri", sentAt: "2026-08-25T09:48", file: "gaji-2026-08.csv" },
    { id: "RUN-2026-09", employerId: "EMP-001", month: "2026-09", status: "acknowledged", matched: 296,
      mismatched: [ { employeeNo: "E-0188", employeeName: "Aziz Rahim", reason: "berhenti kerja" } ],
      total: 29600, uploadedBy: "Pn. Rohana Idris", approvedBy: "En. Shamsul Bahri", sentAt: "2026-09-25T10:05", file: "gaji-2026-09.csv" },
    { id: "RUN-2026-10", employerId: "EMP-001", month: "2026-10", status: "sent", matched: 298,
      mismatched: [
        { employeeNo: "E-0044", employeeName: "Faiz Rahman",        reason: "jumlah berubah" },
        { employeeNo: "E-0031", employeeName: "Siti Nur",           reason: "tiada persetujuan" },
        { employeeNo: "E-0041", employeeName: "Shahrul Nizam",      reason: "tiada persetujuan" },
        { employeeNo: "E-0047", employeeName: "Wan Nurul Huda",     reason: "tiada persetujuan" },
        { employeeNo: "E-0121", employeeName: "Zainab Hamid",       reason: "tiada persetujuan" },
        { employeeNo: "E-0134", employeeName: "Ravi a/l Kumar",     reason: "tiada persetujuan" },
        { employeeNo: "E-0142", employeeName: "Nurul Ain Saad",     reason: "tiada persetujuan" },
        { employeeNo: "E-0156", employeeName: "Hairul Anuar",       reason: "berhenti kerja" },
        { employeeNo: "E-0163", employeeName: "Chong Wei Kit",      reason: "berhenti kerja" },
        { employeeNo: "E-0171", employeeName: "Rafidah Osman",      reason: "berhenti kerja" },
        { employeeNo: "E-0179", employeeName: "Ismail Bakar",       reason: "jumlah berubah" },
        { employeeNo: "E-0184", employeeName: "Syafiqah Rosli",     reason: "jumlah berubah" },
        { employeeNo: "E-0192", employeeName: "Kavitha a/p Raju",   reason: "jumlah berubah" },
        { employeeNo: "E-0205", employeeName: "Amirul Hakim",       reason: "jumlah berubah" }
      ],
      total: 29800, uploadedBy: "HR", approvedBy: "En. Shamsul Bahri", sentAt: "2026-10-25T10:12", file: "gaji-2026-10.csv" }
  ],
  csvTemplateColumns: ["no_pekerja", "nama", "no_mykad", "jumlah_potongan", "bulan"],

  // ---------------------------------------------------------------- saved calculations (Y2 estimate)
  calculations: [
    { id: "CALC-001", payerId: "PAY-001", templateId: "TPL-PENDAPATAN", version: 2, inputs: { annualIncome: 60000, allowedDeductions: 0 }, amount: 1500, savedAt: "2026-10-01T20:15" }
  ],

  // ---------------------------------------------------------------- personal calculator templates (Y3, Y4)
  calculatorTemplates: [
    { id: "TPL-PENDAPATAN", type: "pendapatan", label: "Pendapatan", description: "Untuk gaji, elaun dan pendapatan bebas sepanjang tahun.",
      version: 2, status: "published", method: "Pendapatan kasar tolak tolakan dibenarkan, kadar 2.5% jika melebihi nisab",
      steps: [
        { title: "Pendapatan", fields: [
          { key: "annualIncome", label: "Pendapatan tahunan", help: "Jumlah gaji, elaun dan bonus yang diterima dalam setahun.", example: "RM 60,000" } ] },
        { title: "Tolakan", fields: [
          { key: "allowedDeductions", label: "Tolakan dibenarkan", help: "Tolakan mengikut kaedah rasmi Pusat Zakat, contohnya caruman wajib yang dipotong terus daripada gaji. Isi 0 jika tidak pasti.", example: "RM 0" } ] }
      ],
      formula: "max(0, annualIncome - allowedDeductions)", explanationKnowledgeId: "FAQ-09" },
    { id: "TPL-SIMPANAN", type: "simpanan", label: "Simpanan", description: "Untuk wang simpanan di bank yang cukup setahun.",
      version: 2, status: "published", method: "Baki terendah simpanan dalam tempoh setahun, kadar 2.5% jika melebihi nisab",
      steps: [
        { title: "Baki simpanan", fields: [
          { key: "lowestBalance", label: "Baki terendah dalam setahun", help: "Lihat penyata bank dan ambil baki paling rendah sepanjang tahun.", example: "RM 30,000" } ] }
      ],
      formula: "lowestBalance", explanationKnowledgeId: "FAQ-10" },
    { id: "TPL-EMAS", type: "emas", label: "Emas / Perak", description: "Untuk emas simpanan yang tidak dipakai.",
      version: 1, status: "published", method: "Berat emas simpanan didarab harga semasa segram, kadar 2.5% jika melebihi nisab",
      steps: [
        { title: "Berat emas", fields: [
          { key: "grams", label: "Berat emas simpanan (gram)", help: "Emas yang disimpan dan tidak dipakai. Timbang atau rujuk resit belian.", example: "120 gram" } ] },
        { title: "Harga emas", fields: [
          { key: "pricePerGram", label: "Harga semasa segram", help: "Harga belian semasa segram yang dipaparkan oleh Pusat Zakat.", example: "RM 400" } ] }
      ],
      formula: "grams * pricePerGram", explanationKnowledgeId: "FAQ-11" },
    { id: "TPL-KWSP", type: "kwsp", label: "KWSP", description: "Untuk wang KWSP yang telah dikeluarkan.",
      version: 1, status: "published", method: "Jumlah yang dikeluarkan daripada KWSP, kadar 2.5% jika melebihi nisab",
      steps: [
        { title: "Pengeluaran", fields: [
          { key: "withdrawnAmount", label: "Jumlah pengeluaran KWSP", help: "Jumlah wang yang anda keluarkan daripada akaun KWSP tahun ini.", example: "RM 40,000" } ] }
      ],
      formula: "withdrawnAmount", explanationKnowledgeId: "FAQ-13" },
    { id: "TPL-SAHAM", type: "saham", label: "Saham / ASB", description: "Untuk pelaburan saham dan unit amanah.",
      version: 1, status: "published", method: "Nilai pasaran saham dan nilai unit amanah pada hujung tahun, kadar 2.5% jika melebihi nisab",
      steps: [
        { title: "Nilai pelaburan", fields: [
          { key: "marketValue", label: "Nilai pasaran saham", help: "Nilai semua saham yang dipegang pada hujung tahun.", example: "RM 15,000" },
          { key: "asbValue", label: "Nilai ASB / unit amanah", help: "Baki unit amanah pada hujung tahun mengikut penyata.", example: "RM 20,000" } ] }
      ],
      formula: "marketValue + asbValue", explanationKnowledgeId: "FAQ-14" }
  ],

  // ---------------------------------------------------------------- SME industry templates (S1-S4)
  // Each question carries a group so the app can sum assets and liabilities.
  smeTemplates: [
    { id: "TPL-RUNCIT", industry: "runcit", label: "Runcit", version: 3, status: "approved", method: "Modal kerja",
      questions: [
        { key: "closingStock", group: "asset", label: "Nilai stok akhir tahun (kos)", help: "Apa itu stok? Barang untuk dijual yang masih ada pada hujung tahun.", example: "contoh: barang di rak + gudang", kind: "money" },
        { key: "cash", group: "asset", label: "Wang tunai dan baki bank", help: "Apa itu wang tunai? Wang di laci dan dalam akaun bank perniagaan.", example: "contoh: baki akaun semasa kedai", kind: "money" },
        { key: "receivables", group: "asset", label: "Hutang pelanggan", help: "Apa itu hutang pelanggan? Jualan yang belum dibayar oleh pelanggan.", example: "contoh: buku hutang kedai", kind: "money" },
        { key: "prepaid", group: "asset", label: "Bayaran pendahuluan", help: "Apa itu bayaran pendahuluan? Bayaran untuk perkhidmatan yang belum diterima.", example: "contoh: sewa kedai bulan depan", kind: "money" },
        { key: "payables", group: "liability", label: "Hutang kepada pembekal", help: "Apa itu hutang pembekal? Barang yang diterima tetapi belum dibayar.", example: "contoh: invois pemborong", kind: "money" },
        { key: "shortTermLoans", group: "liability", label: "Pinjaman jangka pendek", help: "Apa itu pinjaman jangka pendek? Pinjaman yang perlu dibayar dalam 12 bulan.", example: "contoh: ansuran pembiayaan modal", kind: "money" },
        { key: "annualSales", group: "pnl", label: "Jualan setahun", help: "Apa itu jualan setahun? Jumlah semua jualan dalam tahun kewangan.", example: "contoh: jumlah resit jualan", kind: "money" },
        { key: "costOfSales", group: "pnl", label: "Kos barang dijual", help: "Apa itu kos barang dijual? Harga belian barang yang telah dijual.", example: "contoh: jumlah belian stok tolak stok akhir", kind: "money" },
        { key: "operatingExpenses", group: "pnl", label: "Belanja operasi", help: "Apa itu belanja operasi? Sewa, gaji pekerja, elektrik dan kos harian.", example: "contoh: sewa + bil + gaji", kind: "money" }
      ],
      formula: "currentAssets(closingStock+cash+receivables+prepaid) - currentLiabilities(payables+shortTermLoans)",
      lines: [
        { key: "currentAssets", label: "Aset semasa", knowledgeId: "TPL-RUNCIT" },
        { key: "currentLiabilities", label: "- Liabiliti semasa", knowledgeId: "TPL-RUNCIT" },
        { key: "zakatBase", label: "= Asas zakat", knowledgeId: "TPL-RUNCIT" },
        { key: "zakatAmount", label: "x 2.5%", knowledgeId: "FAQ-12" }
      ],
      healthNotes: ["Stok yang terlalu tinggi mengikat wang tunai.", "Kutip hutang pelanggan lebih awal untuk aliran tunai.", "Semak harga pembekal setiap suku tahun."],
      explanationKnowledgeId: "TPL-RUNCIT" },
    { id: "TPL-FNB", industry: "fnb", label: "F&B", version: 2, status: "published", method: "Modal kerja",
      questions: [
        { key: "ingredientStock", group: "asset", label: "Nilai stok bahan mentah", help: "Apa itu stok bahan? Bahan masakan yang belum digunakan pada hujung tahun.", example: "contoh: beras, minyak, ayam dalam peti sejuk", kind: "money" },
        { key: "cash", group: "asset", label: "Wang tunai dan baki bank", help: "Apa itu wang tunai? Wang di kaunter dan dalam akaun bank perniagaan.", example: "contoh: baki akaun dan laci kaunter", kind: "money" },
        { key: "receivables", group: "asset", label: "Hutang pelanggan katering", help: "Apa itu hutang pelanggan? Tempahan yang sudah dihantar tetapi belum dibayar.", example: "contoh: tempahan kenduri belum dijelaskan", kind: "money" },
        { key: "deposits", group: "asset", label: "Deposit dan bayaran pendahuluan", help: "Apa itu deposit? Wang yang dibayar lebih awal dan boleh dituntut semula.", example: "contoh: deposit sewa gerai", kind: "money" },
        { key: "supplierPayables", group: "liability", label: "Hutang kepada pembekal", help: "Apa itu hutang pembekal? Bahan yang diterima tetapi belum dibayar.", example: "contoh: invois pembekal ayam", kind: "money" },
        { key: "shortTermLoans", group: "liability", label: "Pinjaman jangka pendek", help: "Apa itu pinjaman jangka pendek? Pinjaman yang perlu dibayar dalam 12 bulan.", example: "contoh: ansuran peralatan dapur", kind: "money" },
        { key: "annualSales", group: "pnl", label: "Jualan setahun", help: "Apa itu jualan setahun? Jumlah jualan makanan dan minuman setahun.", example: "contoh: jumlah laporan mesin kira", kind: "money" },
        { key: "costOfSales", group: "pnl", label: "Kos bahan setahun", help: "Apa itu kos bahan? Jumlah belian bahan masakan sepanjang tahun.", example: "contoh: jumlah invois pembekal", kind: "money" },
        { key: "operatingExpenses", group: "pnl", label: "Belanja operasi", help: "Apa itu belanja operasi? Sewa, gaji, gas, elektrik dan air.", example: "contoh: sewa gerai + gaji pembantu", kind: "money" }
      ],
      formula: "currentAssets(ingredientStock+cash+receivables+deposits) - currentLiabilities(supplierPayables+shortTermLoans)",
      lines: [
        { key: "currentAssets", label: "Aset semasa", knowledgeId: "TPL-FNB" },
        { key: "currentLiabilities", label: "- Liabiliti semasa", knowledgeId: "TPL-FNB" },
        { key: "zakatBase", label: "= Asas zakat", knowledgeId: "TPL-FNB" },
        { key: "zakatAmount", label: "x 2.5%", knowledgeId: "FAQ-12" }
      ],
      healthNotes: ["Bahan mentah cepat rosak, simpan stok secukupnya.", "Asingkan wang perniagaan daripada wang peribadi.", "Pantau kos bahan berbanding harga menu."],
      explanationKnowledgeId: "TPL-FNB" },
    { id: "TPL-ONLINE", industry: "online", label: "Penjual online", version: 1, status: "published", method: "Modal kerja",
      questions: [
        { key: "inventory", group: "asset", label: "Nilai inventori", help: "Apa itu inventori? Barang yang belum dijual, di rumah atau di gudang.", example: "contoh: kotak barang di stor", kind: "money" },
        { key: "walletBalance", group: "asset", label: "Baki dompet platform", help: "Apa itu baki dompet? Wang jualan yang masih dalam akaun platform.", example: "contoh: baki dompet penjual", kind: "money" },
        { key: "platformReceivables", group: "asset", label: "Bayaran platform belum diterima", help: "Apa itu bayaran belum diterima? Jualan selesai yang belum dipindahkan oleh platform.", example: "contoh: pesanan menunggu pembayaran", kind: "money" },
        { key: "cash", group: "asset", label: "Wang tunai dan baki bank", help: "Apa itu wang tunai? Wang dalam akaun bank perniagaan.", example: "contoh: baki akaun perniagaan", kind: "money" },
        { key: "supplierPayables", group: "liability", label: "Hutang kepada pembekal", help: "Apa itu hutang pembekal? Barang yang diterima tetapi belum dibayar.", example: "contoh: invois pembekal borong", kind: "money" },
        { key: "platformFeesDue", group: "liability", label: "Yuran platform belum dibayar", help: "Apa itu yuran platform? Komisen dan caj yang belum ditolak.", example: "contoh: caj iklan bulan ini", kind: "money" },
        { key: "shortTermLoans", group: "liability", label: "Pinjaman jangka pendek", help: "Apa itu pinjaman jangka pendek? Pinjaman yang perlu dibayar dalam 12 bulan.", example: "contoh: pembiayaan modal mikro", kind: "money" },
        { key: "annualSales", group: "pnl", label: "Jualan setahun", help: "Apa itu jualan setahun? Jumlah jualan di semua platform.", example: "contoh: laporan jualan tahunan platform", kind: "money" },
        { key: "costOfSales", group: "pnl", label: "Kos barang dijual", help: "Apa itu kos barang dijual? Harga belian barang yang sudah dijual.", example: "contoh: jumlah belian daripada pembekal", kind: "money" }
      ],
      formula: "currentAssets(inventory+walletBalance+platformReceivables+cash) - currentLiabilities(supplierPayables+platformFeesDue+shortTermLoans)",
      lines: [
        { key: "currentAssets", label: "Aset semasa", knowledgeId: "TPL-ONLINE" },
        { key: "currentLiabilities", label: "- Liabiliti semasa", knowledgeId: "TPL-ONLINE" },
        { key: "zakatBase", label: "= Asas zakat", knowledgeId: "TPL-ONLINE" },
        { key: "zakatAmount", label: "x 2.5%", knowledgeId: "FAQ-12" }
      ],
      healthNotes: ["Pindahkan baki dompet platform secara berkala.", "Kira yuran platform dalam harga jualan.", "Elak stok lama yang lambat dijual."],
      explanationKnowledgeId: "TPL-ONLINE" },
    { id: "TPL-PROF", industry: "professional", label: "Perkhidmatan profesional", version: 1, status: "published", method: "Modal kerja",
      questions: [
        { key: "receivables", group: "asset", label: "Yuran belum dibayar pelanggan", help: "Apa itu yuran belum dibayar? Bil yang sudah dihantar tetapi belum dijelaskan.", example: "contoh: invois perundingan bulan lepas", kind: "money" },
        { key: "cash", group: "asset", label: "Wang tunai dan baki bank", help: "Apa itu wang tunai? Wang dalam akaun bank firma.", example: "contoh: baki akaun semasa firma", kind: "money" },
        { key: "workInProgress", group: "asset", label: "Kerja belum dibil", help: "Apa itu kerja belum dibil? Kerja yang sudah dibuat tetapi belum diinvois.", example: "contoh: projek separuh siap", kind: "money" },
        { key: "prepaid", group: "asset", label: "Bayaran pendahuluan", help: "Apa itu bayaran pendahuluan? Bayaran untuk perkhidmatan yang belum diterima.", example: "contoh: langganan perisian tahunan", kind: "money" },
        { key: "retainersInAdvance", group: "liability", label: "Yuran pendahuluan diterima", help: "Apa itu yuran pendahuluan? Wang pelanggan untuk kerja yang belum dibuat.", example: "contoh: deposit projek baharu", kind: "money" },
        { key: "payables", group: "liability", label: "Hutang kepada pembekal", help: "Apa itu hutang pembekal? Bil yang diterima tetapi belum dibayar.", example: "contoh: bil sewa pejabat tertunggak", kind: "money" },
        { key: "shortTermLoans", group: "liability", label: "Pinjaman jangka pendek", help: "Apa itu pinjaman jangka pendek? Pinjaman yang perlu dibayar dalam 12 bulan.", example: "contoh: kad kredit perniagaan", kind: "money" },
        { key: "annualFees", group: "pnl", label: "Yuran setahun", help: "Apa itu yuran setahun? Jumlah yuran yang dibil dalam setahun.", example: "contoh: jumlah semua invois", kind: "money" },
        { key: "operatingExpenses", group: "pnl", label: "Belanja operasi", help: "Apa itu belanja operasi? Sewa, gaji staf dan kos pejabat.", example: "contoh: sewa + gaji + utiliti", kind: "money" }
      ],
      formula: "currentAssets(receivables+cash+workInProgress+prepaid) - currentLiabilities(retainersInAdvance+payables+shortTermLoans)",
      lines: [
        { key: "currentAssets", label: "Aset semasa", knowledgeId: "TPL-PROF" },
        { key: "currentLiabilities", label: "- Liabiliti semasa", knowledgeId: "TPL-PROF" },
        { key: "zakatBase", label: "= Asas zakat", knowledgeId: "TPL-PROF" },
        { key: "zakatAmount", label: "x 2.5%", knowledgeId: "FAQ-12" }
      ],
      healthNotes: ["Hantar invois sebaik kerja siap.", "Simpan rizab tunai sekurang-kurangnya tiga bulan.", "Jejaki yuran pendahuluan sebagai liabiliti."],
      explanationKnowledgeId: "TPL-PROF" }
  ],

  // Questionnaire answers per SME case (S2 -> O3)
  smeAnswers: {
    "KES-0042": { templateId: "TPL-RUNCIT", version: 3,
      answers: { closingStock: 48000, cash: 12000, receivables: 6000, prepaid: 2000, payables: 9000, shortTermLoans: 4000, annualSales: 240000, costOfSales: 163200, operatingExpenses: 50000 },
      systemAmount: 1375 }, // (68000 - 13000) x 2.5%
    "KES-0041": { templateId: "TPL-FNB", version: 2,
      answers: { ingredientStock: 8000, cash: 25000, receivables: 3000, deposits: 1000, supplierPayables: 5000, shortTermLoans: 2000, annualSales: 180000, costOfSales: 108000, operatingExpenses: 48000 },
      systemAmount: 750 }, // (37000 - 7000) x 2.5%
    "KES-0039": { templateId: "TPL-ONLINE", version: 1,
      answers: { inventory: 20000, walletBalance: 9000, platformReceivables: 6000, cash: 11000, supplierPayables: 4000, platformFeesDue: 1000, shortTermLoans: 3000, annualSales: 150000, costOfSales: 97500 },
      systemAmount: 950 }, // (46000 - 8000) x 2.5%
    "KES-0031": { templateId: "TPL-FNB", version: 2,
      answers: { ingredientStock: 7000, cash: 22000, receivables: 4000, deposits: 1000, supplierPayables: 4000, shortTermLoans: 2000, annualSales: 170000, costOfSales: 104000, operatingExpenses: 45000 },
      systemAmount: 700 } // (34000 - 6000) x 2.5%
  },

  // ---------------------------------------------------------------- SME advisory cases (S6, O2, O3)
  smeCases: [
    { id: "KES-0042", payerId: "PAY-004", business: "Kedai Ali", industry: "runcit", status: "new", officerId: null, submitted: "2026-10-09",
      verifiedAmount: null, systemAmount: 1375, officerNote: "", messages: [] },
    { id: "KES-0041", payerId: "PAY-006", business: "Warung Mak", industry: "fnb", status: "in_progress", officerId: "OFF-001", submitted: "2026-10-08",
      verifiedAmount: null, systemAmount: 750, officerNote: "Perlu semak baki bank sebenar dan invois pembekal.",
      messages: [
        { from: "officer", at: "2026-10-08T15:10", text: "Terima kasih. Saya sudah terima jawapan soal selidik anda." },
        { from: "officer", at: "2026-10-08T15:12", text: "Boleh sediakan penyata bank bulan lepas untuk sesi video hari Jumaat?" }
      ] },
    { id: "KES-0039", payerId: "PAY-007", business: "Dropship Co", industry: "online", status: "closed", officerId: "OFF-002", submitted: "2026-10-07",
      verifiedAmount: 950, systemAmount: 950, officerNote: "Jawapan lengkap. Pengiraan sistem disahkan.",
      messages: [
        { from: "officer", at: "2026-10-07T16:40", text: "Pengiraan anda sudah disahkan. Jumlah anggaran RM 950." },
        { from: "owner", at: "2026-10-07T17:05", text: "Terima kasih, saya akan bayar di Portal Bayaran Rasmi." }
      ] },
    { id: "KES-0031", payerId: "PAY-006", business: "Warung Mak", industry: "fnb", status: "closed", officerId: "OFF-001", submitted: "2026-09-15",
      verifiedAmount: 700, systemAmount: 700, officerNote: "Disahkan selepas semak stok bahan mentah.",
      messages: [
        { from: "officer", at: "2026-09-17T10:20", text: "Stok bahan mentah sudah disemak. Tiada perubahan." },
        { from: "officer", at: "2026-09-17T10:25", text: "Jumlah disahkan RM 700. Kes ini ditutup." }
      ] }
  ],

  // ---------------------------------------------------------------- appointments (S5, O1, O4)
  appointments: [
    { id: "APT-001", caseId: "KES-0042", payerId: "PAY-004", officerId: "OFF-001", date: "2026-10-09", time: "10:00", mode: "telefon", business: "Kedai Ali", note: "Panggilan awal tentang nilai stok." },
    { id: "APT-002", caseId: "KES-0041", payerId: "PAY-006", officerId: "OFF-001", date: "2026-10-09", time: "11:30", mode: "video", business: "Warung Mak", note: "Semak penyata bank bersama pemilik." },
    { id: "APT-003", caseId: "KES-0042", payerId: "PAY-004", officerId: "OFF-001", date: "2026-10-12", time: "10:00", mode: "pejabat", business: "Kedai Ali", note: "Bawa buku hutang kedai dan invois pemborong." },
    { id: "APT-004", caseId: null, payerId: "PAY-004", officerId: "OFF-001", date: "2026-10-14", time: "10:00", mode: "telefon", business: "Kedai Ali", note: "Susulan dokumen. Belum dipautkan ke kes." }
  ],

  // Officer availability, weekdays 12-16 Oct
  officerSlots: [
    { officerId: "OFF-001", date: "2026-10-12", time: "10:00", status: "booked" },
    { officerId: "OFF-001", date: "2026-10-12", time: "11:30", status: "free" },
    { officerId: "OFF-001", date: "2026-10-12", time: "14:30", status: "free" },
    { officerId: "OFF-001", date: "2026-10-12", time: "16:00", status: "free" },
    { officerId: "OFF-001", date: "2026-10-13", time: "10:00", status: "free" },
    { officerId: "OFF-001", date: "2026-10-13", time: "11:30", status: "free" },
    { officerId: "OFF-001", date: "2026-10-13", time: "14:30", status: "blocked" },
    { officerId: "OFF-001", date: "2026-10-13", time: "16:00", status: "blocked" },
    { officerId: "OFF-001", date: "2026-10-14", time: "10:00", status: "booked" },
    { officerId: "OFF-001", date: "2026-10-14", time: "11:30", status: "free" },
    { officerId: "OFF-001", date: "2026-10-14", time: "14:30", status: "free" },
    { officerId: "OFF-001", date: "2026-10-14", time: "16:00", status: "free" },
    { officerId: "OFF-001", date: "2026-10-15", time: "10:00", status: "free" },
    { officerId: "OFF-001", date: "2026-10-15", time: "11:30", status: "free" },
    { officerId: "OFF-001", date: "2026-10-15", time: "14:30", status: "free" },
    { officerId: "OFF-001", date: "2026-10-15", time: "16:00", status: "free" },
    { officerId: "OFF-001", date: "2026-10-16", time: "10:00", status: "free" },
    { officerId: "OFF-001", date: "2026-10-16", time: "11:30", status: "free" },
    { officerId: "OFF-001", date: "2026-10-16", time: "14:30", status: "free" },
    { officerId: "OFF-001", date: "2026-10-16", time: "16:00", status: "free" },
    { officerId: "OFF-002", date: "2026-10-12", time: "10:00", status: "free" },
    { officerId: "OFF-002", date: "2026-10-12", time: "11:30", status: "free" },
    { officerId: "OFF-002", date: "2026-10-12", time: "14:30", status: "free" },
    { officerId: "OFF-002", date: "2026-10-12", time: "16:00", status: "free" },
    { officerId: "OFF-002", date: "2026-10-13", time: "10:00", status: "free" },
    { officerId: "OFF-002", date: "2026-10-13", time: "11:30", status: "free" },
    { officerId: "OFF-002", date: "2026-10-13", time: "14:30", status: "free" },
    { officerId: "OFF-002", date: "2026-10-13", time: "16:00", status: "free" },
    { officerId: "OFF-002", date: "2026-10-14", time: "10:00", status: "free" },
    { officerId: "OFF-002", date: "2026-10-14", time: "11:30", status: "free" },
    { officerId: "OFF-002", date: "2026-10-14", time: "14:30", status: "free" },
    { officerId: "OFF-002", date: "2026-10-14", time: "16:00", status: "free" },
    { officerId: "OFF-002", date: "2026-10-15", time: "10:00", status: "free" },
    { officerId: "OFF-002", date: "2026-10-15", time: "11:30", status: "free" },
    { officerId: "OFF-002", date: "2026-10-15", time: "14:30", status: "free" },
    { officerId: "OFF-002", date: "2026-10-15", time: "16:00", status: "free" },
    { officerId: "OFF-002", date: "2026-10-16", time: "10:00", status: "blocked" },
    { officerId: "OFF-002", date: "2026-10-16", time: "11:30", status: "free" },
    { officerId: "OFF-002", date: "2026-10-16", time: "14:30", status: "free" },
    { officerId: "OFF-002", date: "2026-10-16", time: "16:00", status: "free" }
  ],

  // ---------------------------------------------------------------- knowledge items (O6 review workflow)
  knowledgeItems: [
    // From the brief, extended
    { id: "FAQ-12", kind: "faq", title: "Nisab 2026", version: 3, status: "shariah_review", owner: "OFF-001",
      body: "Nisab zakat bagi tahun 2026 ialah RM 24,000 (demo). Jika harta atau pendapatan bersih anda melebihi nisab, zakat dikira pada kadar 2.5%. Nilai nisab mengikut harga emas yang diumumkan oleh Pusat Zakat.",
      approver: null, approvedAt: null, publishedAt: null,
      previousBody: "Nisab zakat bagi tahun 2025 ialah RM 22,000 (demo). Jika harta atau pendapatan bersih anda melebihi nisab, zakat dikira pada kadar 2.5%.",
      submittedAt: "2026-10-09T09:41",
      history: [ { status: "draft", by: "OFF-001", at: "2026-10-08T16:00" }, { status: "shariah_review", by: "OFF-001", at: "2026-10-09T09:41" } ] },
    { id: "FAQ-07", kind: "faq", title: "Cara bayar di Portal Bayaran", version: 2, status: "published", owner: "OFF-002",
      body: "Tekan butang Bayar di Portal selepas semakan. Portal Bayaran Rasmi akan dibuka dalam tab baharu dengan nombor rujukan anda. Selepas bayaran, resit rasmi akan disalin ke Peti Resit secara automatik.",
      approver: "OFF-003", approvedAt: "2026-05-04", publishedAt: "2026-05-05",
      previousBody: "Bayaran dibuat di Portal Bayaran Rasmi. Simpan resit anda untuk rujukan.",
      submittedAt: "2026-05-02T10:00",
      history: [ { status: "draft", by: "OFF-002", at: "2026-05-01T09:00" }, { status: "shariah_review", by: "OFF-002", at: "2026-05-02T10:00" }, { status: "approved", by: "OFF-003", at: "2026-05-04T11:30" }, { status: "published", by: "OFF-004", at: "2026-05-05T09:00" } ] },
    { id: "TPL-RUNCIT", kind: "template", title: "Templat Runcit v3", version: 3, status: "approved", owner: "OFF-001",
      body: "Templat untuk kedai runcit menggunakan kaedah modal kerja. Aset semasa termasuk stok, wang tunai, hutang pelanggan dan bayaran pendahuluan. Liabiliti semasa ditolak sebelum kadar 2.5% dikenakan.",
      approver: "OFF-003", approvedAt: "2026-10-06", publishedAt: null,
      previousBody: "Templat untuk kedai runcit menggunakan kaedah modal kerja. Aset semasa termasuk stok, wang tunai dan hutang pelanggan.",
      submittedAt: "2026-10-02T14:00",
      history: [ { status: "draft", by: "OFF-001", at: "2026-10-01T10:00" }, { status: "shariah_review", by: "OFF-001", at: "2026-10-02T14:00" }, { status: "approved", by: "OFF-003", at: "2026-10-06T15:20" } ] },
    { id: "TPL-FNB", kind: "template", title: "Templat F&B v2", version: 2, status: "published", owner: "OFF-001",
      body: "Templat untuk perniagaan makanan dan minuman menggunakan kaedah modal kerja. Stok bahan mentah, wang tunai dan hutang pelanggan katering dikira sebagai aset semasa. Hutang pembekal ditolak sebagai liabiliti.",
      approver: "OFF-003", approvedAt: "2026-06-18", publishedAt: "2026-06-20",
      previousBody: "Templat untuk perniagaan makanan dan minuman menggunakan kaedah modal kerja.",
      submittedAt: "2026-06-15T09:30",
      history: [ { status: "draft", by: "OFF-001", at: "2026-06-12T11:00" }, { status: "shariah_review", by: "OFF-001", at: "2026-06-15T09:30" }, { status: "approved", by: "OFF-003", at: "2026-06-18T10:10" }, { status: "published", by: "OFF-004", at: "2026-06-20T09:00" } ] },
    { id: "STO-021", kind: "story", title: "Pelajar dari kampung", version: 1, status: "shariah_review", owner: "OFF-002",
      body: "Seorang pelajar dari kampung menerima bantuan yuran dan peralatan belajar. Kini dia menamatkan semester pertama di institusi pengajian tinggi dengan keputusan baik.",
      approver: null, approvedAt: null, publishedAt: null, previousBody: null,
      submittedAt: "2026-10-07T11:00",
      history: [ { status: "draft", by: "OFF-002", at: "2026-10-05T14:00" }, { status: "shariah_review", by: "OFF-002", at: "2026-10-07T11:00" } ] },
    { id: "KIT-HR-01", kind: "hr_kit", title: "Taklimat HR", version: 1, status: "draft", owner: "OFF-001",
      body: "Taklimat ringkas untuk pegawai HR tentang Skim Potongan Gaji. Merangkumi cara pendaftaran pekerja, persetujuan, fail CSV bulanan dan pengesahan oleh Pusat Zakat.",
      approver: null, approvedAt: null, publishedAt: null, previousBody: null, submittedAt: null,
      history: [ { status: "draft", by: "OFF-001", at: "2026-10-03T10:00" } ] },

    // Added published FAQs
    { id: "FAQ-03", kind: "faq", title: "Borang bantuan pelajar", version: 1, status: "published", owner: "OFF-002",
      body: "Borang bantuan pelajar boleh dimuat turun di laman Pusat Zakat atau diambil di kaunter daerah. Sertakan salinan keputusan peperiksaan dan surat tawaran. Permohonan disemak dalam masa 14 hari bekerja.",
      approver: "OFF-003", approvedAt: "2026-02-10", publishedAt: "2026-02-12", previousBody: null, submittedAt: "2026-02-06T10:00",
      history: [ { status: "draft", by: "OFF-002", at: "2026-02-05T09:00" }, { status: "shariah_review", by: "OFF-002", at: "2026-02-06T10:00" }, { status: "approved", by: "OFF-003", at: "2026-02-10T11:00" }, { status: "published", by: "OFF-004", at: "2026-02-12T09:00" } ] },
    { id: "FAQ-05", kind: "faq", title: "Hubungi pegawai zakat", version: 1, status: "published", owner: "OFF-001",
      body: "Anda boleh berbincang dengan pegawai zakat melalui butang Hubungi pegawai dalam aplikasi. Pegawai akan membalas dalam masa dua hari bekerja. Untuk perniagaan, anda juga boleh menempah temu janji.",
      approver: "OFF-003", approvedAt: "2026-03-03", publishedAt: "2026-03-04", previousBody: null, submittedAt: "2026-03-01T15:00",
      history: [ { status: "draft", by: "OFF-001", at: "2026-02-28T10:00" }, { status: "shariah_review", by: "OFF-001", at: "2026-03-01T15:00" }, { status: "approved", by: "OFF-003", at: "2026-03-03T10:30" }, { status: "published", by: "OFF-004", at: "2026-03-04T09:00" } ] },
    { id: "FAQ-09", kind: "faq", title: "Cara pengiraan zakat pendapatan", version: 2, status: "published", owner: "OFF-001",
      body: "Zakat pendapatan dikira daripada pendapatan tahunan tolak tolakan yang dibenarkan. Jika baki melebihi nisab, zakat ialah 2.5% daripada baki itu. Contoh: pendapatan RM 60,000 tanpa tolakan, zakat RM 1,500.",
      approver: "OFF-003", approvedAt: "2026-04-14", publishedAt: "2026-04-15",
      previousBody: "Zakat pendapatan ialah 2.5% daripada pendapatan tahunan yang melebihi nisab.",
      submittedAt: "2026-04-10T09:00",
      history: [ { status: "draft", by: "OFF-001", at: "2026-04-09T10:00" }, { status: "shariah_review", by: "OFF-001", at: "2026-04-10T09:00" }, { status: "approved", by: "OFF-003", at: "2026-04-14T14:00" }, { status: "published", by: "OFF-004", at: "2026-04-15T09:00" } ] },
    { id: "FAQ-10", kind: "faq", title: "Cara pengiraan zakat simpanan", version: 1, status: "published", owner: "OFF-001",
      body: "Zakat simpanan dikira daripada baki terendah dalam akaun sepanjang setahun. Jika baki itu melebihi nisab, zakat ialah 2.5% daripadanya.",
      approver: "OFF-003", approvedAt: "2026-04-14", publishedAt: "2026-04-15", previousBody: null, submittedAt: "2026-04-10T09:10",
      history: [ { status: "draft", by: "OFF-001", at: "2026-04-09T10:10" }, { status: "shariah_review", by: "OFF-001", at: "2026-04-10T09:10" }, { status: "approved", by: "OFF-003", at: "2026-04-14T14:05" }, { status: "published", by: "OFF-004", at: "2026-04-15T09:05" } ] },
    { id: "FAQ-11", kind: "faq", title: "Cara pengiraan zakat emas", version: 1, status: "published", owner: "OFF-001",
      body: "Zakat emas dikira daripada berat emas simpanan yang tidak dipakai, didarab harga semasa segram. Jika nilai itu melebihi nisab, zakat ialah 2.5% daripadanya.",
      approver: "OFF-003", approvedAt: "2026-04-14", publishedAt: "2026-04-15", previousBody: null, submittedAt: "2026-04-10T09:20",
      history: [ { status: "draft", by: "OFF-001", at: "2026-04-09T10:20" }, { status: "shariah_review", by: "OFF-001", at: "2026-04-10T09:20" }, { status: "approved", by: "OFF-003", at: "2026-04-14T14:10" }, { status: "published", by: "OFF-004", at: "2026-04-15T09:10" } ] },
    { id: "FAQ-13", kind: "faq", title: "Cara pengiraan zakat KWSP", version: 1, status: "published", owner: "OFF-002",
      body: "Zakat KWSP dikira daripada jumlah yang dikeluarkan dalam tahun semasa. Jika jumlah itu melebihi nisab, zakat ialah 2.5% daripadanya.",
      approver: "OFF-003", approvedAt: "2026-04-14", publishedAt: "2026-04-15", previousBody: null, submittedAt: "2026-04-10T09:30",
      history: [ { status: "draft", by: "OFF-002", at: "2026-04-09T10:30" }, { status: "shariah_review", by: "OFF-002", at: "2026-04-10T09:30" }, { status: "approved", by: "OFF-003", at: "2026-04-14T14:15" }, { status: "published", by: "OFF-004", at: "2026-04-15T09:15" } ] },
    { id: "FAQ-14", kind: "faq", title: "Cara pengiraan zakat saham dan ASB", version: 1, status: "published", owner: "OFF-002",
      body: "Zakat saham dan unit amanah dikira daripada nilai pada hujung tahun. Jika jumlah nilai melebihi nisab, zakat ialah 2.5% daripadanya.",
      approver: "OFF-003", approvedAt: "2026-04-14", publishedAt: "2026-04-15", previousBody: null, submittedAt: "2026-04-10T09:40",
      history: [ { status: "draft", by: "OFF-002", at: "2026-04-09T10:40" }, { status: "shariah_review", by: "OFF-002", at: "2026-04-10T09:40" }, { status: "approved", by: "OFF-003", at: "2026-04-14T14:20" }, { status: "published", by: "OFF-004", at: "2026-04-15T09:20" } ] },

    // Added published stories (P1 needs three cards)
    { id: "STO-018", kind: "story", title: "Langkah pertama ke menara gading", version: 1, status: "published", owner: "OFF-002",
      body: "Seorang pelajar dari keluarga berpendapatan rendah menerima bantuan yuran pengajian. Dia kini di tahun kedua pengajian kejuruteraan.",
      approver: "OFF-003", approvedAt: "2026-07-08", publishedAt: "2026-07-10", previousBody: null, submittedAt: "2026-07-03T10:00",
      history: [ { status: "draft", by: "OFF-002", at: "2026-07-01T09:00" }, { status: "shariah_review", by: "OFF-002", at: "2026-07-03T10:00" }, { status: "approved", by: "OFF-003", at: "2026-07-08T11:00" }, { status: "published", by: "OFF-004", at: "2026-07-10T09:00" } ] },
    { id: "STO-019", kind: "story", title: "Rawatan yang tidak lagi tertangguh", version: 1, status: "published", owner: "OFF-001",
      body: "Seorang ibu tunggal menerima bantuan kos rawatan dialisis. Rawatan kini berjalan tiga kali seminggu tanpa gangguan.",
      approver: "OFF-003", approvedAt: "2026-08-12", publishedAt: "2026-08-14", previousBody: null, submittedAt: "2026-08-06T10:00",
      history: [ { status: "draft", by: "OFF-001", at: "2026-08-04T09:00" }, { status: "shariah_review", by: "OFF-001", at: "2026-08-06T10:00" }, { status: "approved", by: "OFF-003", at: "2026-08-12T11:00" }, { status: "published", by: "OFF-004", at: "2026-08-14T09:00" } ] },
    { id: "STO-020", kind: "story", title: "Gerai kecil, harapan besar", version: 1, status: "published", owner: "OFF-001",
      body: "Seorang usahawan kecil menerima modal dan bimbingan untuk membuka gerai makanan. Dalam enam bulan, gerai itu menampung keperluan keluarganya.",
      approver: "OFF-003", approvedAt: "2026-09-16", publishedAt: "2026-09-18", previousBody: null, submittedAt: "2026-09-10T10:00",
      history: [ { status: "draft", by: "OFF-001", at: "2026-09-08T09:00" }, { status: "shariah_review", by: "OFF-001", at: "2026-09-10T10:00" }, { status: "approved", by: "OFF-003", at: "2026-09-16T11:00" }, { status: "published", by: "OFF-004", at: "2026-09-18T09:00" } ] },

    // Added published HR kit items (E3)
    { id: "KIT-HR-02", kind: "hr_kit", title: "Templat e-mel pekerja", version: 1, status: "published", owner: "OFF-001",
      body: "Templat e-mel untuk memaklumkan pekerja tentang Skim Potongan Gaji. Mengandungi pautan pendaftaran dan penerangan ringkas tentang persetujuan.",
      approver: "OFF-003", approvedAt: "2026-06-10", publishedAt: "2026-06-11", previousBody: null, submittedAt: "2026-06-05T10:00",
      history: [ { status: "draft", by: "OFF-001", at: "2026-06-03T09:00" }, { status: "shariah_review", by: "OFF-001", at: "2026-06-05T10:00" }, { status: "approved", by: "OFF-003", at: "2026-06-10T11:00" }, { status: "published", by: "OFF-004", at: "2026-06-11T09:00" } ] },
    { id: "KIT-HR-03", kind: "hr_kit", title: "Borang persetujuan", version: 1, status: "published", owner: "OFF-001",
      body: "Borang persetujuan pekerja untuk potongan gaji dan perkongsian data dengan majikan. Pekerja boleh menghentikan potongan pada bila-bila masa.",
      approver: "OFF-003", approvedAt: "2026-06-10", publishedAt: "2026-06-11", previousBody: null, submittedAt: "2026-06-05T10:10",
      history: [ { status: "draft", by: "OFF-001", at: "2026-06-03T09:10" }, { status: "shariah_review", by: "OFF-001", at: "2026-06-05T10:10" }, { status: "approved", by: "OFF-003", at: "2026-06-10T11:05" }, { status: "published", by: "OFF-004", at: "2026-06-11T09:05" } ] },
    { id: "KIT-HR-04", kind: "hr_kit", title: "Soalan lazim HR", version: 1, status: "published", owner: "OFF-002",
      body: "Jawapan kepada soalan biasa daripada pegawai HR, termasuk tarikh fail, format CSV dan cara membetulkan potongan yang gagal.",
      approver: "OFF-003", approvedAt: "2026-06-10", publishedAt: "2026-06-11", previousBody: null, submittedAt: "2026-06-05T10:20",
      history: [ { status: "draft", by: "OFF-002", at: "2026-06-03T09:20" }, { status: "shariah_review", by: "OFF-002", at: "2026-06-05T10:20" }, { status: "approved", by: "OFF-003", at: "2026-06-10T11:10" }, { status: "published", by: "OFF-004", at: "2026-06-11T09:10" } ] },
    { id: "KIT-HR-05", kind: "hr_kit", title: "Poster", version: 1, status: "published", owner: "OFF-002",
      body: "Poster untuk papan kenyataan pejabat. Menerangkan Skim Potongan Gaji dalam tiga langkah mudah dengan kod QR ke halaman pendaftaran.",
      approver: "OFF-003", approvedAt: "2026-06-10", publishedAt: "2026-06-11", previousBody: null, submittedAt: "2026-06-05T10:30",
      history: [ { status: "draft", by: "OFF-002", at: "2026-06-03T09:30" }, { status: "shariah_review", by: "OFF-002", at: "2026-06-05T10:30" }, { status: "approved", by: "OFF-003", at: "2026-06-10T11:15" }, { status: "published", by: "OFF-004", at: "2026-06-11T09:15" } ] },

    // Added published SME templates mirroring smeTemplates
    { id: "TPL-ONLINE", kind: "template", title: "Templat Penjual online v1", version: 1, status: "published", owner: "OFF-002",
      body: "Templat untuk penjual online menggunakan kaedah modal kerja. Inventori, baki dompet platform dan bayaran platform belum diterima dikira sebagai aset semasa. Yuran platform dan hutang pembekal ditolak.",
      approver: "OFF-003", approvedAt: "2026-07-20", publishedAt: "2026-07-22", previousBody: null, submittedAt: "2026-07-15T10:00",
      history: [ { status: "draft", by: "OFF-002", at: "2026-07-13T09:00" }, { status: "shariah_review", by: "OFF-002", at: "2026-07-15T10:00" }, { status: "approved", by: "OFF-003", at: "2026-07-20T11:00" }, { status: "published", by: "OFF-004", at: "2026-07-22T09:00" } ] },
    { id: "TPL-PROF", kind: "template", title: "Templat Perkhidmatan profesional v1", version: 1, status: "published", owner: "OFF-002",
      body: "Templat untuk firma perkhidmatan profesional menggunakan kaedah modal kerja. Yuran belum dibayar dan kerja belum dibil dikira sebagai aset. Yuran pendahuluan yang diterima ditolak sebagai liabiliti.",
      approver: "OFF-003", approvedAt: "2026-07-20", publishedAt: "2026-07-22", previousBody: null, submittedAt: "2026-07-15T10:10",
      history: [ { status: "draft", by: "OFF-002", at: "2026-07-13T09:10" }, { status: "shariah_review", by: "OFF-002", at: "2026-07-15T10:10" }, { status: "approved", by: "OFF-003", at: "2026-07-20T11:05" }, { status: "published", by: "OFF-004", at: "2026-07-22T09:05" } ] }
  ],

  // ---------------------------------------------------------------- impact stories (P1, P2, P3)
  stories: [
    { knowledgeId: "STO-018", title: "Langkah pertama ke menara gading", district: "Utara", program: "pelajar", year: 2026, illustration: "🎓",
      paragraphs: [
        "Dia anak sulung daripada lima beradik. Bapanya bekerja sebagai buruh harian dan pendapatan keluarga tidak menentu.",
        "Apabila tawaran ke universiti tiba, yuran pendaftaran menjadi halangan pertama. Keluarganya hampir menolak tawaran itu.",
        "Bantuan pelajar daripada dana zakat menampung yuran, buku dan komputer riba terpakai.",
        "Kini dia di tahun kedua pengajian kejuruteraan dan menjadi tutor sukarela untuk adik-adik di kampungnya."
      ] },
    { knowledgeId: "STO-019", title: "Rawatan yang tidak lagi tertangguh", district: "Selatan", program: "perubatan", year: 2026, illustration: "🏥",
      paragraphs: [
        "Seorang ibu tunggal disahkan perlu menjalani rawatan dialisis tiga kali seminggu.",
        "Kos rawatan dan pengangkutan melebihi pendapatannya sebagai pembantu kedai.",
        "Bantuan perubatan menampung kos rawatan selama setahun, termasuk tambang ke pusat rawatan.",
        "Rawatannya kini berjalan tanpa tertangguh dan dia dapat terus bekerja separuh masa."
      ] },
    { knowledgeId: "STO-020", title: "Gerai kecil, harapan besar", district: "Tengah", program: "usahawan", year: 2026, illustration: "🛒",
      paragraphs: [
        "Selepas kehilangan kerja, seorang bapa mahu memulakan perniagaan makanan kecil.",
        "Bantuan usahawan memberikan modal peralatan dan bimbingan asas pengurusan wang.",
        "Dalam enam bulan, gerainya mempunyai pelanggan tetap dan pendapatan yang stabil.",
        "Dia kini menyimpan sebahagian keuntungan dan merancang untuk menggaji seorang pembantu."
      ] },
    { knowledgeId: "STO-021", title: "Pelajar dari kampung", district: "Timur", program: "pelajar", year: 2026, illustration: "🌱",
      paragraphs: [
        "Seorang pelajar dari kampung pedalaman berjaya mendapat tempat di institusi pengajian tinggi.",
        "Keluarganya tidak mampu menyediakan yuran dan peralatan belajar.",
        "Bantuan pelajar menampung keperluan semester pertama, termasuk tempat tinggal.",
        "Dia menamatkan semester pertama dengan keputusan baik dan menerima biasiswa prestasi."
      ] }
  ],

  // ---------------------------------------------------------------- assistant (Y10, O5)
  faqAnswers: [
    { intents: ["nisab", "nisab 2026", "berapa nisab"], knowledgeId: "FAQ-12",
      answer: "Nisab zakat tahun 2026 ialah RM 24,000 (demo). Jika harta atau pendapatan bersih anda melebihi nisab, zakat dikira pada kadar 2.5%." },
    { intents: ["cara bayar", "bayar", "portal", "macam mana bayar"], knowledgeId: "FAQ-07",
      answer: "Selepas mengira, tekan Bayar di Portal. Portal Bayaran Rasmi akan dibuka dalam tab baharu. Resit rasmi akan masuk ke Peti Resit anda secara automatik." },
    { intents: ["borang bantuan", "borang", "bantuan pelajar", "mohon bantuan"], knowledgeId: "FAQ-03",
      answer: "Borang bantuan pelajar boleh dimuat turun di laman Pusat Zakat atau diambil di kaunter daerah. Sertakan keputusan peperiksaan dan surat tawaran." },
    { intents: ["pegawai", "hubungi", "nak cakap"], knowledgeId: "FAQ-05",
      answer: "Tekan Hubungi pegawai di bawah. Pegawai zakat akan membalas dalam masa dua hari bekerja melalui saluran yang anda gunakan." },
    { intents: ["kira pendapatan", "zakat pendapatan", "pendapatan"], knowledgeId: "FAQ-09",
      answer: "Zakat pendapatan ialah 2.5% daripada pendapatan tahunan tolak tolakan dibenarkan, jika melebihi nisab. Contoh: RM 60,000 tanpa tolakan, zakat RM 1,500." }
  ],
  assistantIntro: "Salam. Saya Pembantu Zakat. Saya boleh bantu anda mengira zakat dan mencari halaman atau borang yang betul. Soalan hukum akan saya hantar kepada pegawai.",
  assistantFixedText: "Panduan, bukan fatwa",
  sensitiveKeywords: ["hukum", "fatwa", "haram", "halal", "wajib ke", "boleh tolak", "pampasan", "hutang"],
  escalationReasons: { low_confidence: "keyakinan rendah", sensitive: "sensitif", ruling_request: "permintaan hukum", user_requested: "pengguna minta pegawai" },

  escalations: [
    { id: "ESK-118", question: "zakat untuk wang pampasan?", reason: "low_confidence", channel: "whatsapp", status: "new", at: "2026-10-09T09:50",
      conversation: [
        { role: "user", text: "Saya dapat wang pampasan berhenti kerja. Kena zakat ke?" },
        { role: "assistant", text: "Soalan ini perlu dijawab oleh pegawai. Saya sudah hantar kepada pegawai zakat." }
      ],
      answer: null, answeredBy: null, answeredAt: null },
    { id: "ESK-117", question: "boleh tolak hutang kereta?", reason: "sensitive", channel: "portal", payerId: "PAY-001", status: "new", at: "2026-10-09T09:12",
      conversation: [
        { role: "user", text: "Saya kira zakat pendapatan. Boleh tolak hutang kereta?" },
        { role: "assistant", text: "Soalan tentang tolakan hutang perlu disemak oleh pegawai. Saya sudah hantar soalan anda." },
        { role: "user", text: "Baik, terima kasih." }
      ],
      answer: null, answeredBy: null, answeredAt: null },
    { id: "ESK-116", question: "hukum zakat saham tak dijual?", reason: "ruling_request", channel: "portal", payerId: "PAY-004", status: "answered", at: "2026-10-08T15:20",
      conversation: [
        { role: "user", text: "Apa hukum zakat untuk saham yang saya tak jual?" },
        { role: "assistant", text: "Saya tidak boleh memberi hukum. Soalan anda dihantar kepada pegawai." }
      ],
      answer: "Mengikut kaedah rasmi Pusat Zakat, saham yang dipegang dikira mengikut nilai pasaran pada hujung tahun. Anda boleh guna kalkulator Saham / ASB.",
      answeredBy: "OFF-001", answeredAt: "2026-10-08T16:40" },
    { id: "ESK-115", question: "nak cakap dengan pegawai", reason: "user_requested", channel: "portal", payerId: "PAY-008", status: "closed", at: "2026-10-07T11:02",
      conversation: [
        { role: "user", text: "Saya nak cakap dengan pegawai." },
        { role: "assistant", text: "Baik. Permintaan anda dihantar kepada pegawai zakat." }
      ],
      answer: "Pegawai telah menghubungi anda melalui telefon pada 7 Okt. Kes ini ditutup.",
      answeredBy: "OFF-001", answeredAt: "2026-10-07T15:30" },
    { id: "ESK-114", question: "borang bantuan pelajar di mana?", reason: "low_confidence", channel: "whatsapp", status: "closed", at: "2026-10-06T08:45",
      conversation: [
        { role: "user", text: "Borang bantuan pelajar di mana?" },
        { role: "assistant", text: "Saya kurang pasti. Soalan anda dihantar kepada pegawai." }
      ],
      answer: "Borang bantuan pelajar boleh dimuat turun di laman Pusat Zakat atau diambil di kaunter daerah.",
      answeredBy: "OFF-002", answeredAt: "2026-10-06T10:15" }
  ],

  // ---------------------------------------------------------------- published impact snapshots (P2, O7)
  snapshots: [
    { id: "SNAP-2026-09", period: "2026-09", status: "published", publishedAt: "2026-10-02", publishedBy: "OFF-004", threshold: 20,
      kpi: { collection: 1850000, distribution: 1620000, asnafSupported: 1240, repeatPayers: 0.61 },
      byDistrict: { Timur: 640000, Barat: 410000, Utara: 300000, Tengah: 310000, Selatan: 190000 },
      byProgram: { pelajar: 520000, perubatan: 380000, usahawan: 290000, lain: 430000 },
      hiddenCells: [],
      generatedBy: "OFF-001", generatedAt: "2026-10-01T16:20", approvedBy: "OFF-004", approvedAt: "2026-10-02T09:12",
      // Oct 2025 .. Sep 2026
      trend: [1550000, 1600000, 1880000, 1420000, 1450000, 1690000, 1760000, 1530000, 1580000, 1650000, 1710000, 1850000],
      supersedes: null },
    { id: "SNAP-2026-08", period: "2026-08", status: "published", publishedAt: "2026-09-02", publishedBy: "OFF-004", threshold: 20,
      kpi: { collection: 1710000, distribution: 1500000, asnafSupported: 1180, repeatPayers: 0.58 },
      byDistrict: { Timur: 600000, Barat: 380000, Utara: 280000, Tengah: 290000, Selatan: 160000 },
      byProgram: { pelajar: 480000, perubatan: 350000, usahawan: 270000, lain: 400000 },
      hiddenCells: ["Selatan/usahawan"],
      generatedBy: "OFF-001", generatedAt: "2026-09-01T15:40", approvedBy: "OFF-004", approvedAt: "2026-09-02T09:05",
      // Sep 2025 .. Aug 2026
      trend: [1480000, 1550000, 1600000, 1880000, 1420000, 1450000, 1690000, 1760000, 1530000, 1580000, 1650000, 1710000],
      supersedes: null },
    { id: "SNAP-2026-07", period: "2026-07", status: "published", publishedAt: "2026-08-02", publishedBy: "OFF-004", threshold: 20,
      kpi: { collection: 1650000, distribution: 1450000, asnafSupported: 1130, repeatPayers: 0.56 },
      byDistrict: { Timur: 575000, Barat: 365000, Utara: 270000, Tengah: 285000, Selatan: 155000 },
      byProgram: { pelajar: 460000, perubatan: 340000, usahawan: 260000, lain: 390000 },
      hiddenCells: [],
      generatedBy: "OFF-001", generatedAt: "2026-08-01T15:30", approvedBy: "OFF-004", approvedAt: "2026-08-02T09:10",
      // Aug 2025 .. Jul 2026
      trend: [1520000, 1480000, 1550000, 1600000, 1880000, 1420000, 1450000, 1690000, 1760000, 1530000, 1580000, 1650000],
      supersedes: null }
  ],

  // ---------------------------------------------------------------- admin settings (O10)
  settings: {
    privacyThreshold: 20,
    whatsappSender: "+60 4-000 0000 (demo)",
    aiProvider: "adapter-demo",
    gateways: { identity: "stub", collection: "stub", paymentNavigation: "stub", payroll: "stub", officerDirectory: "stub", messaging: "stub", assistant: "stub" },
    roles: [
      { role: "public", label: "Awam", canDo: ["Baca halaman awam P1 hingga P3"], cannot: ["Lihat sebarang rekod peribadi"] },
      { role: "payer", label: "Pembayar", canDo: ["Guna Y1 hingga Y11"], cannot: ["Lihat rekod pembayar lain", "Lihat kandungan belum diterbitkan"] },
      { role: "sme_owner", label: "Pemilik PKS", canDo: ["Hak pembayar", "Guna S1 hingga S6"], cannot: ["Meluluskan apa-apa"] },
      { role: "employer_hr", label: "HR Majikan", canDo: ["Guna E1 hingga E7 untuk majikan sendiri"], cannot: ["Lihat rekod pembayar di luar senarai pendaftaran"] },
      { role: "officer", label: "Pegawai Zakat", canDo: ["Guna O1 hingga O5 dan O8", "Baca O9"], cannot: ["Meluluskan kandungan Syariah", "Menerbitkan snapshot"] },
      { role: "shariah_reviewer", label: "Penyemak Syariah", canDo: ["Guna O6", "Baca O9"], cannot: ["Mengendalikan kes", "Menerbitkan snapshot"] },
      { role: "admin", label: "Pentadbir", canDo: ["Terbit snapshot di O7", "Guna O10", "Baca semua"], cannot: ["Mengubah log audit (tiada sesiapa boleh)"] }
    ]
  },

  // ---------------------------------------------------------------- append-only audit log (O9), newest first
  audit: [
    { id: "AUD-0001", at: "2026-10-09T09:50", actorId: "SYSTEM", actor: "Sistem", entity: "escalation", entityId: "ESK-118", action: "created", hash: "a3f91c07", correlationId: "COR-7118" },
    { id: "AUD-0002", at: "2026-10-09T09:41", actorId: "OFF-001", actor: "Pn. Aminah", entity: "knowledge", entityId: "FAQ-12", action: "submitted_for_review", hash: "5be20d94", correlationId: "COR-6012" },
    { id: "AUD-0003", at: "2026-10-09T09:12", actorId: "SYSTEM", actor: "Sistem", entity: "escalation", entityId: "ESK-117", action: "created", hash: "c7d4e811", correlationId: "COR-7117" },
    { id: "AUD-0004", at: "2026-10-09T08:05", actorId: "PAY-001", actor: "Ahmad bin Ali", entity: "consent", entityId: "CON-001", action: "granted", hash: "19ab6f3e", correlationId: "COR-5001" },
    { id: "AUD-0005", at: "2026-10-08T16:40", actorId: "OFF-001", actor: "Pn. Aminah", entity: "escalation", entityId: "ESK-116", action: "answered", hash: "e04c7a52", correlationId: "COR-7116" },
    { id: "AUD-0006", at: "2026-10-08T14:05", actorId: "OFF-004", actor: "Admin", entity: "sme_case", entityId: "KES-0041", action: "assigned", hash: "7d13b9c8", correlationId: "COR-4041" },
    { id: "AUD-0007", at: "2026-10-07T16:40", actorId: "OFF-002", actor: "En. Razak", entity: "sme_case", entityId: "KES-0039", action: "verified", hash: "2f8e0a61", correlationId: "COR-4039" },
    { id: "AUD-0008", at: "2026-10-02T09:12", actorId: "OFF-004", actor: "Admin", entity: "snapshot", entityId: "SNAP-2026-09", action: "published", hash: "b6519d2f", correlationId: "COR-8209" },
    { id: "AUD-0009", at: "2026-10-01T20:15", actorId: "PAY-001", actor: "Ahmad bin Ali", entity: "calculation", entityId: "CALC-001", action: "created", hash: "4ac08e73", correlationId: "COR-3001" },
    { id: "AUD-0010", at: "2026-10-01T16:20", actorId: "OFF-001", actor: "Pn. Aminah", entity: "snapshot", entityId: "SNAP-2026-09", action: "generated", hash: "90fd23b4", correlationId: "COR-8209" },
    { id: "AUD-0011", at: "2026-09-30T09:00", actorId: "SYSTEM", actor: "Sistem", entity: "deduction_run", entityId: "RUN-2026-09", action: "acknowledged", hash: "d25e6c10", correlationId: "COR-9209" },
    { id: "AUD-0012", at: "2026-09-25T10:05", actorId: "EMP-001", actor: "En. Shamsul Bahri", entity: "deduction_run", entityId: "RUN-2026-09", action: "sent", hash: "6e7f14a9", correlationId: "COR-9209" },
    { id: "AUD-0013", at: "2026-09-12T20:48", actorId: "PAY-001", actor: "Ahmad bin Ali", entity: "receipt", entityId: "R-2026-0912", action: "receipt_returned", hash: "f1c3b85d", correlationId: "COR-3912" },
    { id: "AUD-0014", at: "2026-09-12T20:41", actorId: "PAY-001", actor: "Ahmad bin Ali", entity: "payment_reference", entityId: "REF-2026-0912-001", action: "hand_off", hash: "08b7d6e2", correlationId: "COR-3912" },
    { id: "AUD-0015", at: "2026-07-22T11:00", actorId: "EMP-001", actor: "Pn. Rohana Idris", entity: "enrolment", entityId: "ENR-001", action: "confirmed", hash: "3d9a5f47", correlationId: "COR-2001" },
    { id: "AUD-0016", at: "2026-06-30T15:00", actorId: "OFF-001", actor: "Pn. Aminah", entity: "employer", entityId: "EMP-001", action: "approved_employer", hash: "a81e2c6b", correlationId: "COR-1001" }
  ]
};
