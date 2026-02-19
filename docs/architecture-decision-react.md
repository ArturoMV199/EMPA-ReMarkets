# Architecture Decision: Bid Intelligence Platform
## Option A — React + .NET 10

## Project Context

Internal web application for REMarkets to manage sales-side bidding, offer creation, inventory allocation, and approval workflows. Replaces manual spreadsheet/email processes. Internal users only (no customer portal in Phase 1). Must integrate with Microsoft Entra for authentication. All data stored in clean, normalized SQL to support future analytics and AI use cases.

## Team

| Member | Role | Availability | Key Skills |
|--------|------|-------------|------------|
| Dev 1 (TBD) | Fullstack Developer | Full-time | .NET (assumed), React experience TBD |
| Dev 2 (TBD) | Fullstack Developer | Full-time | .NET (assumed), React experience TBD |
| Dev 3 (TBD) | Fullstack Developer | Possible addition | .NET (assumed), React experience TBD |
| Existing Dev | Support / Advisor | Part-time | .NET, familiar with Simpat/REMarkets systems |

## Requirements Summary

### Functional
- Bid & Offer Management with line-item in-cell editing
- Bulk inventory upload via CSV/Excel
- Inventory state tracking (Available, Committed, Released)
- Partial and split allocations across customers
- Aggregated allocation view with approval workflow
- Customer masquerade (act-on-behalf) with full audit attribution
- Role-based access (5 roles with different permissions)
- Configurable approval thresholds and escalation paths
- Order-ready exports (CSV/PDF)
- Immutable audit trail for all tracked actions

### Non-Functional
- **Performance:** In-cell editing must feel instant; allocation views must load within 2 seconds for large datasets
- **Scalability:** Must handle increased bid volume without failed transactions; modular for future phases
- **Security:** Microsoft Entra authentication, role-based access enforcement, data encryption in transit and at rest
- **Auditability:** Every action logged with user, timestamp, before/after values — immutable
- **Data Integrity:** Normalized SQL, enforced relationships, no manual reconciliation needed

## Final Architecture

### Platform
- **Type:** Web application (SPA + API)
- **Access:** Internal users via modern browsers
- **Offline:** Not required

### Frontend
- **Framework:** React 18+ with TypeScript
- **UI Component Library:** MUI (Material UI) or Ant Design (decision during sprint 0)
- **Data Grid:** AG Grid Community or MUI DataGrid Pro (for in-cell editing — critical feature)
- **State Management:** TanStack Query (server state) + Zustand (client state)
- **Build Tool:** Vite
- **Routing:** React Router v6+
- **Auth Integration:** MSAL.js (Microsoft Authentication Library for JavaScript) for Entra login
- **Export:** Client-side CSV generation; PDF via backend API

### Backend
- **Framework:** ASP.NET Core Web API (.NET 10)
- **Pattern:** Clean Architecture (simplified)
  - **API Layer** — Controllers, DTOs, middleware
  - **Application Layer** — Services, business logic, validation
  - **Domain Layer** — Entities, enums, interfaces
  - **Infrastructure Layer** — EF Core, external services, file handling
- **API Style:** REST with versioned endpoints (/api/v1/...)
- **Authentication:** Microsoft Entra ID via Microsoft.Identity.Web
- **Authorization:** Policy-based authorization mapping to 5 roles (Sales Rep, Sales Manager, Admin, Finance, Executive)
- **File Upload:** CSV/Excel parsing via EPPlus or ClosedXML
- **PDF Generation:** QuestPDF or iTextSharp for order-ready exports
- **Audit Logging:** Custom middleware + audit entity pattern (every tracked change writes to AuditLog table)
- **Masquerade:** Custom middleware that injects customer context into claims; all actions record internal user ID + customer ID

### Database
- **Engine:** Azure SQL Database
- **ORM:** Entity Framework Core 10
- **Approach:** Code-First with migrations
- **Key Entities:**
  - Users, Roles, Permissions
  - Customers, CustomerAssignments
  - Inventory, InventoryUploads
  - Offers, OfferLineItems
  - Bids, BidHistory
  - Allocations, AllocationApprovals
  - AuditLog (immutable — insert only, no updates/deletes)
  - ApprovalThresholds, SystemConfiguration
