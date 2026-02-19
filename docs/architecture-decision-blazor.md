# Architecture Decision: Bid Intelligence Platform
## Option B — Blazor Web App + .NET 10

## Project Context

Internal web application for REMarkets to manage sales-side bidding, offer creation, inventory allocation, and approval workflows. Replaces manual spreadsheet/email processes. Internal users only (no customer portal in Phase 1). Must integrate with Microsoft Entra for authentication. All data stored in clean, normalized SQL to support future analytics and AI use cases.

## Team

| Member | Role | Availability | Key Skills |
|--------|------|-------------|------------|
| Dev 1 (TBD) | Fullstack Developer | Full-time | .NET (assumed) |
| Dev 2 (TBD) | Fullstack Developer | Full-time | .NET (assumed) |
| Dev 3 (TBD) | Fullstack Developer | Possible addition | .NET (assumed) |
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
- **Type:** Web application (Blazor Web App — server-rendered + interactive components)
- **Access:** Internal users via modern browsers
- **Offline:** Not required

### Frontend + Backend (Unified)
- **Framework:** Blazor Web App (.NET 10) — unified C# codebase
- **Render Modes:**
  - Static SSR for pages that don't need interactivity (login, settings, dashboards)
  - Interactive Server (SignalR) for pages that need real-time editing (bid tables, allocation views)
- **UI Component Library:** MudBlazor or Radzen Blazor (both free, both have DataGrid with editing)
- **Data Grid:** MudBlazor DataGrid or Radzen DataGrid (for in-cell editing)
- **State Management:** Cascading parameters + scoped services (built-in Blazor patterns)
- **Auth Integration:** Microsoft.Identity.Web + Blazor auth components (built-in)
- **Export:** CSV generation via backend; PDF via QuestPDF

### Backend (Same Project)
- **Framework:** ASP.NET Core (.NET 10) — Blazor Web App hosts the API internally
- **Pattern:** Clean Architecture (simplified)
  - **Web Layer** — Blazor pages/components, API endpoints (if needed for future integrations)
  - **Application Layer** — Services, business logic, validation
  - **Domain Layer** — Entities, enums, interfaces
  - **Infrastructure Layer** — EF Core, external services, file handling
- **API:** Minimal APIs or Controllers for any external-facing endpoints (data export, future integrations)
- **Authentication:** Microsoft Entra ID via Microsoft.Identity.Web (built-in Blazor auth support)
- **Authorization:** Policy-based authorization mapping to 5 roles
- **File Upload:** CSV/Excel parsing via EPPlus or ClosedXML
- **PDF Generation:** QuestPDF for order-ready exports
- **Audit Logging:** Custom middleware + audit entity pattern
- **Masquerade:** Custom auth state provider that injects customer context; all actions record internal user ID + customer ID

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
│  │  Blazor Web App (rendered HTML + SignalR for interactive) │    │
│  │                                                          │    │
│  │  Static SSR pages ←── Server renders full HTML           │    │
│  │  Interactive pages ←── SignalR real-time connection       │    │
│  └───────────────────────┬─────────────────────────────────┘    │
│                          │ HTTPS + SignalR (WebSocket)            │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                   AZURE APP SERVICE                              │
│  ┌───────────────────────┴─────────────────────────────────┐    │
│  │  ASP.NET Core + Blazor Web App (.NET 10)                 │    │
│  │  ┌──────────────────────────────────────────────────┐   │    │
│  │  │ Blazor Pages & Components (UI)                    │   │    │
│  │  │ ┌──────────┐ ┌──────────┐ ┌──────────┐         │   │    │
│  │  │ │ MudBlazor│ │ Auth     │ │ Masq.    │         │   │    │
│  │  │ │ DataGrid │ │ State    │ │ Provider │         │   │    │
│  │  │ └──────────┘ └──────────┘ └──────────┘         │   │    │
│  │  └──────────────────────────────────────────────────┘   │    │
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

