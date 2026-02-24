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
| Q1 | What are the exact offer statuses and transitions? We propose: Draft → Scheduled → Active → Closed → Allocating → Approved → Exported. Plus Reversed and Cancelled as terminal states. Does this match your workflow, or are there missing/extra states? | This defines the entire offer state machine — every screen, validation, and business rule depends on it. Getting this wrong means rework across the whole app. | +8-24 hrs depending on complexity of transitions and edge cases (e.g., can you go from Closed back to Active?) |
| Q2 | Do you want offer templates to reuse previous offer structures? | Weekly auctions with similar inventory = repetitive setup. Templates could save sales reps significant time. | +12-20 hrs if yes, but high ROI for users |

### 🔴 Bid Validation & Oversubscription

| # | Question | Why it matters | Potential impact |
|---|----------|---------------|-----------------|
| Q3 | For bidding validation, do we always enforce bid qty ≤ current available at bid entry time, or allow "oversubscription" bids and handle shortages during allocation? | The client's Q&A says "Qty ≤ available inventory (unless partial allocation later)" — the "unless" is ambiguous. If we enforce strictly at entry, a customer can't bid for 100 units when only 80 are available even if partial allocation is intended. If we allow oversubscription, the allocation step needs shortage resolution logic. | High — changes bid validation rules AND allocation workflow. Locking this avoids rework. |

### 🔴 Timezone & Concurrency

| # | Question | Why it matters | Potential impact |
|---|----------|---------------|-----------------|
| Q4 | What timezone for auction start/end times? Display in user's local time or company time? | Bid deadlines to the minute require clear timezone handling. Wrong timezone = wrong deadline. | +4-8 hrs for timezone-aware datetime handling |
| Q5 | Can two reps edit bids on the same offer simultaneously? If so, how handle conflicts? | Blazor Interactive Server uses SignalR — real-time capable but need conflict resolution strategy. | +8-16 hrs if optimistic concurrency + conflict UI needed |

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
| Q14 | After partial/split allocation, what happens to remaining inventory? Back to Available? Stays in pending pool? | Affects inventory state machine and whether remaining qty can be re-offered. | Architecture decision — impacts state transitions |
| Q15 | When allocations split a line item across customers, how to represent it — one allocation record with children, or multiple allocation records per customer? | Affects DB schema, audit trail structure, and export format. One-with-children = cleaner audit but more complex queries. Multiple records = simpler queries but harder to see the "original whole." | Architecture decision — must lock before Sprint 1 |
| Q16 | What data needs to be exported from approved allocations? Specific columns, field order, date formats? CSV only? Who consumes this export — ERP, finance system, or manual process? | Wrong export format = manual rework by finance. Need spec before building export. | Minimal hour impact but blocks export item delivery |
| Q17 | One export per customer order, or consolidated exports across customers? | Affects export generation logic and UI. | +4-8 hrs if multiple export formats needed |

### 🔴 Dashboard & Reporting

| # | Question | Why it matters | Potential impact |
|---|----------|---------------|-----------------|
| Q18 | Dashboard KPIs — what exactly do you want to see? Revenue? Win rate? Bid volume? Inventory turnover? | Current estimation has "Dashboard with KPI cards" but no defined metrics. Vague scope = vague delivery. | Could range from simple (4-6 static KPIs) to complex (dynamic filtering, date ranges) |
| Q19 | Does Finance need audit reports beyond the audit trail UI? Sales performance reports? | If yes, report generation is a separate feature not currently estimated. | +16-24 hrs per report type |

### 🔴 Master Data & Audit UX

| # | Question | Why it matters | Potential impact |
|---|----------|---------------|-----------------|
| Q20 | For master description handling — do you want a dedicated UI to update master descriptions, and does that require approval and audit? | Client confirmed existing parts shouldn't have master description overwritten by upload. But the mechanism for intentional changes is undefined — could be a simple edit button (low effort) or a full approval workflow (high effort). | +8-12 hrs if dedicated UI with approval flow; +4 hrs if simple admin edit |
| Q21 | Is an in-app audit viewer required in Phase 1 (search/filter by offer, inventory line, customer, user), or is capturing the audit records sufficient with the expectation that admins query via database or later reporting? | Currently estimation includes 21 hrs for audit trail UI (item 36). If they only need data capture with no viewer, that saves hours. If they want full search/filter, current estimate may not be enough. | -21 hrs if no UI needed; +8-12 hrs if full search/filter beyond current estimate |

### 🔴 Operations & Performance

| # | Question | Why it matters | Potential impact |
|---|----------|---------------|-----------------|
| Q22 | How many concurrent users expected? How many line items per offer (100? 1,000? 10,000?)? How many active offers at once? | Performance requirements affect architecture decisions — especially for the in-cell editing grid. 10,000 rows in MudBlazor DataGrid behaves very differently than 100. | Could require virtualization, pagination strategy, or grid library change |
| Q23 | Data retention policy — how long keep closed offers, old bids, audit records? | Affects database sizing, archival strategy, and potentially query performance over time. | Sprint 0 decision — minimal hour impact but important for infrastructure |
| Q24 | In-app notifications needed? "Allocation pending your approval", "You've been outbid", "Offer closing in 1 hour"? | Even with email out of scope, in-app alerts could be essential for workflow adoption. Without them, managers won't know when to act. | +16-24 hrs (notification system + bell icon + read/unread state) |

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
- Q1 (Offer lifecycle states) — defines entire workflow
- Q3 (Oversubscription vs strict validation) — changes bid + allocation logic
- Q10 (Multi-currency) — could add 40-60 hrs
- Q5 (Concurrent editing) — architecture impact
- Q15 (Split allocation representation) — affects schema, audit, exports
- Q13 (BIN auto-allocate) — changes allocation flow
- Q21 (Audit UX scope) — could save or add hours
- Q22 (Performance/volume) — affects grid library decision
- Q24 (In-app notifications) — affects workflow adoption
