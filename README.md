# EMPA-ReMarkets — Bid Intelligence Platform

Estimation, architecture, prototyping, and project tracking for the ReMarkets Bid Intelligence Platform, built using the [EMPA framework](https://github.com/ArturoMV199/EMPA).

---

## Project Summary

Internal web application for REMarkets to replace spreadsheet/email-based bidding workflows for server components (RAM, CPUs, NVMe, NICs). Covers bid management, inventory handling, allocation approvals, role-based access, act-on-behalf, audit trails, and order-ready exports.

**Client:** REMarkets
**Consulting Firm:** Simpat Tech
**First project built with EMPA.**

---

## Current Status

| Phase | Status | Output |
|-------|--------|--------|
| 1. Discover | Complete | `project-charter.md` — 14 stakeholders, 10 risks |
| 1B. Discovery Q&A | In Progress | `docs/discovery-questions.md` — 18 answered, 21 open (1 critical) |
| 2. Architect | Complete | `docs/architecture-decision-blazor.md` — Blazor + .NET 10 confirmed |
| 2B. Prototype | Complete | `prototype/` — 6 screens (Login, Dashboard, Offers, Inventory, Allocations, Customers) |
| 3. Estimate | Complete | `docs/estimation-blazor.md` — MVP ~998 hrs, Full ~1,171 hrs |
| 3B. Scope Changes | Active | 3 batches (SC-001: +146 hrs, SC-002: +8 hrs, SC-003: 0 hrs) |
| 4. Execute | Not Started | — |
| 5. Reflect | Not Started | — |

---

## Architecture (Confirmed)

| Component | Choice |
|-----------|--------|
| Frontend + Backend | Blazor Web App (.NET 10) — unified C# codebase |
| Render Modes | Static SSR + Interactive Server (SignalR) |
| UI Components | MudBlazor DataGrid (MIT, free) |
| Database | Azure SQL Database + EF Core 10 (Code-First) |
| Auth | Microsoft Entra ID + Azure AD Groups (5 roles) |
| Hosting | Azure App Service (Dev, Test, Prod — existing) |
| CI/CD | Single project, single deploy |
| Exports | CSV (MVP), PDF via QuestPDF (Post-MVP) |

---

## Estimation Summary

| Concept | Hours |
|---------|-------|
| MVP (Must Have) | ~998 hrs |
| Post-MVP (Should Have) | ~117 hrs |
| Learning Curve | ~56 hrs |
| **Full Scope** | **~1,171 hrs** |

### Timeline

| Scenario | 2 Developers | 3 Developers |
|----------|-------------|-------------|
| MVP + Learning | ~3.3 months | ~2.2 months |
| Full Scope | ~3.7 months | ~2.4 months |

---

## Scope Change History

| Batch | Date | Trigger | Net Impact | MVP After |
|-------|------|---------|------------|-----------|
| SC-001 | 2026-02-23 | Client Q&A A1–A10 | +146 hrs | ~990 hrs |
| SC-002 | 2026-02-26 | Client Q&A A11–A16 | +8 hrs | ~998 hrs |
| SC-003 | 2026-03-03 | Client Q&A A17–A18 (critical) | 0 hrs | ~998 hrs |

All scope changes include client answer quotes as evidence. Generated as Word/PDF via `docs/gen-scope-changes.js`.

---

## Project Structure

```
EMPA-ReMarkets/
├── project-charter.md                    # Phase 1: Discovery output
├── docs/
│   ├── architecture-decision-blazor.md   # Phase 2: Architecture (confirmed)
│   ├── estimation-blazor.md              # Phase 3: Full estimation
│   ├── discovery-questions.md            # Living Q&A backlog
│   ├── gen-scope-changes.js              # Scope change Word/PDF generator
│   ├── gen-estimation.js                 # Estimation Word/PDF generator
│   ├── SC_001/scope-changes.json         # Scope change batch 1
│   ├── SC_002/scope-changes.json         # Scope change batch 2
│   ├── SC_003/scope-changes.json         # Scope change batch 3
│   └── AllFilesDocs_Estimations/         # Generated PDFs and cost estimates
├── prototype/                             # Phase 2B: 6 clickable HTML screens
│   ├── index.html                        # Login (Microsoft Entra SSO)
│   ├── dashboard.html                    # Dashboard with KPI cards
│   ├── offers.html                       # Offer management + bid line items
│   ├── inventory.html                    # Inventory list + bulk upload
│   ├── allocations.html                  # Allocation + approval workflow
│   └── customers.html                    # Customer management
├── prototype_v2/                          # Prototype iteration 2
├── CLAUDE.md                              # Project state + rules for Claude Code
└── README.md
```

---

## Key Decisions

- **Blazor over React:** Saves ~155 hrs (12%) and ~2 weeks. Single codebase, single deploy. Trade-off: smaller community, harder hiring long-term.
- **Azure AD Groups over Internal DB Roles:** Saves ~24 hrs. No user/role tables in app DB. Roles managed in Azure AD.
- **MudBlazor (free) over paid grids:** Evaluate in Sprint 0. Fallback: Telerik (~$1K/dev/yr) or AG Grid (~$1.1K/dev).
- **Act-on-Behalf from day 1:** Phase 1 is internal-only — all bids entered by sales reps on behalf of customers.
- **Flat allocation records:** Multiple records per customer per inventory line (not nested). Cleaner audit, export, and reversal.

---

## License

This project is for internal use. All code and artifacts are REMarkets intellectual property.
