# Azure Infrastructure — Architecture & Annual Cost Estimate

**ReMarkets — Bid Intelligence Platform | March 2026**

| Field | Detail |
|-------|--------|
| **Project** | ReMarkets - Bid Intelligence Platform |
| **Stack** | Blazor Web App + .NET 10 + Azure SQL + Microsoft Entra ID |
| **Auth** | Microsoft Entra ID (Azure AD Groups) - 5 App Roles |
| **Environments** | 2 - Pre-Production (Staging/UAT) and Production |
| **Users** | ~14+ internal users (based on identified stakeholders — actual count TBD) |
| **Hosting** | Azure App Service (Windows) - existing Azure subscription |
| **Prepared by** | Simpat Tech |

## Document Purpose

This document provides the Azure infrastructure architecture for PreProd and Prod environments, with detailed resource specifications and annual cost projections. It also summarizes how this documentation effort impacts the project estimation.

### Contents

1. Architecture Diagram
2. Environment Resource Specifications
3. Annual Cost Breakdown
4. Estimation Impact

---

## 1. Architecture Diagram

Each environment is self-contained with its own App Service, SQL Database, and Blob Storage, sharing only the Microsoft Entra ID tenant for authentication.

```
┌─────────────────────────────────────────────┐
│         Microsoft Entra ID (SSO)            │
│     Azure AD Groups  |  5 App Roles         │
│ Sales Rep | Sales Manager | Admin |         │
│           Finance | Executive               │
└──────────────────┬──────────────────────────┘
                   │ OAuth 2.0 / OIDC
┌──────────────────▼──────────────────────────┐
│  Azure DNS | Custom Domain | Managed SSL/TLS│
│         remarkets.client-domain.com         │
└──────────┬──────────────────┬───────────────┘
           │                  │
     ┌─────▼─────┐      ┌────▼──────┐
     │PRE-PROD   │      │PRODUCTION │
     │Staging/UAT│      │Live App   │
     ├───────────┤      ├───────────┤
     │App Svc B1 │      │App Svc S1 │
     │$55/mo     │      │$70/mo     │
     ├───────────┤      ├───────────┤
     │SQL S1     │      │SQL S2     │
     │$30/mo     │      │$74/mo     │
     ├───────────┤      ├───────────┤
     │Blob LRS   │      │Blob LRS   │
     │~$4/mo     │      │~$5/mo     │
     ├───────────┤      ├───────────┤
     │Insights   │      │Insights   │
     │Free+KV    │      │PAYG+KV+SSL│
     │~$1/mo     │      │~$8/mo     │
     └───────────┘      └───────────┘

  CI/CD Pipeline | GitHub Actions or Azure DevOps (Free Tier)
  main -> Prod  |  develop -> PreProd  |  Build -> Test -> Deploy

  PreProd: ~$90/mo | ~$1,080/yr    Prod: ~$157/mo | ~$1,884/yr

  TOTAL:  ~$247 / month  |  ~$2,964 / year
```

---

## 2. Environment Resource Specifications

### Pre-Production (Staging / UAT)

QA validation and UAT. Basic B1 tier is sufficient — no staging slot needed since zero-downtime deployments are not critical in this environment.

| Resource | SKU / Tier | Specs | Monthly |
|----------|-----------|-------|--------:|
| App Service Plan | Basic B1 (Windows) | 1 vCPU, 1.75 GB RAM, 10 GB, no staging slot | $55 |
| Azure SQL Database | Standard S1 (DTU) | 20 DTU, 250 GB, 7-day point-in-time restore | $30 |
| Azure Blob Storage | LRS, Hot tier | CSV uploads, exports, test data (~$0.018/GB) | ~$4 |
| App Insights + Key Vault | Free + Standard | 5 GB/mo telemetry, secrets management | ~$1 |
| **PREPROD TOTAL** | | | **~$90/mo** |

### Production

Live application for ~14+ identified users. S1 tier enables staging slot for zero-downtime swap deployments. S2 SQL provides headroom for concurrent bid/allocation queries.

