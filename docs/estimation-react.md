# Estimation: Bid Intelligence Platform
## Option A — React + .NET 10

## Scope Summary

Internal web application for REMarkets to replace spreadsheet/email-based bidding workflows. Covers bid management, inventory handling, allocation approvals, role-based access, customer masquerade, audit trails, and order-ready exports. Authentication via Microsoft Entra. Data exposed for downstream Fabric/Power BI analytics.

## Architecture Summary

- **Frontend:** React 18+ (TypeScript) with AG Grid for in-cell editing, MUI or Ant Design for UI components
- **Backend:** ASP.NET Core Web API (.NET 10), Clean Architecture, REST API
- **Database:** Azure SQL Database with Entity Framework Core 10 (Code-First)
- **Auth:** Microsoft Entra ID (MSAL.js frontend + Microsoft.Identity.Web backend)
- **Hosting:** Azure App Service (3 environments: Dev, Test, Prod — TBD if already provisioned)
- **Deploy:** Two projects (React SPA + .NET API)

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
| 5 | Setup | Environment configuration (Dev, Test, Prod) | Medium | 12 | ×1.5 | 18 | TBD — if infra exists, reduce to ~4 hrs |
| **Authentication & Authorization** | | | | | | | |
| 6 | Auth | Entra integration — MSAL.js (React login/logout/token) | High | 16 | ×2.0 | 32 | MSAL.js is complex for first-timers |
| 7 | Auth | Entra integration — Microsoft.Identity.Web (API validation) | Medium | 12 | ×1.5 | 18 | |
| 8 | Auth | Role-based authorization (5 roles: policies + middleware) | Medium | 16 | ×1.5 | 24 | |
| 9 | Auth | Protected routes in React (role-based UI rendering) | Medium | 12 | ×1.5 | 18 | |
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
| **Audit & Compliance** | | | | | | | |
| 28 | Audit | Audit logging middleware (insert-only AuditLog table) | Medium | 16 | ×1.5 | 24 | |
| 29 | Audit | Audit trail UI (view history per entity) | Medium | 16 | ×1.5 | 24 | |
| **Order-Ready Exports** | | | | | | | |
| 30 | Exports | CSV export from approved allocations | Low | 8 | ×1.2 | 10 | |
| **Permissions UI** | | | | | | | |
| 31 | Permissions | Role-based UI visibility (hide/show/disable per role) | Medium | 16 | ×1.5 | 24 | Across all pages |
| **Testing & Bug Buffer** | | | | | | | |
| 32 | QA | Unit tests (API services + critical business logic) | Medium | 24 | ×1.5 | 36 | |
| 33 | QA | Integration tests (API endpoints) | Medium | 16 | ×1.5 | 24 | |
| 34 | QA | Bug fixing buffer (10% of MVP hours) | — | — | — | 72 | Based on total MVP |

| | | | | **MVP Total** | | **~790 hrs** | |

---

### Post-MVP Scope (Should Have)

Important features that can be delivered after MVP is stable.

| # | Module | Task | Complexity | Base Hrs | Factor | Adjusted | Notes |
|---|--------|------|------------|----------|--------|----------|-------|
| 35 | Masquerade | Customer masquerade — act-on-behalf capability | High | 24 | ×2.0 | 48 | Custom claims + double audit logging |
| 36 | Masquerade | Masquerade UI (selector + visual indicator) | Medium | 12 | ×1.5 | 18 | |
| 37 | Allocation | Partial/split allocations across customers | High | 24 | ×2.0 | 48 | Complex business rules |
| 38 | Allocation | Escalation paths (auto-escalate if not approved in X time) | Medium | 16 | ×1.5 | 24 | |
| 39 | Exports | PDF export (order-ready documents) | Medium | 16 | ×1.5 | 24 | QuestPDF or iTextSharp |
| 40 | Audit | Advanced audit views (filter by user, date, entity type) | Medium | 12 | ×1.5 | 18 | |
| 41 | Admin | System configuration UI (thresholds, settings) | Medium | 16 | ×1.5 | 24 | |
| 42 | QA | UAT support + bug fixes from user feedback | Medium | 24 | ×1.5 | 36 | |

| | | | | **Post-MVP Total** | | **~240 hrs** | |

---

### Backlog (Could Have)

| # | Task |
|---|------|
| 43 | Dashboard with key metrics (active offers, pending approvals, recent bids) |
| 44 | Bulk bid operations (approve/reject multiple at once) |
| 45 | Advanced search and filtering across all entities |
| 46 | Email notifications on approval status changes |
| 47 | Data export API for analytics team direct consumption |
| 48 | User activity log (who logged in when) |

### Out of Scope (Won't Have)

- Customer-facing portal (future phase)
- In-app analytics dashboards (Fabric/Power BI separate workstream)
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
| MVP (Must Have) | ~790 hrs |
| Post-MVP (Should Have) | ~240 hrs |
| Learning Curve | ~100 hrs |
| **Full Scope (MVP + Post-MVP + Learning)** | **~1,130 hrs** |

### Timeline Scenarios (2 developers, 8 hrs/day each = 80 hrs/week)

| Scenario | Scope | Hours | Working Weeks | Calendar Estimate |
|----------|-------|-------|---------------|-------------------|
| MVP only | Must Have + Learning | ~890 hrs | ~11 weeks | ~3 months |
| MVP + Post-MVP | Full Phase 1 | ~1,130 hrs | ~14 weeks | ~3.5 months |

### With 3 developers (120 hrs/week)

| Scenario | Scope | Hours | Working Weeks | Calendar Estimate |
|----------|-------|-------|---------------|-------------------|
| MVP only | Must Have + Learning | ~890 hrs | ~7.5 weeks | ~2 months |
| MVP + Post-MVP | Full Phase 1 | ~1,130 hrs | ~9.5 weeks | ~2.5 months |

*These timelines assume devs are productive from week 1 after learning curve. Actual ramp-up may add 1-2 weeks. Timelines do not include UAT cycles with client.*

---

## TBD Impact on Estimation

| Unknown | If Confirmed As... | Impact on Hours |
|---------|-------------------|-----------------|
| Azure environments exist | Yes — already provisioned | -14 hrs (task #5 drops to ~4 hrs) |
| Azure environments exist | No — must provision from scratch | +8-16 hrs |
| Dev team has React experience | Yes — some experience | -48 hrs (learning curve cuts in half) |
| Dev team has React experience | No — zero experience | Estimate stands as-is |
| 3rd developer available | Yes | Timeline compresses ~30% |
| 3rd developer available | No | Timeline stays at 2-dev scenario |
| AG Grid Community sufficient | No — need Enterprise | +$2-3K license, no hour change |
| IaC required (Bicep) | Yes | +16-24 hrs |

---

## Team Sign-off

| Name | Role | Approved |
|------|------|----------|
| TBD | Simpat Lead | |
| TBD | Dev 1 | |
| TBD | Dev 2 | |