- **Indexes:** On frequently queried fields (OfferId, CustomerId, BidStatus, AllocationStatus, timestamps)
- **Soft Deletes:** Customers use deactivation, not deletion
- **Historical Retention:** All data retained indefinitely for analytics

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  React SPA (TypeScript)                                  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │    │
│  │  │ AG Grid  │ │ MUI/Ant  │ │ MSAL.js  │ │ TanStack  │  │    │
│  │  │ In-cell  │ │ UI Comps │ │ Entra    │ │ Query     │  │    │
│  │  │ Editing  │ │          │ │ Auth     │ │ State     │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │    │
│  └───────────────────────┬─────────────────────────────────┘    │
│                          │ HTTPS (REST API)                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                   AZURE APP SERVICE                              │
│  ┌───────────────────────┴─────────────────────────────────┐    │
│  │  ASP.NET Core Web API (.NET 10)                          │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │    │
│  │  │ API      │ │ Auth     │ │ Audit    │ │ Masquerade│  │    │
│  │  │ Control- │ │ Middle-  │ │ Middle-  │ │ Middle-   │  │    │
│  │  │ lers     │ │ ware     │ │ ware     │ │ ware      │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │    │
│  │  ┌──────────────────────────────────────────────────┐   │    │
│  │  │ Application Layer (Services, Business Logic)      │   │    │
│  │  └──────────────────────────────────────────────────┘   │    │
│  │  ┌──────────────────────────────────────────────────┐   │    │
│  │  │ Domain Layer (Entities, Enums, Interfaces)        │   │    │
│  │  └──────────────────────────────────────────────────┘   │    │
│  │  ┌──────────────────────────────────────────────────┐   │    │
│  │  │ Infrastructure (EF Core, File Parsing, PDF Gen)   │   │    │
│  │  └──────────────────────┬───────────────────────────┘   │    │
│  └─────────────────────────┼───────────────────────────────┘    │
│                            │                                     │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                    AZURE SQL DATABASE                            │
│  ┌─────────────────────────┴───────────────────────────────┐    │
│  │  Normalized SQL Schema                                   │    │
│  │  Users | Customers | Inventory | Offers | Bids           │    │
│  │  Allocations | AuditLog | Configuration                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│                    Clean, normalized SQL                         │
│                    Ready for future analytics consumption        │
└─────────────────────────────────────────────────────────────────┘
```

### Environments

| Environment | Purpose | App Service | Database |
|-------------|---------|-------------|----------|
| Development | Active development and integration testing | 1 × App Service | 1 × Azure SQL |
| Test | QA validation, UAT with Product Owners and Sales team | 1 × App Service | 1 × Azure SQL |
| Production | Live internal use | 1 × App Service | 1 × Azure SQL |

**⚠️ TBD: REMarkets likely has Azure infrastructure already configured. If environments already exist, we plug into them — no additional setup needed. Confirm with REMarkets IT what's available and what we need to provision.**

### CI/CD

- **Platform:** GitHub Actions (if repo is on GitHub) or Azure DevOps Pipelines (if client prefers)
- **Branch Strategy:** GitHub Flow (main + feature branches)
  - `main` → deploys to Production
  - `develop` → deploys to Development
  - `feature/*` → PRs into develop
- **Pipeline Steps:**
  1. Build → dotnet build + npm build
  2. Test → dotnet test + npm test
  3. Lint → ESLint (frontend) + dotnet format check (backend)
  4. Deploy → publish to Azure App Service
- **Secrets:** Azure Key Vault for connection strings, API keys, Entra config
- **IaC:** TBD — Bicep recommended if client wants reproducible environments

**⚠️ TBD: CI/CD platform depends on where REMarkets hosts their code (GitHub vs Azure DevOps). Confirm if existing pipelines/patterns exist that we should follow.**

### Team Responsibility Map

| Area | Owner | Backup |
|------|-------|--------|
| React Frontend | Dev 1 (TBD) | Dev 2 (TBD) |
| .NET API + Business Logic | Dev 2 (TBD) | Dev 1 (TBD) |
| Database / EF Core | Dev 2 (TBD) | Dev 1 (TBD) |
| CI/CD + Infrastructure | TBD (existing dev or one of the new devs) | TBD |
| QA / Testing | Sales Team + Product Owners | Dev team supports |
| UI/UX Design | Simpat (via prototype) | Product Owners validate |

*Note: With 2 fullstack devs, both should be able to work across frontend and backend. The split above is a primary focus suggestion, not a hard boundary.*

### Third-Party Services & Libraries

| Service/Library | Purpose | Cost |
|-----------------|---------|------|
| Microsoft Entra ID | Authentication + user management | Included in client's M365 |
| Azure App Service | Web hosting | Per environment |
| Azure SQL Database | Primary database | Per environment |
| Azure Key Vault | Secrets management | ~$0.03/10K operations |
| Azure Blob Storage | CSV/Excel upload storage (optional) | ~$5/mo |
| AG Grid Community | In-cell editing data grid | Free |
| MUI or Ant Design | UI component library | Free (Community) |
| EPPlus or ClosedXML | Excel/CSV parsing | Free (open source) |
| QuestPDF | PDF generation for order exports | Free (Community) |
| MSAL.js | Entra auth for React | Free (Microsoft) |

*If AG Grid Community doesn't cover all in-cell editing needs, AG Grid Enterprise costs ~$1,000/dev. This should be evaluated during Sprint 0.*

### Security

- **Authentication:** Microsoft Entra ID (OAuth 2.0 + OIDC)
- **Frontend:** MSAL.js handles login flow, acquires tokens
- **Backend:** Microsoft.Identity.Web validates JWT tokens on every request
- **Authorization:** Role claims from Entra mapped to app roles (Sales Rep, Sales Manager, Admin, Finance, Executive)
- **Data Encryption:** TLS 1.2+ in transit; Azure SQL TDE at rest
- **Masquerade Security:** Only authorized roles can activate; customer context injected as custom claim; all actions double-logged (actor + customer)
- **Audit Log:** Insert-only table; no UPDATE or DELETE permissions granted; timestamp + user + before/after values

## Risks & Considerations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Devs have no React experience | High — slow first 2-3 weeks | Budget learning curve hours; pair programming; use well-documented libraries |
| AG Grid Community insufficient for in-cell editing needs | Medium — may need Enterprise license ($1K/dev) | Evaluate during Sprint 0 with prototype data |
| Two separate deploys (frontend + API) | Low — more CI/CD complexity | Automated pipeline handles both; can co-host in same App Service |
| Azure access delays | High — blocks environment setup | Confirm access before Sprint 1; identify existing resources |
| Schema must support future analytics and customer portal | Medium — wrong schema = rework later | Design normalized SQL with future consumption in mind; document ER diagram thoroughly |
| TypeScript learning curve on top of React | Medium — adds time | Use strict but pragmatic TS config; don't over-type early |

## Skill Gaps

| Technology | Team Level (Assumed) | Action Needed |
|-----------|---------------------|---------------|
| .NET 10 / ASP.NET Core | Medium-High | Minor — team is .NET native |
| Entity Framework Core | Medium | Review EF Core 10 features, Code-First migrations |
| React + TypeScript | Low (TBD) | Learning curve budget: 20-40 hrs per dev |
| AG Grid | Low | Sprint 0 evaluation + training: 8-16 hrs per dev |
| Microsoft Entra / MSAL | Low-Medium | Integration guide + sample project: 8-16 hrs |
| Azure App Service + SQL | Medium (TBD) | Confirm existing infra knowledge; 8-16 hrs if new |
| CI/CD (GitHub Actions / Azure DevOps) | Low-Medium | Pipeline setup: 8-16 hrs |

## TBD Summary — Items That Affect Scope

| Item | Impact if Different | Who Needs to Answer |
|------|-------------------|-------------------|
| Azure environments already configured? | If yes: plug in, minimal setup. If no: +16-24 hrs provisioning | REMarkets IT |
| CI/CD platform (GitHub vs Azure DevOps) | Changes pipeline setup — same hours, different config | REMarkets IT / Simpat Lead |
| Dev team React experience | If zero: +40-80 hrs learning curve across team | Simpat Lead (after hiring) |
| AG Grid Community vs Enterprise | If Enterprise needed: +$2-3K license cost | Evaluated during Sprint 0 |
| IaC requirement (Bicep/Terraform) | If required: +16-24 hrs | REMarkets IT |
| Code repository location | Determines CI/CD tooling | REMarkets IT / Simpat Lead |
| Number of concurrent users expected | Affects App Service tier selection | REMarkets Product Owners |
| Existing Azure resources to leverage | Could reduce setup significantly | REMarkets IT |
