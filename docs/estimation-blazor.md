# Estimation: Bid Intelligence Platform
## Option B — Blazor Web App + .NET 10

## Scope Summary

Internal web application for REMarkets to replace spreadsheet/email-based bidding workflows. Covers bid management, inventory handling, allocation approvals, role-based access, customer masquerade, audit trails, and order-ready exports. Authentication via Microsoft Entra. All data stored in clean, normalized SQL for future analytics consumption.

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
| | | **Option A: Azure AD Groups (Recommended)** | | | | | Roles managed in Azure AD — no user/role tables in app DB |
| 5 | Auth | Entra integration — Microsoft.Identity.Web (built-in Blazor auth) | Medium | 12 | ×1.5 | 18 | Simpler than MSAL.js — built-in support |
| 6 | Auth | Azure AD Group setup + group claims mapping (5 groups: Sales Rep, Sales Manager, Admin, Finance, Executive) | Medium | 10 | ×1.5 | 15 | Configure groups in Azure AD, map to app roles via token claims |
| 7 | Auth | Dynamic role-based authorization (policies reading AD group claims) | Medium | 14 | ×1.5 | 21 | API and services enforce roles from AD groups |
| 8 | Auth | AuthorizeView components (dynamic role-based UI rendering from AD claims) | Low | 12 | ×1.2 | 14 | Show/hide/disable UI elements based on group membership |
| | | **Auth Option A subtotal** | | | | **68 hrs** | |
| | | | | | | | |
| | | **Option B: Internal DB Roles (If Azure AD groups not available)** | | | | | Roles managed in app DB — requires Users + UserRoles tables + admin UI |
| 5b | Auth | Entra integration — Microsoft.Identity.Web (login only, no group claims) | Medium | 12 | ×1.5 | 18 | Login via Entra but roles stored internally |
| 6b | Auth | Users + UserRoles tables + EF Core setup | Medium | 12 | ×1.5 | 18 | DB schema for role management |
| 7b | Auth | Role assignment admin UI (assign/remove roles per user) | Medium | 14 | ×1.5 | 21 | Admin-only screen to manage user roles |
| 8b | Auth | Role-based authorization middleware (read from DB) | Medium | 14 | ×1.5 | 21 | |
| 9b | Auth | AuthorizeView components (role-based UI rendering from DB roles) | Low | 12 | ×1.2 | 14 | |
| | | **Auth Option B subtotal** | | | | **92 hrs** | +24 hrs vs Option A |
| **Customer Management** | | | | | | | |
| 8 | Customers | Customer CRUD (API + Blazor pages) | Low | 14 | ×1.2 | 17 | Standard CRUD |
| 9 | Customers | Customer assignment to Sales Reps/Managers | Low | 8 | ×1.2 | 10 | |
| 10 | Customers | Customer deactivation (soft delete) + audit logging | Low | 8 | ×1.2 | 10 | |
| **Inventory Management** | | | | | | | |
| 11 | Inventory | Bulk CSV/Excel upload (parsing + validation + error handling) | High | 24 | ×2.0 | 48 | File parsing edge cases |
| 12 | Inventory | Inventory list view with state tracking (Available/Committed/Released) | Medium | 14 | ×1.5 | 21 | |
| 13 | Inventory | Inventory grouping into offers | Medium | 12 | ×1.5 | 18 | |
| 14 | Inventory | State transitions (automatic on approval + manual override) | Medium | 16 | ×1.5 | 24 | Business rules complexity |
| **Bid & Offer Management** | | | | | | | |
| 15 | Bids | Create/Edit offers (Blazor forms) | Medium | 14 | ×1.5 | 21 | |
| 16 | Bids | Offer list view with filtering and sorting | Medium | 10 | ×1.5 | 15 | |
| 17 | Bids | MudBlazor DataGrid — in-cell editing for line-item bids | High | 28 | ×2.0 | 56 | Core feature, DataGrid config |
| 18 | Bids | Bid types support (bid/BIN/target pricing) | Medium | 12 | ×1.5 | 18 | |
| 19 | Bids | Winning/losing bid capture and status tracking | Medium | 12 | ×1.5 | 18 | |
| 20 | Bids | Bid history (view previous values per line item) | Medium | 14 | ×1.5 | 21 | |
| **Allocation & Approval Workflow** | | | | | | | |
| 21 | Allocation | Aggregated allocation view (all bids per offer) | Medium | 14 | ×1.5 | 21 | |
| 22 | Allocation | Admin override of winning customer | Medium | 12 | ×1.5 | 18 | |
| 23 | Allocation | Approval workflow (Pending → Approved/Rejected) | High | 24 | ×2.0 | 48 | State machine + UI updates |
| 24 | Allocation | Approval thresholds (configurable per role) | Medium | 14 | ×1.5 | 21 | |
| 25 | Allocation | Automatic inventory commitment on approval | Medium | 12 | ×1.5 | 18 | |
| **Act-on-Behalf (Sales enters bids for customers)** | | | | | | | Client-requested — Kim: "very important", needed from day 1 since Phase 1 is internal only |
| 26 | Act-on-Behalf | Act-on-behalf capability — sales rep enters bids on behalf of a customer with full attribution | High | 24 | ×2.0 | 48 | Custom AuthenticationStateProvider; tracks who acted + for whom |
| 27 | Act-on-Behalf | Act-on-behalf UI (customer selector + visual indicator showing active customer context) | Medium | 10 | ×1.5 | 15 | Clear visual cue that rep is acting for customer |
| **Split Allocations** | | | | | | | Client-requested — Kim: "we do want to be able to support split allocations" |
| 28 | Allocation | Partial/split allocations across customers (divide quantity of a line item between multiple winners) | High | 24 | ×2.0 | 48 | Manual decision by manager, not automated |
| **Audit & Compliance** | | | | | | | |
| 29 | Audit | Audit logging middleware (insert-only AuditLog table) | Medium | 16 | ×1.5 | 24 | |
| 30 | Audit | Audit trail UI (view history per entity) | Medium | 14 | ×1.5 | 21 | |
| **Order-Ready Exports** | | | | | | | |
| 31 | Exports | CSV export from approved allocations | Low | 8 | ×1.2 | 10 | |
| **Permissions UI** | | | | | | | |
| 32 | Permissions | Role-based UI visibility (AuthorizeView across pages) | Medium | 14 | ×1.5 | 21 | |
| **Testing & Bug Buffer** | | | | | | | |
| 33 | QA | Unit tests (services + critical business logic) | Medium | 20 | ×1.5 | 30 | |
| 34 | QA | Integration tests (API/page endpoints) | Medium | 14 | ×1.5 | 21 | |
| 35 | QA | Bug fixing buffer (10% of MVP hours) | — | — | — | 75 | Based on total MVP |

