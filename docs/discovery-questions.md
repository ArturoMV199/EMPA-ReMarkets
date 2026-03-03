# Discovery Questions: Bid Intelligence Platform

## Purpose

Living document to track open questions for REMarkets. Each question targets a specific scope ambiguity that could impact estimation, architecture, or delivery. Questions are organized by module and prioritized by impact.

Answers should be documented here as they come in, with date and source.

---

## Status Legend

- 🔴 **Open** — Not yet asked or answered
- 🟡 **Asked** — Sent to client, awaiting response
- 🟢 **Answered** — Response received and documented
- ⚪ **Deferred** — Intentionally postponed to future phase

---

## Answered Questions (from client Q&A sessions)

These questions were already asked and answered. Documented here for traceability.

### Offer Lifecycle

| # | Question | Answer | Impact | Date |
|---|----------|--------|--------|------|
| A11 | What are the exact offer statuses and transitions? | Six states: Draft, Active, Closed, Allocating, Finalized (Approved), Cancelled. Exported and Reversed are allocation-level events, not offer statuses. | Simplified from proposed 9 states to 6. No hour change — simpler state machine, already covered in #17/#18. | 2026-02 |

### Bid Validation

| # | Question | Answer | Impact | Date |
|---|----------|--------|--------|------|
| A12 | Do we enforce bid qty <= available at entry, or allow oversubscription? | Strict: bid qty must be <= current available at time of entry. No oversubscription Phase 1. Partial allocation only at allocation stage — customer can bid 100, admin allocates 60, but cannot bid 500 if only 100 exists. | Confirms simple validation path. No hour change. Architecture note: keep validation in app layer (not DB constraint) for Phase 2 flexibility. | 2026-02 |

### Split Allocation Representation

| # | Question | Answer | Impact | Date |
|---|----------|--------|--------|------|
| A13 | One allocation record with children, or multiple flat records per customer? | Multiple allocation records per customer per inventory line. Reasons: cleaner audit, cleaner export, simpler reporting, easier reversal, avoids nested structure complexity. | Confirms flat record approach. No hour change — already modeled in #34. | 2026-02 |

### Export

