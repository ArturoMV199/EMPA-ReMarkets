# Estimation: Bid Intelligence Platform
## Option A — React + .NET 10

## Scope Summary

Internal web application for REMarkets to replace spreadsheet/email-based bidding workflows. Covers bid management, inventory handling, allocation approvals, role-based access, act-on-behalf, audit trails, and order-ready exports. Authentication via Microsoft Entra. All data stored in clean, normalized SQL for future analytics consumption.

## Architecture Summary

- **Frontend:** React 18+ (TypeScript) with AG Grid for in-cell editing, MUI or Ant Design for UI components
- **Backend:** ASP.NET Core Web API (.NET 10), Clean Architecture, REST API
- **Database:** Azure SQL Database with Entity Framework Core 10 (Code-First)
- **Auth:** Microsoft Entra ID (MSAL.js frontend + Microsoft.Identity.Web backend)
- **Hosting:** Azure App Service (3 environments: Dev, Test, Prod — TBD if already provisioned)
- **Deploy:** Two projects (React SPA + .NET API)

## Data Grid Library Options (In-Cell Editing — Core Feature)

The in-cell editing grid is the most critical UI component — it's where sales reps enter bids, quantities, and prices directly in a table (like Excel in the browser). Without this, every edit requires opening a separate form per line item.

| Library | License | Cost | In-Cell Editing | Notes |
|---------|---------|------|----------------|-------|
| **AG Grid Community** ⭐ Recommended start | MIT (free, open source, use for anything) | $0 | ⭐⭐⭐⭐ Very good | Most popular React grid, huge community |
| **AG Grid Enterprise** | Commercial (paid license) | ~$1,100/dev one-time | ⭐⭐⭐⭐⭐ Best-in-class | Adds grouping, aggregation, Excel export, pivoting |
| **MUI DataGrid Pro** | Commercial (paid license) | ~$600/dev/year | ⭐⭐⭐⭐ Good | Part of MUI ecosystem, good if already using MUI |
| **MUI DataGrid Community** | MIT (free, open source) | $0 | ⭐⭐⭐ Basic | Limited editing features in free tier |
| **TanStack Table** | MIT (free, open source) | $0 | ⭐⭐⭐ Headless (build your own UI) | Maximum flexibility but more dev hours — you build the UI |
| **Manual (jQuery/vanilla JS)** | N/A | $0 | ⭐⭐ Painful | Possible but high development hours and maintenance cost |

**Recommendation:** Start with AG Grid Community (free, MIT). If during Sprint 0 the team needs Enterprise features (Excel export, row grouping), upgrade (~$1,100/dev × 2-3 devs = $2-3K). React's grid ecosystem is the strongest of any frontend framework.

**Why AG Grid over manual?** Building a production-quality in-cell editing grid from scratch takes 100+ hours. AG Grid Community does it out of the box for free.

## MVP Definition

**Core question:** Can REMarkets run 100% of internal bid-to-allocation workflows through the platform instead of spreadsheets and email?

**MVP goal:** A working web application where sales reps can create offers, enter bids, upload inventory, and route allocations through an approval workflow — with full audit logging and role-based access.

---

### MVP Scope (Must Have)

Without these, the project fails to replace the current spreadsheet/email process.

