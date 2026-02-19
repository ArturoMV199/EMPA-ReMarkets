# CLAUDE.md

This file is read automatically by Claude Code at the start of every session.
It provides project context, EMPA methodology state, and decision history so Claude never starts from zero.

---

## What is this project?

**EMPA-ReMarkets** — Bid Intelligence Platform for REMarkets, built using the EMPA (Estimation Methodology Plus Assessments) framework. This is the first real project using EMPA.

Full methodology: `docs/methodology.md`
Claude instructions: `docs/claude-project-instructions.md`
Output formats: `docs/output-formats.md`
Quick start: `docs/quick-start.md`

---

## EMPA Phases

```
1. Discover  → project-charter.md              ✅ COMPLETE
2. Architect → architecture-decision-*.md       ✅ COMPLETE (2 options generated)
2B. Prototype → prototype/ folder               ✅ COMPLETE (6 screens)
3. Estimate  → estimation-*.md                  ✅ COMPLETE (2 options generated)
4. Execute   → weekly-status.md (per week)      ⏳ NOT STARTED
5. Reflect   → lessons-learned.md               ⏳ NOT STARTED
```

---

## Current Project State

**Status:** Active — Pre-Execution (Blazor leaning, awaiting final sign-off)
**Project Name:** EMPA-ReMarkets
**Client:** REMarkets
**Consulting Firm:** Simpat
**Current Phase:** Between Estimate and Execute — management leaning toward Blazor + .NET 10
**Last Updated:** 2026-02-19

### Decisions Made
- 2026-02-19: Charter completed — full scope, 14 stakeholders, 10 risks identified
- 2026-02-19: Two architecture options generated (React + .NET 10 vs Blazor + .NET 10)
- 2026-02-19: Prototype delivered — 6 screens (Login, Dashboard, Offers, Inventory, Allocations, Customers)
- 2026-02-19: Two estimations completed (one per architecture option)
- 2026-02-19: Azure environments confirmed — exist and available (reduced setup hours)
- 2026-02-19: Management leaning Blazor — awaiting final sign-off
- 2026-02-19: "Masquerade" renamed to "Act-on-Behalf" — clearer for non-technical stakeholders
- 2026-02-19: Act-on-Behalf + Split Allocations moved from Post-MVP to MVP (client-requested features)
- 2026-02-19: Grid library options documented — MudBlazor (MIT, free) recommended; Telerik/AG Grid as paid fallback
- 2026-02-19: All estimation items now labeled "Client-requested" vs "Suggested enhancement"
- 2026-02-19: Prototype data theme corrected — energy commodities → server components (RAM, CPUs, NVMe, NICs)
- 2026-02-19: Wrong transcript contamination cleaned from all docs (analytics workstream references removed)

### Pending Decisions

**1. Blazor vs React (leaning Blazor)**

| Metric | React + .NET 10 | Blazor + .NET 10 |
|--------|-----------------|-------------------|
| Total Hours (Auth Option A) | ~1,144 hrs | ~980 hrs |
| MVP Timeline (2 devs) | ~13 weeks | ~11 weeks |
| MVP Timeline (3 devs) | ~8.5 weeks | ~7 weeks |
| Learning Curve | ~100 hrs | ~56 hrs |
| In-cell editing (core feature) | ⭐⭐⭐⭐⭐ AG Grid | ⭐⭐⭐⭐ MudBlazor |
| Future customer portal | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Hiring future devs | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| CI/CD complexity | Medium (2 deploys) | Low (1 deploy) |

**2. Auth approach: Azure AD Groups vs Internal DB Roles**
- Option A (recommended): Use Azure AD Groups for role management — no user/role tables in app DB, role changes happen in Azure AD
- Option B: Internal DB Users + UserRoles tables with admin UI — +24 hrs, independent of Azure AD group config

**3. Grid library: MudBlazor free vs paid alternative (evaluate Sprint 0)**
- Start with MudBlazor DataGrid (MIT, $0) — evaluate if in-cell editing meets requirements
- Fallback: Telerik (~$1K/dev/yr) or AG Grid Blazor (~$1.1K/dev one-time)