### Key Difference vs React Option

```
React Option:                          Blazor Option:
┌──────────┐    ┌──────────┐          ┌─────────────────────────┐
│ React    │───▶│ .NET API │          │ Blazor Web App (.NET)   │
│ (TypeScript)  │ (C#)     │          │ UI + API + Logic        │
│ Separate │    │ Separate │          │ ALL C# — Single Project │
│ Project  │    │ Project  │          │ Single Deploy           │
└──────────┘    └──────────┘          └─────────────────────────┘
  2 deploys      2 codebases             1 deploy, 1 codebase
```

### Environments

| Environment | Purpose | App Service | Database |
|-------------|---------|-------------|----------|
| Development | Active development and integration testing | 1 × App Service | 1 × Azure SQL |
| Test | QA validation, UAT with Product Owners and Sales team | 1 × App Service | 1 × Azure SQL |
| Production | Live internal use | 1 × App Service | 1 × Azure SQL |

**⚠️ TBD: REMarkets likely has Azure infrastructure already configured. If environments already exist, we plug into them — no additional setup needed. Confirm with REMarkets IT what's available and what we need to provision.**

### CI/CD

- **Platform:** GitHub Actions or Azure DevOps Pipelines (TBD)
- **Branch Strategy:** GitHub Flow (main + feature branches)
- **Pipeline Steps:**
  1. Build → dotnet build (single project builds everything)
  2. Test → dotnet test
  3. Lint → dotnet format check
  4. Deploy → publish to Azure App Service
- **Secrets:** Azure Key Vault
- **Advantage vs React:** Simpler pipeline — single dotnet publish produces the entire app

**⚠️ TBD: CI/CD platform depends on where REMarkets hosts their code (GitHub vs Azure DevOps). Confirm if existing pipelines/patterns exist that we should follow.**

### Team Responsibility Map

| Area | Owner | Backup |
|------|-------|--------|
| Blazor UI / Components | Dev 1 (TBD) | Dev 2 (TBD) |
| Business Logic / Services | Dev 2 (TBD) | Dev 1 (TBD) |
| Database / EF Core | Dev 2 (TBD) | Dev 1 (TBD) |
| CI/CD + Infrastructure | TBD (existing dev or one of the new devs) | TBD |
| QA / Testing | Sales Team + Product Owners | Dev team supports |
| UI/UX Design | Simpat (via prototype) | Product Owners validate |

### Third-Party Services & Libraries

| Service/Library | Purpose | Cost |
|-----------------|---------|------|
| Microsoft Entra ID | Authentication + user management | Included in client's M365 |
| Azure App Service | Web hosting | Per environment |
| Azure SQL Database | Primary database | Per environment |
| Azure Key Vault | Secrets management | ~$0.03/10K operations |
| Azure Blob Storage | CSV/Excel upload storage (optional) | ~$5/mo |
| MudBlazor | UI components + DataGrid with editing | Free (MIT) |
| EPPlus or ClosedXML | Excel/CSV parsing | Free (open source) |
| QuestPDF | PDF generation for order exports | Free (Community) |
| Microsoft.Identity.Web | Entra auth (built-in) | Free (Microsoft) |

### Security

- **Authentication:** Microsoft Entra ID (OAuth 2.0 + OIDC) via built-in Blazor auth
- **Authorization:** AuthorizeView components + policy-based [Authorize] attributes
- **Data Encryption:** TLS 1.2+ in transit; Azure SQL TDE at rest
- **Masquerade Security:** Custom AuthenticationStateProvider; customer context as claim; all actions double-logged
- **Audit Log:** Insert-only table; no UPDATE or DELETE permissions; timestamp + user + before/after values
- **SignalR Security:** Connections authenticated via Entra token; auto-reconnect on disconnect

## Risks & Considerations