| # | Module | Task | Complexity | Base Hrs | Factor | Adjusted | Notes |
|---|--------|------|------------|----------|--------|----------|-------|
| **Project Setup** | | | | | | | |
| 1 | Setup | React project scaffolding (Vite + TS + routing + auth) | Medium | 16 | ×1.5 | 24 | New stack for team |
| 2 | Setup | .NET 10 API project scaffolding (Clean Architecture) | Low | 12 | ×1.2 | 14 | Team knows .NET |
| 3 | Setup | EF Core setup, initial migrations, seed data | Low | 12 | ×1.2 | 14 | |
| 4 | Setup | CI/CD pipeline (build + test + deploy for both projects) | Medium | 16 | ×1.5 | 24 | Two projects to deploy |
| 5 | Setup | Environment configuration (Dev, Test, Prod) | Low | 6 | ×1.2 | 7 | Confirmed — Azure environments exist, plug into existing infra |
| **Authentication & Authorization** | | | | | | | |
| | | **Option A: Azure AD Groups (Recommended)** | | | | | Roles managed in Azure AD — no user/role tables in app DB |
| 6 | Auth | Entra integration — MSAL.js (React login/logout/token) | High | 16 | ×2.0 | 32 | MSAL.js is complex for first-timers |
| 7 | Auth | Entra integration — Microsoft.Identity.Web (API validation) | Medium | 12 | ×1.5 | 18 | |
| 8 | Auth | Azure AD Group setup + group claims mapping (5 groups: Sales Rep, Sales Manager, Admin, Finance, Executive) | Medium | 12 | ×1.5 | 18 | Configure groups in Azure AD, map to app roles via token claims |
| 9 | Auth | Dynamic role-based authorization (policies + middleware reading AD group claims) | Medium | 16 | ×1.5 | 24 | UI and API both enforce roles from AD groups |
| 10 | Auth | Protected routes in React (dynamic role-based UI rendering from AD claims) | Medium | 14 | ×1.5 | 21 | Show/hide/disable UI elements based on group membership |
| | | **Auth Option A subtotal** | | | | **113 hrs** | |
| | | | | | | | |
| | | **Option B: Internal DB Roles (If Azure AD groups not available)** | | | | | Roles managed in app DB — requires Users + UserRoles tables + admin UI |
| 6b | Auth | Entra integration — MSAL.js (login only, no group claims) | High | 16 | ×2.0 | 32 | Login via Entra but roles stored internally |
| 7b | Auth | Entra integration — Microsoft.Identity.Web (API validation) | Medium | 12 | ×1.5 | 18 | |
| 8b | Auth | Users + UserRoles tables + EF Core setup | Medium | 12 | ×1.5 | 18 | DB schema for role management |
| 9b | Auth | Role assignment admin UI (assign/remove roles per user) | Medium | 16 | ×1.5 | 24 | Admin-only screen to manage user roles |
| 10b | Auth | Role-based authorization middleware (read from DB) | Medium | 16 | ×1.5 | 24 | |
| 11b | Auth | Protected routes in React (role-based UI rendering from DB roles) | Medium | 14 | ×1.5 | 21 | |
| | | **Auth Option B subtotal** | | | | **137 hrs** | +24 hrs vs Option A |
| **Customer Management** | | | | | | | |
| 10 | Customers | Customer CRUD (API + React pages) | Low | 16 | ×1.2 | 19 | Standard CRUD |
| 11 | Customers | Customer assignment to Sales Reps/Managers | Low | 8 | ×1.2 | 10 | |
| 12 | Customers | Customer deactivation (soft delete) + audit logging | Low | 8 | ×1.2 | 10 | |
| **Inventory Management** | | | | | | | |
| 13 | Inventory | Bulk CSV/Excel upload (parsing + validation + error handling) | High | 24 | ×2.0 | 48 | File parsing edge cases |
| 14 | Inventory | Inventory list view with state tracking (Available/Committed/Released) | Medium | 16 | ×1.5 | 24 | |
| 15 | Inventory | Inventory grouping into offers | Medium | 12 | ×1.5 | 18 | |
| 16 | Inventory | State transitions (automatic on approval + manual override) | Medium | 16 | ×1.5 | 24 | Business rules complexity |
| **Bid & Offer Management** | | | | | | | |
| 17 | Bids | Create/Edit offers (API + React form) | Medium | 16 | ×1.5 | 24 | |
| 18 | Bids | Offer list view with filtering and sorting | Medium | 12 | ×1.5 | 18 | |
| 19 | Bids | AG Grid integration — in-cell editing for line-item bids | High | 32 | ×2.0 | 64 | Core feature, AG Grid learning curve |
| 20 | Bids | Bid types support (bid/BIN/target pricing) | Medium | 12 | ×1.5 | 18 | |
| 21 | Bids | Winning/losing bid capture and status tracking | Medium | 12 | ×1.5 | 18 | |
| 22 | Bids | Bid history (view previous values per line item) | Medium | 16 | ×1.5 | 24 | |
| **Allocation & Approval Workflow** | | | | | | | |
| 23 | Allocation | Aggregated allocation view (all bids per offer) | Medium | 16 | ×1.5 | 24 | |
| 24 | Allocation | Admin override of winning customer | Medium | 12 | ×1.5 | 18 | |
| 25 | Allocation | Approval workflow (Pending → Approved/Rejected) | High | 24 | ×2.0 | 48 | State machine + notifications |
| 26 | Allocation | Approval thresholds (configurable per role) | Medium | 16 | ×1.5 | 24 | |
| 27 | Allocation | Automatic inventory commitment on approval | Medium | 12 | ×1.5 | 18 | |
| **Act-on-Behalf (Sales enters bids for customers)** | | | | | | | Client-requested — Kim: "very important", needed from day 1 since Phase 1 is internal only |
| 28 | Act-on-Behalf | Act-on-behalf capability — sales rep enters bids on behalf of a customer with full attribution | High | 24 | ×2.0 | 48 | Custom claims + double audit logging; tracks who acted + for whom |
| 29 | Act-on-Behalf | Act-on-behalf UI (customer selector + visual indicator showing active customer context) | Medium | 12 | ×1.5 | 18 | Clear visual cue that rep is acting for customer |
| **Split Allocations** | | | | | | | Client-requested — Kim: "we do want to be able to support split allocations" |
| 30 | Allocation | Partial/split allocations across customers (divide quantity of a line item between multiple winners) | High | 24 | ×2.0 | 48 | Manual decision by manager, not automated |
| **Audit & Compliance** | | | | | | | |
| 31 | Audit | Audit logging middleware (insert-only AuditLog table) | Medium | 16 | ×1.5 | 24 | |
| 32 | Audit | Audit trail UI (view history per entity) | Medium | 16 | ×1.5 | 24 | |
| **Order-Ready Exports** | | | | | | | |
| 33 | Exports | CSV export from approved allocations | Low | 8 | ×1.2 | 10 | |
| **Permissions UI** | | | | | | | |
| 34 | Permissions | Role-based UI visibility (hide/show/disable per role) | Medium | 16 | ×1.5 | 24 | Across all pages |
| **Testing & Bug Buffer** | | | | | | | |
| 35 | QA | Unit tests (API services + critical business logic) | Medium | 24 | ×1.5 | 36 | |
| 36 | QA | Integration tests (API endpoints) | Medium | 16 | ×1.5 | 24 | |
| 37 | QA | Bug fixing buffer (10% of MVP hours) | — | — | — | 88 | Based on total MVP |