| Resource | SKU / Tier | Specs | Monthly |
|----------|-----------|-------|--------:|
| App Service Plan | Standard S1 (Windows) | 1 vCPU, 1.75 GB RAM, 50 GB, 1 staging slot | $70 |
| Azure SQL Database | Standard S2 (DTU) | 50 DTU, 250 GB, 7-day point-in-time restore | $74 |
| Azure Blob Storage | LRS, Hot tier | CSV uploads, exports, bid docs (~$0.018/GB) | ~$5 |
| App Insights | Pay-as-you-go | ~2 GB/mo ingestion, full telemetry + alerting | ~$5 |
| Key Vault + DNS + SSL | Standard + Azure DNS | Secrets, certs, custom domain, managed SSL | ~$3 |
| **PROD TOTAL** | | | **~$157/mo** |

> **Note on Azure Blob Storage:** Both environments include Blob Storage (LRS, Hot tier) for file management. Azure charges ~$0.018/GB/month. For reference: 100 GB = ~$1.80/mo, 500 GB = ~$9/mo, 1 TB = ~$18/mo. If file volume grows, consider Cool tier (~$0.01/GB) or Archive (~$0.002/GB).

### Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| S1 for Prod only (not Premium) | ~14+ identified users. S1 handles Blazor SignalR connections. Upgrade to P1v3 if user count grows or autoscale needed. |
| B1 for PreProd (no staging slot) | Zero-downtime swaps not critical for UAT. Saves $15/mo vs S1. |
| DTU model for SQL (not vCore) | Simpler pricing, predictable OLTP workload. S2 (50 DTU) provides headroom. |
| Separate SQL per environment | Data isolation. PreProd can be wiped/seeded without production risk. |

---

## 3. Annual Cost Breakdown

Pay-As-You-Go estimates for US regions (East US / Central US). Actual costs may vary with Enterprise Agreements or reserved instances.

| Resource | PreProd/mo | Prod/mo | Total/mo | Annual |
|----------|----------:|--------:|---------:|-------:|
| App Service (Blazor) | $55 | $70 | $125 | $1,500 |
| Azure SQL Database | $30 | $74 | $104 | $1,248 |
| Azure Blob Storage | $4 | $5 | $9 | $108 |
| Application Insights | $0 | $5 | $5 | $60 |
| Key Vault + DNS + SSL | $1 | $3 | $4 | $48 |
| **TOTAL** | **$90** | **$157** | **$247** | **$2,964** |

| Environment | Monthly | Annual |
|-------------|--------:|-------:|
| PreProd (Staging / UAT) | $90 | $1,080 |
| Production (Live) | $157 | $1,884 |
| CI/CD (GitHub Actions / Azure DevOps)* | $0 | $0 |
| Microsoft Entra ID (auth)** | $0 | $0 |
| **TOTAL** | **~$247** | **~$2,964** |

\* CI/CD free tiers cover this project's needs (2,000–3,000 min/mo).

\*\* Entra ID P1 likely included with existing M365 E3/E5. If not: ~$6/user/mo. Cost scales with actual user count.

> **Important — User Count Assumption:** This estimate assumes an internal-only application (~14+ identified stakeholders). If external users (e.g., customers submitting bids directly) will access the platform, concurrent connections could increase significantly. This would require upgrading Prod to P1v3 App Service (+$171/mo) and potentially S3 SQL (100 DTU, +$73/mo), plus Azure SignalR Service for connection scaling. Final user count should be confirmed before infrastructure provisioning.

---

## 4. Estimation Impact

> **Important:** This document is an estimated cost projection for Azure resources as requested. REMarkets may already have some or all of these resources configured in their existing Azure subscription. The purpose is to provide visibility into the expected annual infrastructure cost for budgeting and planning.

| Concept | Before | After |
|---------|-------:|------:|
| MVP (Must Have) | ~998 hrs | ~1,004 hrs |
| Full Scope (MVP + Post-MVP + Learning) | ~1,171 hrs | ~1,177 hrs |

| Scenario | Hours | 2 Developers (80 hrs/wk) |
|----------|------:|--------------------------|
| MVP + Learning | ~1,060 hrs | ~13.3 weeks (~3.3 months) |
| Full Scope | ~1,177 hrs | ~14.7 weeks (~3.7 months) |
