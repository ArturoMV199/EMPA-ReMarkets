# Estimation: Bid Intelligence Platform
## Option B — Blazor Web App + .NET 10

## Scope Summary

Internal web application for REMarkets to replace spreadsheet/email-based bidding workflows. Covers bid management, inventory handling, allocation approvals, role-based access, act-on-behalf, audit trails, and order-ready exports. Authentication via Microsoft Entra. All data stored in clean, normalized SQL for future analytics consumption.

## Architecture Summary

- **Frontend + Backend:** Blazor Web App (.NET 10) — unified C# codebase
- **Render Modes:** Static SSR for simple pages, Interactive Server for bid tables and allocation views
- **UI Components:** MudBlazor (free) with DataGrid for in-cell editing
- **Database:** Azure SQL Database with Entity Framework Core 10 (Code-First)
- **Auth:** Microsoft Entra ID via Microsoft.Identity.Web (built-in Blazor auth)
- **Hosting:** Azure App Service (3 environments: Dev, Test, Prod — TBD if already provisioned)
- **Deploy:** Single project, single deploy

## Data Grid Library Options (In-Cell Editing — Core Feature)

The in-cell editing grid is the most critical UI component — it's where sales reps enter bids, quantities, and prices directly in a table (like Excel in the browser). Without this, every edit requires opening a separate form per line item.

| Library | License | Cost | In-Cell Editing | Notes |
|---------|---------|------|----------------|-------|
| **MudBlazor DataGrid** ⭐ Recommended | MIT (free, open source, use for anything) | $0 | ⭐⭐⭐⭐ Good | Active community, good docs, evaluate in Sprint 0 |
| **Radzen DataGrid** | MIT (free, open source) | $0 | ⭐⭐⭐⭐ Similar to MudBlazor | Alternative if MudBlazor doesn't fit |
| **AG Grid (Blazor wrapper)** | Community: MIT (free) / Enterprise: Commercial | Enterprise ~$1,100/dev one-time | ⭐⭐⭐⭐⭐ Best-in-class | Same AG Grid as React, has Blazor wrapper |
| **Telerik UI for Blazor** | Commercial (paid license) | ~$1,000/dev/year | ⭐⭐⭐⭐⭐ Excellent | Full UI suite with professional support |
| **Syncfusion Blazor** | Community: free for companies <$1M revenue / Commercial | $0 or ~$995/dev/year | ⭐⭐⭐⭐ Very good | Free tier may apply depending on client revenue |
| **Manual (jQuery/JavaScript)** | N/A | $0 | ⭐⭐ Painful | ❌ **Not recommended** — conflicts with Blazor's DOM management, causes bugs |

**Recommendation:** Start with MudBlazor (free, MIT). If during Sprint 0 the DataGrid doesn't handle the in-cell editing complexity needed, upgrade to Telerik or AG Grid (~$2-3K for 2-3 devs). This is a low cost compared to the development hours saved.

**Why not build it manually?** Blazor controls the entire page DOM through C#. Adding jQuery or raw JavaScript to handle a grid creates two systems fighting over the same page elements — guaranteed bugs, double development effort, and maintenance headaches.

## MVP Definition

**Core question:** Can REMarkets run 100% of internal bid-to-allocation workflows through the platform instead of spreadsheets and email?

**MVP goal:** A working web application where sales reps can create offers, enter bids, upload inventory, and route allocations through an approval workflow — with full audit logging and role-based access.

---

### MVP Scope (Must Have)

Without these, the project fails to replace the current spreadsheet/email process.

