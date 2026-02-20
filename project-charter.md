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

REMarkets has evolved from refurbished laptops to server components (RAM sticks, CPUs, and parts pulled from servers), dealing in high-volume part-number-level transactions. Currently, salespeople manage bidding, offer creation, inventory allocation, and approval workflows through spreadsheets and email — "shoveling spreadsheets all over the place." Once a week, they compare their spreadsheets to determine winners. This manual process creates delays in bid turnaround, lacks governance and audit trails, introduces pricing and margin exceptions without oversight, and prevents reliable historical data capture for future analytics.

They need a centralized web application that replaces these manual workflows with a governed, auditable platform — starting with internal users only (no external customer portal in Phase 1). The platform is designed from the start to support a future customer portal, but Phase 1 is strictly internal.

## Objectives

1. Eliminate spreadsheet and email-based bid tracking for internal operations
2. Enforce governed approval workflows for all bids and allocations
3. Provide complete, immutable audit trails for compliance and finance
4. Reduce offer-to-allocation approval time to ≤1 business day (target), ≤2 days (max)
5. Capture 100% of winning and losing bids as structured data at part-number level
6. Build a modular platform that supports future phases (customer portal, AI-driven pricing intelligence)
7. Ensure all captured data is stored in clean, normalized SQL suitable for future analytics consumption

## Scope

### In Scope (Phase 1 — Web Application)
- Bid & Offer Management (create, track, edit offers and line-item bids at part-number level)
- Auction mechanics (offers have start/end dates with exact timing to month/day/hour/minute; bids are editable until deadline, then locked)
- Inventory Handling (bulk CSV/Excel upload with prescribed template; additive uploads — same part number uploaded twice accumulates, never overwrites; upload event tracking with filename, upload date UTC, uploader identity, individual batch IDs)
- Inventory state tracking (Available, Committed, Released) with grouping into offers/lots
- Allocation & Order Readiness (aggregated view auto-suggesting highest bidder per part number, with manager override capability; split/partial allocations across customers; approval workflow; order-ready exports)
- Permissions & Approvals (role-based access, configurable thresholds, escalation paths)
- Customer Management (CRUD, assignment to reps, audit logging; platform designed to support future customer portal)
- Act-on-Behalf (sales reps enter bids on behalf of customers with full attribution — in Phase 1, nearly all bids will be entered this way since there is no customer portal)
- Bid History (only latest bid displayed by default, but full history of prior bids retained and viewable)
- Audit & Compliance (immutable logging for all tracked actions)
- Authentication via Microsoft Entra (all internal roles through AD/Entra)
- Role-based UI: Sales Rep, Sales Manager, Administrator, Finance (read-only), Executive (read-only)

### Out of Scope
- In-app analytics or dashboards (future consideration — data is captured cleanly to support this later)
- Customer-facing portal (future phase — data model designed to support it)
- Commodities pricing database for AI training (future scope per client doc)
- Mobile application
- Email/notification system (not mentioned in requirements)
- Integration with external ERP, Grid, or order management systems (allocations are exported and integrated manually for now; possible future integration)
- Real-time data requirements (auctions happen once per week — no heavy concurrent load expected)

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

*Note: Timeline will be populated after estimation phase. REMarkets' new CEO (Zack Sexton) considers this a top priority — decision expected within ~2 weeks of receiving the proposal. Client has expressed preference for a fixed-bid engagement over time-and-materials.*

## Assumptions

- REMarkets has an existing Azure subscription and Microsoft Entra tenant available for the project (90% confidence)
- Simpat will have portal access to REMarkets' Azure environment for deployment
- Development team will be 2 fullstack .NET developers with a possible 3rd added based on timeline needs
- The dev team members are new hires — specific skill levels are TBD
- QA will be performed by the Sales Team and Product Owners (as stated in scoping doc), not a dedicated QA resource
- No historical data migration is required for Phase 1 — the platform starts with an empty database and inventory is uploaded via CSV/Excel
- The application does not need to send emails or push notifications in Phase 1
- Bid sheets will still be shared with customers over email/Excel outside the platform (stated in scoping doc)
- All source code and artifacts are REMarkets intellectual property
- The team is comfortable with AI-assisted development, provided all code and IP belong to REMarkets
- Client prefers a fixed-bid engagement structure (stated by Tim Murphy referencing CFO preference)
- REMarkets business operates in server components (RAM, CPUs, etc.) — not refurbished laptops; part numbers and quantities are the core data units
- Auctions operate on a weekly cycle — no real-time performance requirements anticipated
- No direct integration with external systems (Grid or other) in Phase 1 — exports are manual
- The schema is a blank slate; REMarkets wants Simpat to lead technical decisions and best practices