| | | | | **MVP Total** | | **~806 hrs** | |

---

### Post-MVP Scope (Should Have)

Features that add value after MVP is stable. Labeled as client-requested or suggested enhancement.

| # | Module | Task | Complexity | Base Hrs | Factor | Adjusted | Source |
|---|--------|------|------------|----------|--------|----------|--------|
| 36 | Allocation | Escalation paths (auto-escalate if not approved in X time) | Medium | 16 | ×1.5 | 24 | Suggested enhancement |
| 37 | Exports | PDF export (order-ready documents via QuestPDF) | Medium | 14 | ×1.5 | 21 | Client mentioned "order-ready exports" — CSV is in MVP, PDF is extra |
| 38 | Audit | Advanced audit views (filter by user, date, entity type) | Medium | 10 | ×1.5 | 15 | Suggested enhancement |
| 39 | Admin | System configuration UI (thresholds, settings — avoid hardcoding) | Medium | 14 | ×1.5 | 21 | Suggested enhancement |
| 40 | QA | UAT support + bug fixes from user feedback | Medium | 24 | ×1.5 | 36 | Standard |

| | | | | **Post-MVP Total** | | **~117 hrs** | |

---

### Backlog (Could Have)

| # | Task | Source |
|---|------|--------|
| 41 | Dashboard with key metrics (active offers, pending approvals, recent bids) | Suggested enhancement |
| 42 | Bulk bid operations (approve/reject multiple at once) | Suggested enhancement |
| 43 | Advanced search and filtering across all entities | Suggested enhancement |
| 44 | Email notifications on approval status changes | Suggested enhancement |
| 45 | Data export API for future external consumption | Suggested enhancement |
| 46 | User activity log (who logged in when) | Suggested enhancement |

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
| Partial/split allocation business rules unclear | High | High | +24-40 hrs | Define rules with Product Owners before coding |
| CSV upload edge cases (bad data, large files) | Medium | Medium | +8-16 hrs | Define validation rules upfront; limit file sizes |
| Azure infra not available on time | Medium | High | Blocks 1-2 weeks | Confirm access before Sprint 1 |
| Scope creep from 3 Product Owners | Medium | High | +40-80 hrs | Reference charter; change request process |