| # | Module | Task | Complexity | Base Hrs | Factor | Adjusted | Notes |
|---|--------|------|------------|----------|--------|----------|-------|
| **Project Setup** | | | | | | | |
| 1 | Setup | Blazor Web App project scaffolding (Clean Architecture) | Low | 12 | ×1.2 | 14 | Single project, C# only |
| 2 | Setup | EF Core setup, initial migrations, seed data | Low | 12 | ×1.2 | 14 | |
| 3 | Setup | CI/CD pipeline (build + test + deploy) | Low | 10 | ×1.2 | 12 | Single project = simpler pipeline |
| **Authentication & Authorization** | | | | | | | |
| | | **Option A: Azure AD Groups (Confirmed)** | | | | | Roles managed in Azure AD — no user/role tables in app DB |
| 4 | Auth | Entra integration — Microsoft.Identity.Web (built-in Blazor auth) | Medium | 12 | ×1.5 | 18 | Simpler than MSAL.js — built-in support |
| 5 | Auth | Azure AD Group setup + group claims mapping (5 groups: Sales Rep, Sales Manager, Admin, Finance, Executive) | Medium | 10 | ×1.5 | 15 | Configure groups in Azure AD, map to app roles via token claims |
| 6 | Auth | Dynamic role-based authorization (policies reading AD group claims) + app-layer enforcement | Medium | 14 | ×1.5 | 21 | API and services enforce roles from AD groups; app-layer enforcement required per client |
| 7 | Auth | AuthorizeView components (dynamic role-based UI rendering from AD claims) | Low | 12 | ×1.2 | 14 | Show/hide/disable UI elements based on group membership |
| | | **Auth Option A subtotal** | | | | **68 hrs** | |
| | | | | | | | |
| | | **Option B: Internal DB Roles (If Azure AD groups not available)** | | | | | Roles managed in app DB — requires Users + UserRoles tables + admin UI |
| 4b | Auth | Entra integration — Microsoft.Identity.Web (login only, no group claims) | Medium | 12 | ×1.5 | 18 | Login via Entra but roles stored internally |
| 5b | Auth | Users + UserRoles tables + EF Core setup | Medium | 12 | ×1.5 | 18 | DB schema for role management |
| 6b | Auth | Role assignment admin UI (assign/remove roles per user) | Medium | 14 | ×1.5 | 21 | Admin-only screen to manage user roles |
| 7b | Auth | Role-based authorization middleware (read from DB) | Medium | 14 | ×1.5 | 21 | |
| 8b | Auth | AuthorizeView components (role-based UI rendering from DB roles) | Low | 12 | ×1.2 | 14 | |
| | | **Auth Option B subtotal** | | | | **92 hrs** | +24 hrs vs Option A |
| **Customer Management** | | | | | | | |
| 8 | Customers | Customer CRUD (API + Blazor pages) | Low | 14 | ×1.2 | 17 | Standard CRUD |
| 9 | Customers | Customer assignment to Sales Reps/Managers | Low | 8 | ×1.2 | 10 | |
| 10 | Customers | Customer deactivation (soft delete) + audit logging | Low | 8 | ×1.2 | 10 | |
| **Inventory Management** | | | | | | | |
| 11 | Inventory | Bulk CSV/Excel upload (parsing + validation + error handling) | High | 24 | ×2.0 | 48 | File parsing edge cases |
| 12 | Inventory | Inventory identity — composite uniqueness (PartNumber + condition + location + grade) + master vs source description logic | High | 20 | ×2.0 | 40 | Client-confirmed: net-new → populate master; existing → retain source description only; master changes require Admin/Manager action |
| 12b | Inventory | Master description edit UI (searchable list + inline edit + Admin/Sales Manager restriction). Audit covered by #35 generic interceptor. No approval step required. | Low | 6 | ×1.2 | 8 | SC-002 A15: Client confirmed dedicated UI, fully audited, no separate approval |
| 13 | Inventory | Inventory adjustment records (each upload row = distinct transaction: batch ID, user, timestamp, qty, source file) | Medium | 14 | ×1.5 | 21 | Client-confirmed: never silently merge — full audit trail per upload row |
| 14 | Inventory | Inventory list view with state tracking (Available/Committed/Released) | Medium | 14 | ×1.5 | 21 | |
| 15 | Inventory | Inventory grouping into offers | Medium | 12 | ×1.5 | 18 | |
| 16 | Inventory | State transitions (automatic on approval + manual override) | Medium | 16 | ×1.5 | 24 | Business rules complexity |
| **Bid & Offer Management** | | | | | | | |
| 17 | Bids | Create/Edit offers (Blazor forms) | Medium | 14 | ×1.5 | 21 | |
| 18 | Bids | Offer list view with filtering and sorting | Medium | 10 | ×1.5 | 15 | |
| 19 | Bids | MudBlazor DataGrid — in-cell editing for line-item bids | High | 28 | ×2.0 | 56 | Core feature, DataGrid config |
| 20 | Bids | Bid uniqueness enforcement (one active bid per customer per line per offer) + revision tracking | Medium | 10 | ×1.5 | 15 | Client-confirmed: new revision on update, previous retained for audit, only latest active |
| 21 | Bids | Bid types support (bid/BIN/target pricing) | Medium | 12 | ×1.5 | 18 | |
| 22 | Bids | Winning/losing bid capture and status tracking | Medium | 12 | ×1.5 | 18 | |
| 23 | Bids | Bid history (view previous revisions per line item) | Medium | 14 | ×1.5 | 21 | |
| **Allocation & Approval Workflow** | | | | | | | |
| 24 | Allocation | Aggregated allocation view (all bids per offer) | Medium | 14 | ×1.5 | 21 | |
| 25 | Allocation | Admin override of winning customer | Medium | 12 | ×1.5 | 18 | |
| 26 | Allocation | Approval workflow (Pending → Approved/Rejected) — all manager-approved in Phase 1 | High | 24 | ×2.0 | 48 | Client-confirmed: thresholds out of scope Phase 1; Admin has full authority including override |
| 27 | Allocation | Visual pricing indicators ("below floor" warnings) — thresholds configurable in future phase | Medium | 8 | ×1.5 | 12 | Client-confirmed: visual only in Phase 1, no auto-reject |
| 28 | Allocation | Automatic inventory commitment on approval | Medium | 12 | ×1.5 | 18 | |
| **Allocation Reversal** | | | | | | | Client-confirmed — must support in Phase 1 |
| 29 | Allocation | Allocation reversal (return inventory to Available, mark as Reversed, lock/regenerate export) | High | 20 | ×2.0 | 40 | State machine change + inventory rollback + export invalidation |
| 30 | Allocation | Reversal reason code (required) + full audit trail for reversals | Medium | 8 | ×1.5 | 12 | Reason code dropdown + audit entry |
| **Allocation Tie-Breaker** | | | | | | | Client-confirmed — system surfaces ties, manager resolves manually |
| 31 | Allocation | Tie detection logic + resolution UI (surface tied bids, force manual winner selection) | Medium | 8 | ×1.5 | 12 | Admin/Manager picks winner from tied bids |
| **Act-on-Behalf (Sales enters bids for customers)** | | | | | | | Client-requested — Kim: "very important", needed from day 1 since Phase 1 is internal only |
| 32 | Act-on-Behalf | Act-on-behalf capability — sales rep enters bids on behalf of a customer with full attribution | High | 24 | ×2.0 | 48 | Custom AuthenticationStateProvider; tracks who acted + for whom |
| 33 | Act-on-Behalf | Act-on-behalf UI (customer selector + visual indicator showing active customer context) | Medium | 10 | ×1.5 | 15 | Clear visual cue that rep is acting for customer |
| **Split Allocations** | | | | | | | Client-requested — Kim: "we do want to be able to support split allocations" |
| 34 | Allocation | Partial/split allocations across customers (divide quantity of a line item between multiple winners) | High | 24 | ×2.0 | 48 | Manual decision by manager, not automated |
| **Audit & Compliance** | | | | | | | |
| 35 | Audit | Audit logging middleware (insert-only AuditLog table) | Medium | 16 | ×1.5 | 24 | |
| 36 | Audit | Audit trail UI (view history per entity) | Medium | 14 | ×1.5 | 21 | |
| **Order-Ready Exports** | | | | | | | |
| 37 | Exports | CSV export from approved allocations | Low | 8 | ×1.2 | 10 | |
| **Permissions UI** | | | | | | | |
| 38 | Permissions | Role-based UI visibility (AuthorizeView across pages) | Medium | 14 | ×1.5 | 21 | |
| **Testing & Bug Buffer** | | | | | | | |
| 39 | QA | Unit tests (services + critical business logic) | Medium | 20 | ×1.5 | 30 | |
| 40 | QA | Integration tests (API/page endpoints) | Medium | 14 | ×1.5 | 21 | |
| 41 | QA | Bug fixing buffer (10% of MVP hours) | — | — | — | 90 | Based on ~900 hrs pre-buffer |