| # | Question | Answer | Impact | Date |
|---|----------|--------|--------|------|
| A14 | What data needs to be exported? CSV only? Who consumes it? | CSV format required. Columns: Part Number, Description, Customer, Allocated Quantity, Approved Price, Extended Value, Allocation Approval Timestamp, Offer ID, Allocation ID. Keep it simple. | Confirms CSV export (#37, 10 hrs MVP). PDF export (#43, 21 hrs Post-MVP) likely no longer needed. 1 row per allocation record (Allocation ID column confirms flat export). No hour change. | 2026-02 |

### Master Data

| # | Question | Answer | Impact | Date |
|---|----------|--------|--------|------|
| A15 | Do you want a dedicated UI for master description edits? Approval required? | Dedicated UI, restricted to Admin and Sales Manager, fully audited, no separate approval step. | **+8 hrs** — new item #12b: master description edit UI. Audit covered by existing #35 generic interceptor. | 2026-02 |

### Audit UX

| # | Question | Answer | Impact | Date |
|---|----------|--------|--------|------|
| A16 | In-app audit viewer in Phase 1, or capture-only? | Capture immutable records + basic in-app viewing at entity level (bid history, allocation changes on a record). No full enterprise audit search console Phase 1. Advanced querying downstream in reporting. | Confirms #36 (21 hrs) entity-level viewer in MVP. #44 (15 hrs) advanced views stays Post-MVP. No hour change. | 2026-02 |

### Authentication

| # | Question | Answer | Impact | Date |
|---|----------|--------|--------|------|
| A1 | Can we use Azure roles to assign application roles? | Yes — use Entra roles/group membership. App-layer enforcement still required. | Confirmed Auth Option A (Azure AD Groups). No change to estimation. | 2026-02 |

### Inventory — Import & Identity

| # | Question | Answer | Impact | Date |
|---|----------|--------|--------|------|
| A2 | Do you have a sample CSV import file? | No CSV yet, but provided mock InventoryItem schema with fields: ID, InventorySource, PartNumber, Description, WarehouseLocation, Condition, QtyTotal, QtyCommitted, QtyAvailable, Uom, Status, SaleTypeTag, MetadataJson. Constraints: QtyCommitted ≤ QtyTotal, both ≥ 0. | Schema clarity reduces Sprint 0 risk. No hour change — schema work already covered. | 2026-02 |
| A3 | Is inventory tracked by part number only, or part number + attributes? | **PartNumber + attributes** (condition, location, grade). Not part number alone. For net-new parts: upload description → master. For existing parts: do NOT overwrite master description — retain "source description" on upload row. Master description changes require Admin/Sales Manager action. | **+16-24 hrs** — composite uniqueness, master vs source description, controlled update flow. | 2026-02 |
| A4 | For additive uploads, dedupe identical rows or treat as distinct increments? | Each upload row = distinct inventory adjustment record. Never silently merge/dedupe. Each record tied to: upload batch ID, user, timestamp, qty added, source file reference. | Covered in A3 impact — inventory transaction table with full audit trail per upload row. | 2026-02 |

### Bid Semantics

| # | Question | Answer | Impact | Date |
|---|----------|--------|--------|------|
| A5 | One active bid per customer per part per offer, or multiple competing bids? | **One active bid** per customer per inventory line per offer. Updates create new revision (previous retained for audit). Only latest revision active. No multiple competing bids from same customer/line/offer. | **+4-8 hrs** — uniqueness constraint enforcement, revision logic. | 2026-02 |
| A6 | Any validation beyond basic constraints? | Qty ≤ available inventory, Qty > 0, Price > 0, Offer must be active (within date range), Customer context required, User role enforcement. | Standard validation — already within existing bid items. No change. | 2026-02 |

### Allocation & Approval

| # | Question | Answer | Impact | Date |
|---|----------|--------|--------|------|
| A7 | If highest bid ties, what's the tie-breaker? | No automatic tie-breaker. System surfaces the tie, Admin/Manager manually selects winner. | **+8-12 hrs** — tie detection logic + resolution UI. | 2026-02 |
| A8 | If approved allocation needs reversal, do we support in Phase 1? | **Yes.** Reversal must: return inventory to Available, mark allocation as Reversed, lock/regenerate export, full audit, require reason code. | **+24-32 hrs** — new feature not in original estimation. | 2026-02 |
| A9 | Is every allocation manager-approved, or are there thresholds? | **All manager-approved** in Phase 1. Thresholds out of scope for now but design for future. Visual indicators for "below floor" pricing wanted. | Simplifies item 24 (thresholds). Net ~0 hrs — threshold savings offset by "below floor" visual indicator. | 2026-02 |
| A10 | Who can approve — manager only or admin too? | Sales Manager: within defined authority. Admin: full authority including override. Do not limit to manager only. | Already covered in role-based access design. No change. | 2026-02 |

---

## Open Questions

### 🔴 Offer Lifecycle

| # | Question | Why it matters | Potential impact |
|---|----------|---------------|-----------------|
| Q2 | Do you want offer templates to reuse previous offer structures? | Weekly auctions with similar inventory = repetitive setup. Templates could save sales reps significant time. | +12-20 hrs if yes, but high ROI for users |

### 🔴 Bid Validation & Oversubscription

### 🔴 Timezone & Concurrency

| # | Question | Why it matters | Potential impact |
|---|----------|---------------|-----------------|
| Q4 | What timezone for auction start/end times? Display in user's local time or company time? | Bid deadlines to the minute require clear timezone handling. Wrong timezone = wrong deadline. | +4-8 hrs for timezone-aware datetime handling |
| Q5 | Can two reps edit bids on the same offer simultaneously? If so, how handle conflicts? | Blazor Interactive Server uses SignalR — real-time capable but need conflict resolution strategy. | +8-16 hrs if optimistic concurrency + conflict UI needed |

### 🔴 Inventory & Offer Cross-Reference (NEW — identified during SC-002 analysis)

| # | Question | Why it matters | Potential impact |
|---|----------|---------------|-----------------|
| Q28 | Can the same inventory line appear in multiple active offers at the same time? | The client confirmed bid qty must not exceed current available at time of entry. This works when inventory lives in one offer at a time. But if the same line is in Offer A and Offer B simultaneously, both offers accept bids against the same available qty. When Offer A allocates and commits, Offer B's valid bids may exceed what remains. This isn't oversubscription (each bid was valid when entered) but creates the same conflict at allocation time. We need to know: allow it (warn admin at allocation), prevent it (lock inventory to one offer), or track reserved-per-offer qty. Directly affects allocation workflow (#26, 48 hrs) and inventory commitment (#28, 18 hrs). | **Phase 1 critical** — must resolve before Sprint 1. Could add +8-16 hrs if reservation-per-offer tracking needed. |

### 🔴 Inventory Gaps

| # | Question | Why it matters | Potential impact |
|---|----------|---------------|-----------------|
| Q6 | What happens if "Available" inventory is actually damaged or needs write-off? | May need additional inventory states (Damaged, Written-Off) beyond Available/Committed/Released. | +4-8 hrs per additional state |
| Q7 | Can a manager temporarily "hold" inventory for a strategic customer before formal allocation? | Common in sales — informal reservation. If not handled, reps will work around the system. | +12-16 hrs (Hold state + expiration + UI) |
| Q8 | Beyond CSV upload, do you need bulk inventory adjustments? (correct quantities, change conditions, warehouse transfers) | If the only way to fix inventory is re-upload, that's friction. May need manual adjustment UI. | +8-12 hrs for adjustment UI with audit |
| Q9 | CSV template — who defines and maintains it? What if fields change? Reject entire file on error or skip bad rows? | Error handling strategy affects UX significantly. Reject-all is safer but frustrating for users with 1 bad row in 500. | Architecture decision — covered in Sprint 0 |

### 🔴 Bid & Pricing

| # | Question | Why it matters | Potential impact |
|---|----------|---------------|-----------------|
| Q10 | Is multi-currency needed? Server components could involve international transactions. | Exchange rate management is a significant scope addition. Need to know before Sprint 1. | +40-60 hrs if yes (currency tables, conversion, display) |
| Q11 | For "below floor" pricing indicator — where does the floor price come from? Per part? Per category? Who sets it? How often? | Need a price floor management mechanism. Could be simple (manual per part) or complex (rules engine). | +8-16 hrs depending on complexity |
| Q12 | Volume discounts or tiered pricing? Buy 100 = one price, buy 1000 = different? | If yes, bid validation and allocation logic become significantly more complex. | +16-24 hrs if tiered pricing needed |
| Q13 | BIN (Buy It Now) — does it auto-allocate immediately or still need manager approval? | If auto-allocate: need immediate inventory commitment without approval flow. Changes the entire allocation path. | +8-12 hrs if auto-allocate path needed |

### 🔴 Allocation & Export

| # | Question | Why it matters | Potential impact |
|---|----------|---------------|-----------------|
| Q14 | After partial/split allocation, what happens to remaining inventory? Back to Available? Stays in pending pool? Admin decides? | Affects inventory state machine, bid status lifecycle, and whether remaining qty can be re-offered. Connected to A12 confirmation of partial allocation. Three options identified (auto-release, hold pending, admin decides) — each changes state transitions in #16, #22, #26, #34. | **Phase 1 critical** — 138 hrs of combined work depends on this answer. Must resolve before Sprint 1. |
| Q17 | One export per customer order, or consolidated exports across customers? | Affects export generation logic and UI. | +4-8 hrs if multiple export formats needed |

### 🔴 Dashboard & Reporting

| # | Question | Why it matters | Potential impact |
|---|----------|---------------|-----------------|
| Q18 | Dashboard KPIs — what exactly do you want to see? Revenue? Win rate? Bid volume? Inventory turnover? | Current estimation has "Dashboard with KPI cards" but no defined metrics. Vague scope = vague delivery. | Could range from simple (4-6 static KPIs) to complex (dynamic filtering, date ranges) |
| Q19 | Does Finance need audit reports beyond the audit trail UI? Sales performance reports? | If yes, report generation is a separate feature not currently estimated. | +16-24 hrs per report type |

### 🔴 Operations & Performance

| # | Question | Why it matters | Potential impact |
|---|----------|---------------|-----------------|
| Q22 | How many concurrent users expected? How many line items per offer (100? 1,000? 10,000?)? How many active offers at once? | Performance requirements affect architecture decisions — especially for the in-cell editing grid. 10,000 rows in MudBlazor DataGrid behaves very differently than 100. | Could require virtualization, pagination strategy, or grid library change |
| Q23 | Data retention policy — how long keep closed offers, old bids, audit records? | Affects database sizing, archival strategy, and potentially query performance over time. | Sprint 0 decision — minimal hour impact but important for infrastructure |
| Q24 | In-app notifications needed? "Allocation pending your approval", "You've been outbid", "Offer closing in 1 hour"? | Even with email out of scope, in-app alerts could be essential for workflow adoption. Without them, managers won't know when to act. | +16-24 hrs (notification system + bell icon + read/unread state) |
| Q29 | How many total end users will access the platform? Will external customers (buyers) ever access the system directly to submit bids? | Current infrastructure is sized for ~14+ internal users (identified stakeholders). If external customers access the platform, concurrent connections increase significantly — requires upgrading App Service (S1 to P1v3, +$171/mo), potentially SQL (S2 to S3, +$73/mo), and adding Azure SignalR Service. Also impacts auth model (Entra ID internal-only vs B2C for externals). | **Infrastructure + architecture impact** — could change monthly cost from ~$247 to ~$500+ and add +24-40 hrs for B2C auth |

### 🔴 User Experience

| # | Question | Why it matters | Potential impact |
|---|----------|---------------|-----------------|
| Q25 | Keyboard navigation for the bid grid? Tab/Enter to move between cells? | Sales reps entering 100+ bids want speed. Mouse-only grid = slow adoption and complaints. | +4-8 hrs for keyboard nav in MudBlazor DataGrid |
| Q26 | Training materials or in-app help needed? User guide? Tooltips? | If included in scope, need to estimate. If not, client needs to know it's their responsibility. | +16-32 hrs if user guide + tooltips included |
| Q27 | System downtime during bid deadline — what happens? Need SLA? | Defines infrastructure requirements (high availability, failover). | Architecture decision — could add Azure Traffic Manager / redundancy |

---

## How to Use This Document

1. **Before each client meeting:** Review 🔴 Open questions, pick 5-8 highest priority to ask
2. **During meeting:** Document answers in real-time
3. **After meeting:** Update status (🔴→🟢), calculate estimation impact, update estimation doc if needed
4. **Sprint planning:** Check for any 🔴 questions that block upcoming sprint work

### Priority Guidelines

Ask these first — they have the highest estimation impact:
- **Q14 (Unallocated qty after partial allocation) — Phase 1 CRITICAL, blocks state machine for 138 hrs of work**
- **Q28 (Same inventory in multiple active offers) — Phase 1 CRITICAL, blocks allocation workflow**
- **Q29 (Total user count / external access) — infrastructure sizing depends on this, could double monthly cost**
- Q10 (Multi-currency) — could add 40-60 hrs
- Q5 (Concurrent editing) — architecture impact
- Q13 (BIN auto-allocate) — changes allocation flow
- Q22 (Performance/volume) — affects grid library decision
- Q24 (In-app notifications) — affects workflow adoption
- Q2 (Offer templates) — high ROI for users

Previously high priority, now answered:
- ~~Q1 (Offer lifecycle states)~~ → Answered as A11
- ~~Q3 (Oversubscription vs strict validation)~~ → Answered as A12
- ~~Q15 (Split allocation representation)~~ → Answered as A13
- ~~Q21 (Audit UX scope)~~ → Answered as A16