## Constraints

- **Platform:** Must be built on Microsoft Azure (client requirement — currently consolidating all Azure resources)
- **Authentication:** Must use Microsoft Entra (client requirement — "all internal roles through AD/Entra")
- **Database:** Must be centralized SQL (client requirement)
- **Team Size:** 2 developers (possibly 3) — limits parallelization
- **Team Experience:** New dev hires — skill levels with specific .NET frameworks/Azure services are unknown
- **Budget:** Not disclosed — client prefers fixed-bid engagement; CFO is cost-conscious ("historically, projects have been perceived as black holes" from exec viewpoint)
- **Deadline:** No hard deadline, but new CEO considers this a top priority; decision expected within ~2 weeks
- **IP:** All code and artifacts are REMarkets property, transferable at project end
- **No dedicated DevOps:** Infrastructure setup falls on the dev team
- **No dedicated Designer:** UI/UX decisions are Simpat's responsibility
- **Technical leadership:** REMarkets explicitly wants Simpat to lead technical decisions and best practices — they provide business requirements, not software direction

## Success Criteria

1. All internal bid, approval, and allocation workflows execute end-to-end within the platform
2. Manual spreadsheet and email-based bid tracking is no longer required for standard operations
3. Average time from offer creation to allocation approval: ≤1 business day (target), ≤2 days (max)
4. 100% of internal sales-side bids processed through the platform
5. 100% of approval-required bids follow defined approval workflows
6. Complete audit trail available for all bid, approval, and allocation actions
7. Order-ready exports generated immediately after approval
8. Finance, Sales, and Operations sign off on usability, control, and data integrity
9. All data stored in clean, normalized SQL suitable for future analytics consumption
10. Platform is production-ready for internal use and establishes foundation for future phases (customer portal, AI)

## Known Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| New dev team with unknown skill levels | High | High | Factor learning curve into estimation; plan onboarding time; consider adding 3rd dev |
| Azure access/configuration delays | Medium | High | Confirm access early; identify if existing infra can be leveraged |
| Scope creep from 3 Product Owners | Medium | High | Strict change management; reference this charter for scope decisions |
| No dedicated QA resource | Medium | Medium | Build automated testing into dev workflow; structured UAT with sales team |
| No designer — UI quality risk | Medium | Medium | Prototype phase as design reference; iterate with Product Owners |
| Client expects fast delivery (CEO top priority) | Medium | High | Set realistic timeline in estimation; communicate dependencies clearly |
| Fixed-bid preference may constrain flexibility | Medium | High | Define clear MVP scope with MoSCoW; articulate what's included vs. optional with pricing transparency |
| Unclear DevOps ownership | Medium | Medium | Assign infra responsibilities during architecture phase; leverage existing Azure setup if available |
| Act-on-behalf complexity (audit + permissions) | Medium | Medium | Design carefully in architecture phase; allocate appropriate buffer in estimation |
| Partial/split allocation logic complexity | Medium | Medium | Define clear business rules during architecture; prototype the workflow |
| New leadership team (CEO, CFO turnover) | Low | Medium | Engage current decision-makers (Tim, Bobby); document all approvals; be prepared for priority shifts |

## Future Phases (Not in Scope — Design Considerations Only)

The following are explicitly out of Phase 1 scope but influence design decisions now:

1. **Customer Portal (Phase 2)** — The data model and customer management are designed to support future external customer access. The act-on-behalf feature establishes the pattern for customer-level actions.
2. **Analytics & Reporting** — No in-app dashboards. However, all data is stored in clean, normalized SQL to support future analytics consumption. The schema should be well-documented for downstream use.
3. **AI-Driven Pricing Intelligence** — REMarkets wants to leverage captured bid data for future AI training. The structured data capture (winning/losing bids, pricing history, part-number-level detail) establishes the foundation.
4. **System Integration** — Future integration with Grid or other order management systems. Phase 1 uses manual exports; the architecture should not preclude API-based integration later.