| | | | | **MVP Total** | | **~998 hrs** | |

---

### Post-MVP Scope (Should Have)

Features that add value after MVP is stable. Labeled as client-requested or suggested enhancement.

| # | Module | Task | Complexity | Base Hrs | Factor | Adjusted | Source |
|---|--------|------|------------|----------|--------|----------|--------|
| 42 | Allocation | Escalation paths (auto-escalate if not approved in X time) | Medium | 16 | ×1.5 | 24 | Suggested enhancement |
| 43 | Exports | PDF export (order-ready documents via QuestPDF) | Medium | 14 | ×1.5 | 21 | Client mentioned "order-ready exports" — CSV is in MVP, PDF is extra |
| 44 | Audit | Advanced audit views (filter by user, date, entity type) | Medium | 10 | ×1.5 | 15 | Suggested enhancement |
| 45 | Admin | System configuration UI (thresholds, settings — avoid hardcoding) | Medium | 14 | ×1.5 | 21 | Suggested enhancement |
| 46 | QA | UAT support + bug fixes from user feedback | Medium | 24 | ×1.5 | 36 | Standard |

| | | | | **Post-MVP Total** | | **~117 hrs** | |

---

### Backlog (Could Have)

| # | Task | Source |
|---|------|--------|
| 47 | Dashboard with key metrics (active offers, pending approvals, recent bids) | Suggested enhancement |
| 48 | Bulk bid operations (approve/reject multiple at once) | Suggested enhancement |
| 49 | Advanced search and filtering across all entities | Suggested enhancement |
| 50 | Email notifications on approval status changes | Suggested enhancement |
| 51 | Data export API for future external consumption | Suggested enhancement |
| 52 | User activity log (who logged in when) | Suggested enhancement |

