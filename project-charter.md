# Project Charter: Bid Intelligence Platform

## General Information
- **Project:** Bid Intelligence Platform — Phase 1
- **Client:** REMarkets
- **Consulting Firm:** Simpat
- **Lead:** TBD (pending team assignment)
- **Team:** 2 Fullstack .NET Developers (possible 3rd), roles TBD
- **Date:** February 19, 2026
- **Client Document Version:** V2 (revised 2/5/26)

## Business Problem

REMarkets currently manages its internal sales-side bidding, offer creation, inventory allocation, and approval workflows through spreadsheets and email. This manual process creates delays in bid turnaround, lacks governance and audit trails, introduces pricing and margin exceptions without oversight, and prevents reliable historical data capture for analytics.

They need a centralized web application that replaces these manual workflows with a governed, auditable platform — starting with internal users only (no external customer portal in Phase 1).

## Objectives

1. Eliminate spreadsheet and email-based bid tracking for internal operations
2. Enforce governed approval workflows for all bids and allocations
3. Provide complete, immutable audit trails for compliance and finance
4. Reduce offer-to-allocation approval time to ≤1 business day (target), ≤2 days (max)
5. Capture 100% of winning and losing bids as structured data
6. Establish a clean data foundation for downstream analytics (Fabric / Power BI)
7. Build a modular platform that supports future phases (customer portal, AI training)

## Scope

### In Scope (Phase 1 — Web Application)
- Bid & Offer Management (create, track, edit offers and line-item bids)
- Inventory Handling (bulk upload, grouping, state tracking, partial/split allocations)
- Allocation & Order Readiness (aggregated view, approval workflow, order-ready exports)
- Permissions & Approvals (role-based access, configurable thresholds, escalation paths)
- Customer Management (CRUD, assignment to reps, audit logging)
- Customer Masquerade (act-on-behalf capability with full attribution)
- Audit & Compliance (immutable logging for all tracked actions)
- Data Foundation (normalized SQL, historical retention, exposed for Fabric ingestion)
- Authentication via Microsoft Entra
- Role-based UI: Sales Rep, Sales Manager, Administrator, Finance (read-only), Executive (read-only)

### Out of Scope
- Analytics dashboards (built separately in Fabric / Power BI by Simpat analytics workstream)
- Customer-facing portal (future phase — data model designed to support it)
- Commodities pricing database for AI training (future scope per client doc)
- Mobile application
- Email/notification system (not mentioned in requirements)
- Integration with external ERP or order management systems

## Deliverables

| # | Deliverable | Description | Format |
|---|-------------|-------------|--------|
| 1 | Project Charter | Scope, objectives, stakeholders, risks | Markdown |
| 2 | Architecture Decision | Tech stack, environments, CI/CD, team mapping | Markdown |
| 3 | Visual Prototype | Clickable HTML screens for key workflows | HTML/CSS |
| 4 | Estimation | Full task breakdown with hours, MVP, timeline | Markdown |
| 5 | Web Application | Bid Intelligence Platform — Phase 1 | .NET Web App on Azure |
| 6 | Order-Ready Exports | CSV and/or PDF generation from approved allocations | Feature within app |
| 7 | Weekly Status Reports | Progress tracking during execution | Markdown |
| 8 | Source Code & Artifacts | All IP transferred to REMarkets | GitHub repo |

## Stakeholders

| Name | Role | Involvement |
|------|------|-------------|
| Zack Sexton | Executive Sponsor | Strategic direction, budget approval, blocker removal |
| Kim Jensen | Product Owner / Business Lead | Product vision, requirements, approval of functionality |
| Tim Murphy | Product Owner / Business Lead | Product vision, requirements, approval of functionality |
| Bobby Pronto | Product Owner / Business Lead | Product vision, requirements, approval of functionality |
| Jerry Lee | Sales Stakeholder | Workflow validation, domain expertise, UAT |
| Jessica Xia | Sales Stakeholder | Workflow validation, domain expertise, UAT |
| Vincent Lievaart | Sales Stakeholder | Workflow validation, domain expertise, UAT |
| Henry Chien | Sales Stakeholder | Workflow validation, domain expertise, UAT |
| Chris Cox | Sales Stakeholder | Workflow validation, domain expertise, UAT |
| Grey Player | Sales Stakeholder | Workflow validation, domain expertise, UAT |
| Chelsie White | Finance & Compliance | Approval thresholds, audit validation |
| Avery Wolfe | Finance & Compliance | Compliance requirements, order-ready review |
| Sara Ruiz | Finance & Compliance | Historical data review, audit completeness |
| Simpat Dev Team (TBD) | Development | Build, test, deploy the web application |

## Timeline

