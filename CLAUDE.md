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
Discovery questions: `docs/discovery-questions.md`
Scope changes: `docs/SC_XXX/scope-changes.json` → generator: `docs/gen-scope-changes.js SC_XXX`

---

## EMPA Phases

```
1. Discover  → project-charter.md              ✅ COMPLETE
1B. Discovery Q&A → discovery-questions.md      🔄 IN PROGRESS (10 answered, 27 open — awaiting client)
2. Architect → architecture-decision-*.md       ✅ COMPLETE (Blazor confirmed)
2B. Prototype → prototype/ folder               ✅ COMPLETE (6 screens)
3. Estimate  → estimation-blazor.md             ✅ COMPLETE (updated with Q&A: MVP ~990 hrs)
3B. Scope Changes → scope-changes.json          ✅ ACTIVE (SC-001: A1–A10 logged, +184 hrs net)
4. Execute   → weekly-status.md (per week)      ⏳ NOT STARTED
5. Reflect   → lessons-learned.md               ⏳ NOT STARTED
```

---

## Current Project State

**Status:** Active — Pre-Execution
**Project Name:** EMPA-ReMarkets
**Client:** REMarkets
**Consulting Firm:** Simpat
**Current Phase:** Between Estimate and Execute — Blazor + .NET 10 confirmed, Azure AD Groups confirmed
**Last Updated:** 2026-02-23

### Decisions Made
- 2026-02-19: Charter completed — full scope, 14 stakeholders, 10 risks identified
- 2026-02-19: Two architecture options generated (React + .NET 10 vs Blazor + .NET 10)
- 2026-02-19: Prototype delivered — 6 screens (Login, Dashboard, Offers, Inventory, Allocations, Customers)
- 2026-02-19: Two estimations completed (one per architecture option)
- 2026-02-19: Azure environments confirmed — exist and available (reduced setup hours)
- 2026-02-19: "Masquerade" renamed to "Act-on-Behalf" — clearer for non-technical stakeholders
- 2026-02-19: Act-on-Behalf + Split Allocations moved from Post-MVP to MVP (client-requested features)
- 2026-02-19: Grid library options documented — MudBlazor (MIT, free) recommended; Telerik/AG Grid as paid fallback
- 2026-02-19: All estimation items now labeled "Client-requested" vs "Suggested enhancement"
- 2026-02-19: Prototype data theme corrected — energy commodities → server components (RAM, CPUs, NVMe, NICs)
- 2026-02-19: Wrong transcript contamination cleaned from all docs (analytics workstream references removed)
- 2026-02-23: **Blazor + .NET 10 CONFIRMED** as architecture choice
- 2026-02-23: **Azure AD Groups CONFIRMED** as auth approach (Option A) — no internal user/role tables needed
- 2026-02-23: Discovery questions document created (docs/discovery-questions.md) — 10 answered from client Q&A, 27 open questions sent to client awaiting response
- 2026-02-23: Estimation updated with confirmed Q&A answers: MVP ~990 hrs, Full Scope ~1,163 hrs (Auth Option A)
- 2026-02-23: Prototypes updated: inventory.html (Part #, Condition, master/source description), allocations.html (Below Floor, Tie, Reverse, Reversed), offers.html (bid revision indicators)
- 2026-02-24: Scope Change Register created (docs/scope-changes.json) — SC-001: all 10 client answers (A1–A10) logged with evidence, 5 confirmed (0 hrs), 4 added (+140 hrs), 1 modified (-9 hrs), bug buffer recalc (+15 hrs) = net +184 hrs

### Pending Decisions

**1. Grid library: MudBlazor free vs paid alternative (evaluate Sprint 0)**
- Start with MudBlazor DataGrid (MIT, $0) — evaluate if in-cell editing meets requirements
- Fallback: Telerik (~$1K/dev/yr) or AG Grid Blazor (~$1.1K/dev one-time)

**2. Discovery questions awaiting client response (27 open)**
- Answers may impact estimation — do NOT update estimation until responses are confirmed
- See `docs/discovery-questions.md` for full list and priority guidelines

### Key Context
- **Team:** 2 Fullstack .NET Developers (possible 3rd), new hires — skill levels TBD
- **Existing Dev:** Part-time support/advisor, familiar with Simpat/REMarkets systems
- **Stack:** Blazor Web App + .NET 10 + Azure SQL + Microsoft Entra (Azure AD Groups for auth) — **CONFIRMED**
- **Environments:** Dev, Test, Prod — **confirmed existing**, plug into client's Azure infra
- **CI/CD:** Single deploy pipeline (Blazor = 1 deploy)
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
- ~~Auth approach — Azure AD Groups vs Internal DB Roles?~~ **CONFIRMED: Azure AD Groups (Option A)**
- ~~Blazor vs React?~~ **CONFIRMED: Blazor + .NET 10**
- Dev team Blazor experience levels
- 3rd developer available?
- MudBlazor DataGrid sufficient for in-cell editing? (evaluate Sprint 0)
- Automated infrastructure setup required (Azure Bicep)?
- **27 open discovery questions awaiting client response** — answers may add/reduce/change estimation items. See `docs/discovery-questions.md`

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
- **Think outside the box — always.** Every time new information comes in (client Q&A, transcripts, requirements changes), don't just process what's given — proactively identify what's missing, what hasn't been asked, and what could break assumptions. Generate discovery questions that help narrow the client's true scope and reduce ambiguity. This is how the team caught critical gaps like allocation reversals and inventory identity rules — questions that came from our side, not the client's. Keep `docs/discovery-questions.md` updated as the living backlog of open questions, and flag high-impact unknowns before they become Sprint blockers.