| Risk | Impact | Mitigation |
|------|--------|------------|
| MudBlazor DataGrid may not cover all in-cell editing needs | Medium — may need Telerik or Syncfusion ($$$) | Evaluate during Sprint 0 with real bid data structure |
| SignalR connection drops (network issues) | Medium — users lose interactivity temporarily | Blazor has built-in reconnection UI; ensure graceful handling |
| Blazor community smaller than React | Medium — fewer StackOverflow answers | MudBlazor has good docs and Discord; Microsoft docs are solid |
| Future customer portal harder with Blazor | Low for Phase 1, Medium long-term | Can add WASM render mode later; or build portal as separate React app |
| Fewer devs in market know Blazor | Medium — hiring harder | Offset by lower learning curve for .NET devs |
| Azure access delays | High — blocks everything | Confirm access before Sprint 1; identify existing resources |
| Schema must support future analytics and customer portal | Medium | Design normalized SQL with future consumption in mind; document ER diagram thoroughly |

## Skill Gaps

| Technology | Team Level (Assumed) | Action Needed |
|-----------|---------------------|---------------|
| .NET 10 / ASP.NET Core | Medium-High | Minor — team is .NET native |
| Entity Framework Core | Medium | Review EF Core 10, Code-First migrations |
| Blazor Components | Low-Medium | Learning curve: 8-16 hrs per dev (lower than React) |
| MudBlazor | Low | Component exploration: 4-8 hrs per dev |
| Microsoft Entra / Identity.Web | Low-Medium | Built-in Blazor auth is simpler than MSAL.js: 4-8 hrs |
| Azure App Service + SQL | Medium (TBD) | Confirm existing knowledge: 8-16 hrs if new |
| CI/CD | Low-Medium | Pipeline setup: 4-8 hrs (simpler than React — single project) |

## TBD Summary — Items That Affect Scope

| Item | Impact if Different | Who Needs to Answer |
|------|-------------------|-------------------|
| Azure environments already configured? | If yes: plug in, minimal setup. If no: +16-24 hrs provisioning | REMarkets IT |
| CI/CD platform (GitHub vs Azure DevOps) | Changes pipeline config — same hours | REMarkets IT / Simpat Lead |
| MudBlazor DataGrid sufficient? | If not: Telerik ~$1K/dev or Syncfusion ~$1K/dev | Evaluated during Sprint 0 |
| Number of concurrent users | Affects SignalR connection capacity and App Service tier | REMarkets Product Owners |
| IaC requirement (Bicep/Terraform) | If required: +16-24 hrs | REMarkets IT |
| Code repository location | Determines CI/CD tooling | REMarkets IT / Simpat Lead |
| Existing Azure resources to leverage | Could reduce setup significantly | REMarkets IT |

## Head-to-Head: Blazor vs React for This Project

| Factor | React (.NET 10 API) | Blazor Web App (.NET 10) |
|--------|--------------------|-----------------------|
| Time to first working screen | ~3-4 weeks (learning + setup) | ~1-2 weeks |
| Dev learning curve | High (React + TS + ecosystem) | Low-Medium (Blazor components) |
| In-cell editing quality | ⭐⭐⭐⭐⭐ (AG Grid is best-in-class) | ⭐⭐⭐⭐ (MudBlazor is good, not as mature) |
| Codebase complexity | Two projects, two languages | One project, one language |
| CI/CD complexity | Two builds, two deploys | One build, one deploy |
| Future customer portal | ⭐⭐⭐⭐⭐ (React is ideal) | ⭐⭐⭐ (possible but harder) |
| Hiring future devs | ⭐⭐⭐⭐⭐ (React market is huge) | ⭐⭐ (Blazor market is small) |
| Community/support | ⭐⭐⭐⭐⭐ (massive) | ⭐⭐⭐ (growing) |
| Total estimated dev hours | Higher (~15-20% more) | Lower (baseline) |
| Long-term flexibility | Higher | Lower |