| | | | | **MVP Total** | | **~918 hrs** | |

---

### Post-MVP Scope (Should Have)

Features that add value after MVP is stable. Labeled as client-requested or suggested enhancement.

| # | Module | Task | Complexity | Base Hrs | Factor | Adjusted | Source |
|---|--------|------|------------|----------|--------|----------|--------|
| 38 | Allocation | Escalation paths (auto-escalate if not approved in X time) | Medium | 16 | ×1.5 | 24 | Suggested enhancement |
| 39 | Exports | PDF export (order-ready documents via QuestPDF or iTextSharp) | Medium | 16 | ×1.5 | 24 | Client mentioned "order-ready exports" — CSV is in MVP, PDF is extra |
| 40 | Audit | Advanced audit views (filter by user, date, entity type) | Medium | 12 | ×1.5 | 18 | Suggested enhancement |
| 41 | Admin | System configuration UI (thresholds, settings — avoid hardcoding) | Medium | 16 | ×1.5 | 24 | Suggested enhancement |
| 42 | QA | UAT support + bug fixes from user feedback | Medium | 24 | ×1.5 | 36 | Standard |

| | | | | **Post-MVP Total** | | **~126 hrs** | |

---

### Backlog (Could Have)

| # | Task | Source |
|---|------|--------|
| 43 | Dashboard with key metrics (active offers, pending approvals, recent bids) | Suggested enhancement |
| 44 | Bulk bid operations (approve/reject multiple at once) | Suggested enhancement |
| 45 | Advanced search and filtering across all entities | Suggested enhancement |
| 46 | Email notifications on approval status changes | Suggested enhancement |
| 47 | Data export API for future external consumption | Suggested enhancement |
| 48 | User activity log (who logged in when) | Suggested enhancement |

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
| React + TypeScript fundamentals | Dev 1 | 24 | Components, hooks, state, routing, TS basics |
| React + TypeScript fundamentals | Dev 2 | 24 | Same |
| AG Grid (in-cell editing) | Dev 1 | 12 | Grid API, cell editors, event handling |
| AG Grid (in-cell editing) | Dev 2 | 8 | Support knowledge |
| MSAL.js (Entra auth in React) | Dev 1 | 8 | Token acquisition, protected routes |
| Microsoft.Identity.Web | Dev 2 | 8 | API token validation, role claims |
| Azure App Service + SQL (if new) | Both | 8 | Deployment, connection strings, config |
| CI/CD pipeline setup | TBD | 8 | GitHub Actions or Azure DevOps |
| **Learning Curve Total** | | **100 hrs** | |