### Out of Scope (Won't Have)

- Customer-facing portal (future phase)
- In-app analytics dashboards (future consideration)
- Commodities pricing database / AI training data
- Mobile application
- Integration with external ERP or order management systems

---

## Learning Curve Budget

| Technology | Who | Hours | Justification |
|-----------|-----|-------|---------------|
| Blazor component model + render modes | Dev 1 | 12 | Components, lifecycle, SSR vs Interactive |
| Blazor component model + render modes | Dev 2 | 12 | Same |
| MudBlazor (DataGrid + UI components) | Dev 1 | 8 | Grid API, cell editing, forms |
| MudBlazor (DataGrid + UI components) | Dev 2 | 6 | Support knowledge |
| Microsoft.Identity.Web (Blazor auth) | Dev 1 | 6 | Built-in auth patterns |
| Azure App Service + SQL (if new) | Both | 8 | Deployment, connection strings, config |
| CI/CD pipeline setup | TBD | 4 | Single project = simpler |
| **Learning Curve Total** | | **56 hrs** | |

---

## Risk Assessment

| Risk | Probability | Impact | Hours at Risk | Mitigation |
|------|-------------|--------|---------------|------------|
| MudBlazor DataGrid insufficient for in-cell editing | Medium | High | +16-24 hrs + $1K/dev license | Evaluate in Sprint 0; Telerik/Syncfusion as fallback |
| SignalR connection reliability | Low | Medium | +8-16 hrs | Built-in reconnection; test under real network |
| Blazor community smaller — harder to find solutions | Medium | Medium | +8-16 hrs per incident | MudBlazor Discord, Microsoft docs |
| Partial/split allocation business rules unclear | ~~High~~ Low | High | +24-40 hrs | ~~Define rules with Product Owners before coding~~ SC-003 A17/A18 resolved: auto-release, no reservation, flat records. Risk significantly reduced. |
| Allocation reversal edge cases (partial reversals, already-exported data) | Medium | High | +16-24 hrs | Define reversal rules explicitly with POs; test with real scenarios |
| Inventory composite uniqueness conflicts (same part, different attributes) | Medium | Medium | +8-16 hrs | Define exact uniqueness rules with client; validate during Sprint 0 |
| CSV upload edge cases (bad data, large files) | Medium | Medium | +8-16 hrs | Define validation rules upfront; limit file sizes |
| Azure infra not available on time | Medium | High | Blocks 1-2 weeks | Confirm access before Sprint 1 |
| Scope creep from 3 Product Owners | Medium | High | +40-80 hrs | Reference charter; change request process |
| Open discovery questions (27 unresolved) | High | High | +40-150 hrs total potential | Prioritize top 9 questions before Sprint 1; see discovery-questions.md |

---

## Summary

| Concept | Hours |
|---------|-------|
| MVP (Must Have) — with Auth Option A: Azure AD Groups | ~998 hrs |
| MVP (Must Have) — with Auth Option B: Internal DB Roles | ~1,022 hrs |
| Post-MVP (Should Have) | ~117 hrs |
| Learning Curve | ~56 hrs |
| **Full Scope (MVP + Post-MVP + Learning) — Auth Option A** | **~1,171 hrs** |
| **Full Scope (MVP + Post-MVP + Learning) — Auth Option B** | **~1,195 hrs** |