### Key Context
- **Team:** 2 Fullstack .NET Developers (possible 3rd), new hires — skill levels TBD
- **Existing Dev:** Part-time support/advisor, familiar with Simpat/REMarkets systems
- **Stack:** .NET 10 + Azure SQL + Microsoft Entra (Blazor leaning)
- **Environments:** Dev, Test, Prod — **confirmed existing**, plug into client's Azure infra
- **CI/CD:** Single deploy pipeline (if Blazor confirmed)
- **QA:** No dedicated QA — Sales Team and Product Owners handle UAT
- **No Designer:** UI/UX is Simpat's responsibility (prototype serves as design reference)
- **Technical Leadership:** REMarkets wants Simpat to lead all technical decisions
- **Engagement Style:** Client prefers fixed-bid over T&M
- **Business Context:** Server components (RAM, CPUs) — high-volume part-number-level transactions; auctions run weekly

### Stakeholders
- **Executive Sponsor:** Zack Sexton
- **Product Owners:** Kim Jensen, Tim Murphy, Bobby Pronto
- **Sales Stakeholders:** Jerry Lee, Jessica Xia, Vincent Lievaart, Henry Chien, Chris Cox, Grey Player
- **Finance/Compliance:** Chelsie White, Avery Wolfe, Sara Ruiz

### TBDs That Impact Estimation
- ~~Azure environments — already provisioned or need setup?~~ **CONFIRMED: exist**
- Auth approach — Azure AD Groups (recommended) vs Internal DB Roles?
- Dev team Blazor experience levels
- 3rd developer available?
- MudBlazor DataGrid sufficient for in-cell editing? (evaluate Sprint 0)
- Automated infrastructure setup required (Azure Bicep)?

---

## Project Scope Summary

Internal web app replacing spreadsheet/email-based bidding workflows:
- Bid & Offer Management (create, track, in-cell editing)
- Inventory Handling (bulk upload CSV/Excel, state tracking, grouping)
- Allocation & Approval Workflow (aggregated view, configurable thresholds, split allocations)
- Act-on-Behalf (sales reps enter bids for customers with full attribution + audit)
- Customer Management (CRUD, assignment to reps)
- Role-based Access (Sales Rep, Sales Manager, Admin, Finance read-only, Executive read-only)
- Audit Trail (immutable logging for all tracked actions)
- Order-ready Exports (CSV/PDF after approval)
- Data Foundation (normalized SQL for future analytics consumption)

### Grid Library (Core UI Decision)
In-cell editing grid = where sales reps enter bids in a table like Excel. Recommended: **MudBlazor DataGrid (MIT license, free)**. Evaluate in Sprint 0 — if insufficient, upgrade to Telerik (~$1K/dev/yr) or AG Grid Blazor (~$1.1K/dev). Do NOT build manually with jQuery — conflicts with Blazor DOM management. Full options in estimation docs.

### Out of Scope (Phase 1)
- Analytics dashboards (future consideration)
- Customer-facing portal (future phase)
- Mobile app
- Email/notifications
- ERP integration

---

## Prototype Screens

All in `prototype/` folder — raw HTML, inline SVGs, CSS variables, Inter font:
- `index.html` — Login (Microsoft Entra SSO)
- `dashboard.html` — Main dashboard with KPI cards and recent activity
- `offers.html` — Offer management with bid line items
- `inventory.html` — Inventory list with state tracking and bulk upload
- `allocations.html` — Allocation view with approval workflow
- `customers.html` — Customer management with rep assignment

---

## Rules for Claude

- **Language:** Documents and deliverables in English. Conversation can be in Spanish.
- **Prototypes:** Raw HTML + custom CSS. Inline SVG icons ONLY — never Font Awesome or external icon CDNs. CSS variables for brand colors. Fictional/invented placeholder data (never use real client data unless Arturo provides it explicitly).
- **Estimation:** Include ALL work — infra per environment, CI/CD, DevOps, QA, learning curve, bug buffer. Map tasks to team members.
- **Always read** `docs/methodology.md` before starting any EMPA phase.
- **Update this file** after every major decision or phase completion.
- **Commits:** Unique, descriptive messages — never repeat the same commit message.