---

## Risk Assessment

| Risk | Probability | Impact | Hours at Risk | Mitigation |
|------|-------------|--------|---------------|------------|
| React learning curve exceeds budget | Medium | High | +40-80 hrs | Pair programming, starter templates, existing dev mentoring |
| AG Grid Community insufficient | Medium | Medium | +$2-3K cost (no hour impact) | Evaluate in Sprint 0; budget for Enterprise license |
| Entra integration complexity | Medium | Medium | +16-24 hrs | Use Microsoft quickstart templates |
| Partial/split allocation business rules unclear | High | High | +24-40 hrs | Define rules with Product Owners before coding |
| CSV upload edge cases (bad data, large files) | Medium | Medium | +8-16 hrs | Define validation rules upfront; limit file sizes |
| Azure infra not available on time | Medium | High | Blocks 1-2 weeks | Confirm access before Sprint 1 |
| Scope creep from 3 Product Owners | Medium | High | +40-80 hrs | Reference charter; change request process |

---

## Summary

| Concept | Hours |
|---------|-------|
| MVP (Must Have) — with Auth Option A: Azure AD Groups | ~918 hrs |
| MVP (Must Have) — with Auth Option B: Internal DB Roles | ~942 hrs |
| Post-MVP (Should Have) | ~126 hrs |
| Learning Curve | ~100 hrs |
| **Full Scope (MVP + Post-MVP + Learning) — Auth Option A** | **~1,144 hrs** |
| **Full Scope (MVP + Post-MVP + Learning) — Auth Option B** | **~1,168 hrs** |

*Note: Act-on-Behalf and Split Allocations were moved to MVP because the client explicitly requested them. Post-MVP now contains only suggested enhancements. Total project hours remain similar — the distribution shifted toward MVP.*

### Timeline Scenarios — Auth Option A (2 developers, 8 hrs/day each = 80 hrs/week)

| Scenario | Scope | Hours | Working Weeks | Calendar Estimate |
|----------|-------|-------|---------------|-------------------|
| MVP only | Must Have + Learning | ~1,018 hrs | ~13 weeks | ~3.25 months |
| MVP + Post-MVP | Full Phase 1 | ~1,144 hrs | ~14 weeks | ~3.5 months |

### With 3 developers (120 hrs/week)

| Scenario | Scope | Hours | Working Weeks | Calendar Estimate |
|----------|-------|-------|---------------|-------------------|
| MVP only | Must Have + Learning | ~1,018 hrs | ~8.5 weeks | ~2 months |
| MVP + Post-MVP | Full Phase 1 | ~1,144 hrs | ~9.5 weeks | ~2.5 months |

*Auth Option B adds ~24 hrs to all scenarios. Timelines assume devs are productive from week 1 after learning curve. Actual ramp-up may add 1-2 weeks. Timelines do not include UAT cycles with client.*

---

## TBD Impact on Estimation

| Unknown | If Confirmed As... | Impact on Hours |
|---------|-------------------|--------------------|
| Auth approach: Azure AD Groups vs Internal DB roles | Option A: Azure AD Groups (recommended) | Auth section = 113 hrs (baseline) |
| Auth approach: Azure AD Groups vs Internal DB roles | Option B: Internal DB roles + admin UI | Auth section = 137 hrs (+24 hrs vs Option A) |
| Dev team has React experience | Yes — some experience | -48 hrs (learning curve cuts in half) |
| Dev team has React experience | No — zero experience | Estimate stands as-is |
| 3rd developer available | Yes | Timeline compresses ~30% |
| 3rd developer available | No | Timeline stays at 2-dev scenario |
| AG Grid Community sufficient | No — need Enterprise | +$2-3K license, no hour change |
| Automated infrastructure setup required (Azure Bicep scripts to create environments via code instead of manually through Azure Portal) | Yes | +16-24 hrs |

---

## Team Sign-off

| Name | Role | Approved |
|------|------|----------|
| TBD | Simpat Lead | |
| TBD | Dev 1 | |
| TBD | Dev 2 | |
