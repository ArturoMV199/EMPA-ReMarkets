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
| 4 | Setup | Environment configuration (Dev, Test, Prod) | Medium | 12 | ×1.5 | 18 | TBD — if infra exists, reduce to ~4 hrs |
| **Authentication & Authorization** | | | | | | | |
| 5 | Auth | Entra integration — Microsoft.Identity.Web (built-in Blazor) | Medium | 12 | ×1.5 | 18 | Simpler than MSAL.js — built-in support |
| 6 | Auth | Role-based authorization (5 roles: policies + [Authorize]) | Medium | 14 | ×1.5 | 21 | |
| 7 | Auth | AuthorizeView components (role-based UI rendering) | Low | 10 | ×1.2 | 12 | Built-in Blazor pattern |
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
| **Audit & Compliance** | | | | | | | |
| 26 | Audit | Audit logging middleware (insert-only AuditLog table) | Medium | 16 | ×1.5 | 24 | |
| 27 | Audit | Audit trail UI (view history per entity) | Medium | 14 | ×1.5 | 21 | |
| **Order-Ready Exports** | | | | | | | |
| 28 | Exports | CSV export from approved allocations | Low | 8 | ×1.2 | 10 | |
| **Permissions UI** | | | | | | | |
| 29 | Permissions | Role-based UI visibility (AuthorizeView across pages) | Medium | 14 | ×1.5 | 21 | |
| **Testing & Bug Buffer** | | | | | | | |
| 30 | QA | Unit tests (services + critical business logic) | Medium | 20 | ×1.5 | 30 | |
| 31 | QA | Integration tests (API/page endpoints) | Medium | 14 | ×1.5 | 21 | |
| 32 | QA | Bug fixing buffer (10% of MVP hours) | — | — | — | 63 | Based on total MVP |

| | | | | **MVP Total** | | **~686 hrs** | |

---

### Post-MVP Scope (Should Have)

Important features that can be delivered after MVP is stable.

| # | Module | Task | Complexity | Base Hrs | Factor | Adjusted | Notes |
|---|--------|------|------------|----------|--------|----------|-------|
| 33 | Masquerade | Customer masquerade — act-on-behalf capability | High | 24 | ×2.0 | 48 | Custom AuthenticationStateProvider |
| 34 | Masquerade | Masquerade UI (selector + visual indicator) | Medium | 10 | ×1.5 | 15 | |
| 35 | Allocation | Partial/split allocations across customers | High | 24 | ×2.0 | 48 | Complex business rules |
| 36 | Allocation | Escalation paths (auto-escalate if not approved in X time) | Medium | 16 | ×1.5 | 24 | |
| 37 | Exports | PDF export (order-ready documents) | Medium | 14 | ×1.5 | 21 | QuestPDF |
| 38 | Audit | Advanced audit views (filter by user, date, entity type) | Medium | 10 | ×1.5 | 15 | |
| 39 | Admin | System configuration UI (thresholds, settings) | Medium | 14 | ×1.5 | 21 | |
| 40 | QA | UAT support + bug fixes from user feedback | Medium | 24 | ×1.5 | 36 | |

| | | | | **Post-MVP Total** | | **~228 hrs** | |

---

### Backlog (Could Have)

| # | Task |
|---|------|
| 41 | Dashboard with key metrics (active offers, pending approvals, recent bids) |
| 42 | Bulk bid operations (approve/reject multiple at once) |
| 43 | Advanced search and filtering across all entities |
| 44 | Email notifications on approval status changes |
| 45 | Data export API for future external consumption |
| 46 | User activity log (who logged in when) |

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
| MVP (Must Have) | ~686 hrs |
| Post-MVP (Should Have) | ~228 hrs |
| Learning Curve | ~56 hrs |
| **Full Scope (MVP + Post-MVP + Learning)** | **~970 hrs** |

### Timeline Scenarios (2 developers, 8 hrs/day each = 80 hrs/week)

| Scenario | Scope | Hours | Working Weeks | Calendar Estimate |
|----------|-------|-------|---------------|-------------------|
| MVP only | Must Have + Learning | ~742 hrs | ~9.5 weeks | ~2.5 months |
| MVP + Post-MVP | Full Phase 1 | ~970 hrs | ~12 weeks | ~3 months |

### With 3 developers (120 hrs/week)

| Scenario | Scope | Hours | Working Weeks | Calendar Estimate |
|----------|-------|-------|---------------|-------------------|
| MVP only | Must Have + Learning | ~742 hrs | ~6 weeks | ~1.5 months |
| MVP + Post-MVP | Full Phase 1 | ~970 hrs | ~8 weeks | ~2 months |

*These timelines assume devs are productive from week 1 after learning curve. Actual ramp-up may add 1-2 weeks. Timelines do not include UAT cycles with client.*

---

## TBD Impact on Estimation

| Unknown | If Confirmed As... | Impact on Hours |
|---------|-------------------|-----------------|
| Azure environments exist | Yes — already provisioned | -14 hrs (task #4 drops to ~4 hrs) |
| Azure environments exist | No — must provision from scratch | +8-16 hrs |
| 3rd developer available | Yes | Timeline compresses ~30% |
| 3rd developer available | No | Timeline stays at 2-dev scenario |
| MudBlazor DataGrid sufficient | No — need Telerik/Syncfusion | +$1-2K license, +8-16 hrs integration |
| IaC required (Bicep) | Yes | +16-24 hrs |

---

## Head-to-Head: React vs Blazor Estimation

| Metric | React + .NET 10 | Blazor Web App + .NET 10 | Difference |
|--------|----------------|-------------------------|------------|
| MVP Hours | ~790 hrs | ~686 hrs | Blazor saves ~104 hrs (13%) |
| Post-MVP Hours | ~240 hrs | ~228 hrs | Blazor saves ~12 hrs |
| Learning Curve | ~100 hrs | ~56 hrs | Blazor saves ~44 hrs (44% less) |
| **Total Hours** | **~1,130 hrs** | **~970 hrs** | **Blazor saves ~160 hrs (14%)** |
| MVP Timeline (2 devs) | ~11 weeks | ~9.5 weeks | Blazor ~1.5 weeks faster |
| Full Scope Timeline (2 devs) | ~14 weeks | ~12 weeks | Blazor ~2 weeks faster |
| MVP Timeline (3 devs) | ~7.5 weeks | ~6 weeks | Blazor ~1.5 weeks faster |
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