| Milestone | Target Date |
|-----------|-------------|
| Charter Approved | TBD |
| Architecture Decided | TBD |
| Prototype Delivered | TBD |
| Estimation Approved | TBD |
| MVP Delivered | TBD (derived from estimation) |
| Full Phase 1 Delivered | TBD (derived from estimation) |
| UAT Complete | TBD |
| Production Go-Live | TBD |

*Note: Timeline will be populated after estimation phase. Client's internal PMO has a committee review window and Simpat analytics workstream targets Q2 for showing numbers — the web app timeline should consider data availability needs for the analytics team.*

## Assumptions

- REMarkets has an existing Azure subscription and Microsoft Entra tenant available for the project (90% confidence)
- Simpat will have portal access to REMarkets' Azure environment for deployment
- Development team will be 2 fullstack .NET developers with a possible 3rd added based on timeline needs
- The dev team members are new hires — specific skill levels are TBD
- QA will be performed by the Sales Team and Product Owners (as stated in scoping doc), not a dedicated QA resource
- No historical data migration is required for Phase 1 — the platform starts with an empty database and inventory is uploaded via CSV/Excel
- The application does not need to send emails or push notifications in Phase 1
- Bid sheets will still be shared with customers over email/Excel outside the platform (stated in scoping doc)
- Analytics/reporting is handled entirely outside the app via Fabric/Power BI by a separate Simpat workstream
- All source code and artifacts are REMarkets intellectual property

## Constraints

- **Platform:** Must be built on Microsoft Azure (client requirement)
- **Authentication:** Must use Microsoft Entra (client requirement)
- **Database:** Must be centralized SQL (client requirement)
- **Team Size:** 2 developers (possibly 3) — limits parallelization
- **Team Experience:** New dev hires — skill levels with specific .NET frameworks/Azure services are unknown
- **Budget:** Not disclosed — must stay within Simpat's allocated budget
- **Deadline:** No hard deadline provided, but client's analytics team targets Q2 2026 for reports — implies data needs to be flowing by then
- **IP:** All code and artifacts are REMarkets property, transferable at project end
- **No dedicated DevOps:** Infrastructure setup falls on the dev team
- **No dedicated Designer:** UI/UX decisions are Simpat's responsibility

## Success Criteria

1. All internal bid, approval, and allocation workflows execute end-to-end within the platform
2. Manual spreadsheet and email-based bid tracking is no longer required for standard operations
3. Average time from offer creation to allocation approval: ≤1 business day (target), ≤2 days (max)
4. 100% of internal sales-side bids processed through the platform
5. 100% of approval-required bids follow defined approval workflows
6. Complete audit trail available for all bid, approval, and allocation actions
7. Order-ready exports generated immediately after approval
8. Finance, Sales, and Operations sign off on usability, control, and data integrity
9. Structured, normalized data accessible for downstream Fabric/Power BI ingestion
10. Platform is production-ready for internal use and establishes foundation for future phases

## Known Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| New dev team with unknown skill levels | High | High | Factor learning curve into estimation; plan onboarding time; consider adding 3rd dev |
| Azure access/configuration delays | Medium | High | Confirm access early; identify if existing infra can be leveraged |
| Scope creep from 3 Product Owners | Medium | High | Strict change management; reference this charter for scope decisions |
| No dedicated QA resource | Medium | Medium | Build automated testing into dev workflow; structured UAT with sales team |
| Analytics workstream dependency | Medium | Medium | Coordinate data schema with Simpat analytics team early; ensure SQL is clean and documented |
| No designer — UI quality risk | Medium | Medium | Prototype phase as design reference; iterate with Product Owners |
| Client expects fast delivery (Q2 analytics target) | Medium | High | Set realistic timeline in estimation; communicate dependencies clearly |
| Unclear DevOps ownership | Medium | Medium | Assign infra responsibilities during architecture phase; leverage existing Azure setup if available |
| Customer masquerade complexity (audit + permissions) | Medium | Medium | Design carefully in architecture phase; allocate appropriate buffer in estimation |
| Partial/split allocation logic complexity | Medium | Medium | Define clear business rules during architecture; prototype the workflow |

## Relationship to Other Workstreams

This project is one of two active Simpat workstreams with REMarkets:

1. **Bid Intelligence Platform (this project)** — Web application for internal bid management
2. **Data/Analytics Workstream** — Warehouse objects, data moves from data lake, Power BI reports

The web application writes structured data to SQL. The analytics workstream (Ansar's team handles data lake ingestion, Sean's team handles warehouse/BI) consumes that data downstream. Schema coordination between the two workstreams is critical.

Key contacts on the analytics side: Ansar (data lake), Sean (warehouse/BI), Tanya (analyst familiar with data lake objects).