*Updated Feb 2026 after client Q&A. SC-001: inventory identity/dedupe (+61 hrs), bid uniqueness (+15 hrs), allocation reversal (+52 hrs), tie-breaker (+12 hrs), below floor indicator (+12 hrs), thresholds simplified (-9 hrs), bug buffer recalc (+15 hrs) = +146 hrs. SC-002: master description edit UI (+8 hrs), 4 confirmed (0 hrs), 1 confirmed with Post-MVP note (0 hrs) = +8 hrs. SC-003: inventory in multiple active offers confirmed (0 hrs), partial allocation auto-release confirmed (0 hrs) = 0 hrs — design decisions only, no new scope.*

### Timeline Scenarios — Auth Option A (2 developers, 8 hrs/day each = 80 hrs/week)

| Scenario | Scope | Hours | Working Weeks | Calendar Estimate |
|----------|-------|-------|---------------|-------------------|
| MVP only | Must Have + Learning | ~1,054 hrs | ~13.2 weeks | ~3.3 months |
| MVP + Post-MVP | Full Phase 1 | ~1,171 hrs | ~14.6 weeks | ~3.65 months |

### With 3 developers (120 hrs/week)

| Scenario | Scope | Hours | Working Weeks | Calendar Estimate |
|----------|-------|-------|---------------|-------------------|
| MVP only | Must Have + Learning | ~1,054 hrs | ~8.8 weeks | ~2.2 months |
| MVP + Post-MVP | Full Phase 1 | ~1,171 hrs | ~9.8 weeks | ~2.45 months |

*Auth Option B adds ~24 hrs to all scenarios. Timelines assume devs are productive from week 1 after learning curve. Actual ramp-up may add 1-2 weeks. Timelines do not include UAT cycles with client.*

---

## TBD Impact on Estimation

| Unknown | If Confirmed As... | Impact on Hours |
|---------|-------------------|-----------------|
| Auth approach: Azure AD Groups vs Internal DB roles | Option A: Azure AD Groups (recommended) | Auth section = 68 hrs (baseline) |
| Auth approach: Azure AD Groups vs Internal DB roles | Option B: Internal DB roles + admin UI | Auth section = 92 hrs (+24 hrs vs Option A) |
| 3rd developer available | Yes | Timeline compresses ~30% |
| 3rd developer available | No | Timeline stays at 2-dev scenario |
| MudBlazor DataGrid sufficient | No — need Telerik/Syncfusion | +$1-2K license, +8-16 hrs integration |
| Automated infrastructure setup required (Azure Bicep scripts to create environments via code instead of manually through Azure Portal) | Yes | +16-24 hrs |

---

## Head-to-Head: React vs Blazor Estimation

| Metric | React + .NET 10 | Blazor Web App + .NET 10 | Difference |
|--------|----------------|-------------------------|------------|
| MVP Hours (Auth Option A) | ~1,100 hrs* | ~998 hrs | Blazor saves ~102 hrs (9%) |
| Post-MVP Hours | ~126 hrs | ~117 hrs | Blazor saves ~9 hrs |
| Learning Curve | ~100 hrs | ~56 hrs | Blazor saves ~44 hrs (44% less) |
| **Total Hours (Auth Option A)** | **~1,326 hrs*** | **~1,171 hrs** | **Blazor saves ~155 hrs (12%)** |
| MVP Timeline (2 devs) | ~15 weeks* | ~13.2 weeks | Blazor ~1.8 weeks faster |
| Full Scope Timeline (2 devs) | ~16.5 weeks* | ~14.6 weeks | Blazor ~1.9 weeks faster |
| MVP Timeline (3 devs) | ~10 weeks* | ~8.8 weeks | Blazor ~1.2 weeks faster |
| Full Scope Timeline (3 devs) | ~11 weeks* | ~9.8 weeks | Blazor ~1.2 weeks faster |
| In-cell editing quality | ⭐⭐⭐⭐⭐ AG Grid | ⭐⭐⭐⭐ MudBlazor | React has better grid |
| Future customer portal | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | React better long-term |
| Hiring future devs | ⭐⭐⭐⭐⭐ | ⭐⭐ | React market is larger |
| CI/CD complexity | Medium (2 deploys) | Low (1 deploy) | Blazor simpler |

*React estimation not yet updated with client Q&A scope changes. React numbers are projected proportional estimates. React estimation document should be updated separately if needed.*

**Bottom line:** Blazor saves ~160 hours and ~2 weeks on timeline. React costs more upfront but offers better in-cell editing, easier hiring, and a stronger path to a future customer portal.

---

## Team Sign-off

| Name | Role | Approved |
|------|------|----------|
| TBD | Simpat Lead | |
| TBD | Dev 1 | |
| TBD | Dev 2 | |