---

## Summary

| Concept | Hours |
|---------|-------|
| MVP (Must Have) — with Auth Option A: Azure AD Groups | ~806 hrs |
| MVP (Must Have) — with Auth Option B: Internal DB Roles | ~830 hrs |
| Post-MVP (Should Have) | ~117 hrs |
| Learning Curve | ~56 hrs |
| **Full Scope (MVP + Post-MVP + Learning) — Auth Option A** | **~980 hrs** |
| **Full Scope (MVP + Post-MVP + Learning) — Auth Option B** | **~1,003 hrs** |

*Note: Act-on-Behalf and Split Allocations were moved to MVP because the client explicitly requested them. Post-MVP now contains only suggested enhancements. Total project hours remain similar — the distribution shifted toward MVP.*

### Timeline Scenarios — Auth Option A (2 developers, 8 hrs/day each = 80 hrs/week)

| Scenario | Scope | Hours | Working Weeks | Calendar Estimate |
|----------|-------|-------|---------------|-------------------|
| MVP only | Must Have + Learning | ~862 hrs | ~11 weeks | ~2.75 months |
| MVP + Post-MVP | Full Phase 1 | ~980 hrs | ~12 weeks | ~3 months |

### With 3 developers (120 hrs/week)

| Scenario | Scope | Hours | Working Weeks | Calendar Estimate |
|----------|-------|-------|---------------|-------------------|
| MVP only | Must Have + Learning | ~862 hrs | ~7 weeks | ~1.75 months |
| MVP + Post-MVP | Full Phase 1 | ~980 hrs | ~8 weeks | ~2 months |

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
| MVP Hours (Auth Option A) | ~918 hrs | ~806 hrs | Blazor saves ~112 hrs (12%) |
| Post-MVP Hours | ~126 hrs | ~117 hrs | Blazor saves ~9 hrs |
| Learning Curve | ~100 hrs | ~56 hrs | Blazor saves ~44 hrs (44% less) |
| **Total Hours (Auth Option A)** | **~1,144 hrs** | **~980 hrs** | **Blazor saves ~164 hrs (14%)** |
| MVP Timeline (2 devs) | ~13 weeks | ~11 weeks | Blazor ~2 weeks faster |
| Full Scope Timeline (2 devs) | ~14 weeks | ~12 weeks | Blazor ~2 weeks faster |
| MVP Timeline (3 devs) | ~8.5 weeks | ~7 weeks | Blazor ~1.5 weeks faster |
| Full Scope Timeline (3 devs) | ~9.5 weeks | ~8 weeks | Blazor ~1.5 weeks faster |
| In-cell editing quality | ⭐⭐⭐⭐⭐ AG Grid | ⭐⭐⭐⭐ MudBlazor | React has better grid |
| Future customer portal | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | React better long-term |
| Hiring future devs | ⭐⭐⭐⭐⭐ | ⭐⭐ | React market is larger |
| CI/CD complexity | Medium (2 deploys) | Low (1 deploy) | Blazor simpler |

**Bottom line:** Blazor saves ~160 hours and ~2 weeks on timeline. React costs more upfront but offers better in-cell editing, easier hiring, and a stronger path to a future customer portal.

---

## Team Sign-off

| Name | Role | Approved |
|------|------|----------|
| TBD | Simpat Lead | |
| TBD | Dev 1 | |
| TBD | Dev 2 | |
