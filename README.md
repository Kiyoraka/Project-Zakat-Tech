# ZakatTech 360 — clickable prototype

Prototype version: 0.1 (October 2026)

A digital engagement and intelligence layer placed on top of an existing state zakat authority ("Pusat Zakat"). It helps people and businesses calculate, understand, pay and keep paying zakat through official channels, and shows the public where the money goes. Tagline: **Mudah Bayar, Jelas Manfaat.**

This folder holds two things:

| Path | What it is |
|------|------------|
| `DESIGN-BRIEF.md` | The design handoff: product summary, eight non-negotiables, 37 views with ASCII wireframes, tokens, data model, seed data, behaviour rules, folder architecture for the real build |
| `prototype/` | A hardcoded, clickable prototype of all 37 views in plain HTML + CSS + JS — no framework, no build step, no network calls |

## Run the prototype

Open `prototype/index.html` in a browser. Everything works from `file://`.

Some browser extensions refuse `file://` pages; a one-line static server works too:

```
cd prototype
python -m http.server 8090
# then open http://127.0.0.1:8090/index.html
```

`prototype/preview.html` shows a 390 px phone frame and a 1366 px desktop frame side by side (a developer aid, not part of the product).

## Demo accounts

Roles come from the account picker on `index.html` (section 11 of the brief: there is no real login). Each account lands on its surface:

| Account | Role | Surface | Start |
|---------|------|---------|-------|
| Awam | public | `public.html` | Landing, Impak dashboard, story detail |
| Ahmad bin Ali | payer | `payer.html` | Masuk → OTP (demo code `123456`) → Utama |
| Aisyah Lim | sme_owner | `payer.html` | Zakat Perniagaan (SME mode) |
| HR Hospital Negeri | employer_hr (active) | `employer.html` | Dashboard Majikan |
| HR Kilang Elektronik | employer_hr (pending) | `employer.html` | Status card + Kit only |
| Pn. Aminah | officer | `officer.html` | Dashboard Pegawai |
| Ustaz Harun | shariah_reviewer | `officer.html` | Semakan Kandungan (and Audit) only |
| Admin | admin | `officer.html` | Everything, incl. Terbit and Tetapan |

The demo bar at the top right of every surface shows the current account and offers **Tukar akaun** and **Reset**.

## What works

- Calculators with a live estimate, saved estimates on the payer home, hand-off to the official payment portal (a placeholder page — the prototype never renders a card form) and the receipt returning to the vault through the same reference.
- Consent before reminders: nothing is pre-ticked, every grant is a new row, revoking takes effect immediately.
- Skim Potongan Gaji: the employee enrols and consents, HR confirms, the monthly run only contains rows with active consent, only the named approver can send it, corrections are new runs.
- The governed assistant: canned answers that each cite a published knowledge item; unpublished sources cannot be cited; sensitive or ruling-type questions are escalated to an officer inbox.
- Shariah review: draft → semakan Syariah → diluluskan → diterbit, with a diff against the previous published text. Only published content reaches the public pages, the calculators and the assistant.
- Impact snapshots: generated with a privacy threshold, submitted, and published by a different person (admin). The public dashboard reads published snapshots only.
- An append-only audit log that no role can edit or delete.

Demo state lives in this browser's `localStorage` (`zt360.demo.v1`) and survives a reload. **Reset demo** returns to the seed values.

## What is stubbed (section 11 of the brief)

- Payments, identity, collection data, payroll files, WhatsApp/SMS/e-mail and the AI provider are all adapters in *stub* mode (visible under Tetapan → Integrasi).
- Numbers are demo values from the brief, not official figures. Names are invented.
- PDF, CSV and share actions show a toast instead of producing a file.

## Prototype layout

```
prototype/
|- index.html              demo account picker
|- public.html             P1-P3           js/public.js
|- payer.html              Y1-Y11 + S1-S6  js/payer.js + js/sme.js
|- employer.html           E1-E7           js/employer.js
|- officer.html            O1-O10          js/officer-core.js + js/officer.js + js/officer-content.js
|- portal-bayaran.html     payment hand-off placeholder
|- preview.html            390 / 1366 px preview frames
|- css/                    tokens, base, components, shells (green and white, Islamic geometry)
|- js/seed-data.js         section 7 data + canned content
|- js/store.js             demo state, every mutation audited
|- js/components.js        UI helpers      js/router.js  hash router with role gate   js/format.js
```

The real build (Spring Boot 3 / Java 21 + Vue 3, MySQL 8 with five schema walls) follows section 9 of the brief.

Prepared by Kiyo Software Tech Lab.
