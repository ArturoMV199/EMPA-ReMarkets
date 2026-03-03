#!/usr/bin/env node
/**
 * EMPA Estimation Document Generator
 * 
 * Usage:
 *   node gen-estimation.js
 * 
 * Reads:  docs/estimation-blazor.md (for reference — content is hardcoded for formatting control)
 * Writes: estimation-blazor.docx
 * 
 * Then convert to PDF with:
 *   libreoffice --headless --convert-to pdf estimation-blazor.docx
 * 
 * NOTE: When estimation-blazor.md changes, update the data arrays in this script.
 *       This ensures pixel-perfect table formatting that markdown parsing can't guarantee.
 */

const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, PageOrientation, HeadingLevel, LevelFormat,
        BorderStyle, WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak,
        TabStopType, TabStopPosition, SectionType } = require("docx");

// ========== BRAND ==========
const BRAND = "1E3A5F";
const ACCENT = "2563EB";
const GREEN = "059669";
const RED = "DC2626";
const ORANGE = "D97706";
const G100 = "F3F4F6";
const G200 = "E5E7EB";
const G500 = "6B7280";
const G800 = "1F2937";
const W = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: G200 };
const borders = { top: border, bottom: border, left: border, right: border };
const cm = { top: 50, bottom: 50, left: 80, right: 80 };

// Page dimensions
const LETTER_W = 12240;
const LETTER_H = 15840;
const MARGIN = 1440;
const PW_PORTRAIT = LETTER_W - 2 * MARGIN;   // 9360
const PW_LANDSCAPE = LETTER_H - 2 * MARGIN;  // 12960

// ========== HELPERS ==========
function hCell(text, width, align) {
    return new TableCell({
        borders, width: { size: width, type: WidthType.DXA },
        shading: { fill: BRAND, type: ShadingType.CLEAR },
        margins: cm, verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: align || AlignmentType.LEFT,
            children: [new TextRun({ text, bold: true, font: "Arial", size: 16, color: W })] })]
    });
}

function tc(text, width, opts = {}) {
    const runs = [];
    if (opts.bold2) {
        // Two-part: bold prefix + normal text
        runs.push(new TextRun({ text: opts.bold2, font: "Arial", size: opts.size || 16, bold: true, color: opts.color || G800 }));
        runs.push(new TextRun({ text: String(text), font: "Arial", size: opts.size || 16, bold: false, color: opts.color || G800 }));
    } else {
        runs.push(new TextRun({ text: String(text), font: "Arial", size: opts.size || 16, bold: !!opts.bold, italics: !!opts.italics, color: opts.color || G800 }));
    }
    return new TableCell({
        borders, width: { size: width, type: WidthType.DXA },
        shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR } : undefined,
        margins: cm, verticalAlign: VerticalAlign.CENTER,
        columnSpan: opts.span || 1,
        children: [new Paragraph({ alignment: opts.align || AlignmentType.LEFT, children: runs })]
    });
}

function sectionCell(text, totalWidth, cols) {
    return new TableRow({ children: [
        new TableCell({
            borders, width: { size: totalWidth, type: WidthType.DXA },
            shading: { fill: G100, type: ShadingType.CLEAR },
            margins: cm, columnSpan: cols,
            children: [new Paragraph({ children: [new TextRun({ text, bold: true, font: "Arial", size: 16, color: BRAND })] })]
        })
    ]});
}

function h1(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, font: "Arial" })] }); }
function h2(text) { return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, font: "Arial" })] }); }

function p(text, opts = {}) {
    return new Paragraph({ spacing: { after: opts.after || 120 }, alignment: opts.align,
        children: [new TextRun({ text, font: "Arial", size: opts.size || 20, bold: !!opts.bold, italics: !!opts.italics, color: opts.color || G800 })] });
}

function bullet(text) {
    return new Paragraph({ numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({ text, font: "Arial", size: 19 })] });
}

function spacer(pts) { return new Paragraph({ spacing: { after: pts || 200 } }); }

function makeHeader(rightText) {
    return new Header({ children: [new Paragraph({
        children: [
            new TextRun({ text: "Estimation: Bid Intelligence Platform", font: "Arial", size: 16, color: G500 }),
            new TextRun({ text: `\t${rightText}`, font: "Arial", size: 16, color: G500 }),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BRAND, space: 4 } },
    })] });
}

const footerObj = new Footer({ children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
        new TextRun({ text: "Confidential \u2014 Simpat Tech", font: "Arial", size: 16, color: G500 }),
        new TextRun({ text: "\tPage ", font: "Arial", size: 16, color: G500 }),
        new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: G500 }),
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
})] });

const portraitProps = {
    page: { size: { width: LETTER_W, height: LETTER_H }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } }
};

const landscapeProps = {
    page: {
        size: { width: LETTER_W, height: LETTER_H, orientation: PageOrientation.LANDSCAPE },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
    }
};

// ========== MVP TABLE DATA ==========
// [#, Module, Task, Complexity, BaseHrs, Factor, Adjusted, Notes]
const mvpItems = [
    // Setup
    ["1", "Setup", "Blazor Web App project scaffolding (Clean Architecture)", "Low", "12", "\u00d71.2", "14", "Single project, C# only"],
    ["2", "Setup", "EF Core setup, initial migrations, seed data", "Low", "12", "\u00d71.2", "14", ""],
    ["3", "Setup", "CI/CD pipeline (build + test + deploy)", "Low", "10", "\u00d71.2", "12", "Single project = simpler pipeline"],
    // Auth Option A
    ["4", "Auth", "Entra integration \u2014 Microsoft.Identity.Web (built-in Blazor auth)", "Medium", "12", "\u00d71.5", "18", "Simpler than MSAL.js"],
    ["5", "Auth", "Azure AD Group setup + group claims mapping (5 groups)", "Medium", "10", "\u00d71.5", "15", "Configure groups in Azure AD"],
    ["6", "Auth", "Dynamic role-based authorization + app-layer enforcement", "Medium", "14", "\u00d71.5", "21", "Policies reading AD group claims"],
    ["7", "Auth", "AuthorizeView components (dynamic role-based UI rendering)", "Low", "12", "\u00d71.2", "14", "Show/hide based on group membership"],
    // Customers
    ["8", "Customers", "Customer CRUD (API + Blazor pages)", "Low", "14", "\u00d71.2", "17", "Standard CRUD"],
    ["9", "Customers", "Customer assignment to Sales Reps/Managers", "Low", "8", "\u00d71.2", "10", ""],
    ["10", "Customers", "Customer deactivation (soft delete) + audit logging", "Low", "8", "\u00d71.2", "10", ""],
    // Inventory
    ["11", "Inventory", "Bulk CSV/Excel upload (parsing + validation + error handling)", "High", "24", "\u00d72.0", "48", "File parsing edge cases"],
    ["12", "Inventory", "Inventory identity \u2014 composite uniqueness + master vs source description", "High", "20", "\u00d72.0", "40", "Client-confirmed composite key"],
    ["12b", "Inventory", "Master description edit UI (search + inline edit + role restriction)", "Low", "6", "\u00d71.2", "8", "SC-002 A15: dedicated UI, audited"],
    ["13", "Inventory", "Inventory adjustment records (each upload = distinct transaction)", "Medium", "14", "\u00d71.5", "21", "Full audit trail per upload row"],
    ["14", "Inventory", "Inventory list view with state tracking (Available/Committed/Released)", "Medium", "14", "\u00d71.5", "21", ""],
    ["15", "Inventory", "Inventory grouping into offers", "Medium", "12", "\u00d71.5", "18", ""],
    ["16", "Inventory", "State transitions (automatic on approval + manual override)", "Medium", "16", "\u00d71.5", "24", "Business rules complexity"],
    // Bids
    ["17", "Bids", "Create/Edit offers (Blazor forms)", "Medium", "14", "\u00d71.5", "21", ""],
    ["18", "Bids", "Offer list view with filtering and sorting", "Medium", "10", "\u00d71.5", "15", ""],
    ["19", "Bids", "MudBlazor DataGrid \u2014 in-cell editing for line-item bids", "High", "28", "\u00d72.0", "56", "Core feature, DataGrid config"],
    ["20", "Bids", "Bid uniqueness enforcement + revision tracking", "Medium", "10", "\u00d71.5", "15", "One active bid per customer/line/offer"],
    ["21", "Bids", "Bid types support (bid/BIN/target pricing)", "Medium", "12", "\u00d71.5", "18", ""],
    ["22", "Bids", "Winning/losing bid capture and status tracking", "Medium", "12", "\u00d71.5", "18", ""],
    ["23", "Bids", "Bid history (view previous revisions per line item)", "Medium", "14", "\u00d71.5", "21", ""],
    // Allocation
    ["24", "Allocation", "Aggregated allocation view (all bids per offer)", "Medium", "14", "\u00d71.5", "21", ""],
    ["25", "Allocation", "Admin override of winning customer", "Medium", "12", "\u00d71.5", "18", ""],
    ["26", "Allocation", "Approval workflow (Pending \u2192 Approved/Rejected) \u2014 all manager-approved Phase 1", "High", "24", "\u00d72.0", "48", "Admin has full authority incl. override"],
    ["27", "Allocation", "Visual pricing indicators (\u201cbelow floor\u201d warnings)", "Medium", "8", "\u00d71.5", "12", "Visual only Phase 1, no auto-reject"],
    ["28", "Allocation", "Automatic inventory commitment on approval", "Medium", "12", "\u00d71.5", "18", ""],
    // Reversal
    ["29", "Allocation", "Allocation reversal (return inv. to Available, mark Reversed, lock export)", "High", "20", "\u00d72.0", "40", "State machine + inventory rollback"],
    ["30", "Allocation", "Reversal reason code (required) + full audit trail", "Medium", "8", "\u00d71.5", "12", "Reason code dropdown + audit"],
    // Tie-breaker
    ["31", "Allocation", "Tie detection logic + resolution UI", "Medium", "8", "\u00d71.5", "12", "Admin picks winner from tied bids"],
    // Act-on-Behalf
    ["32", "Act-on-Behalf", "Act-on-behalf capability \u2014 full attribution + audit", "High", "24", "\u00d72.0", "48", "Custom AuthenticationStateProvider"],
    ["33", "Act-on-Behalf", "Act-on-behalf UI (customer selector + visual indicator)", "Medium", "10", "\u00d71.5", "15", "Clear visual cue"],
    // Split Allocations
    ["34", "Allocation", "Partial/split allocations across customers", "High", "24", "\u00d72.0", "48", "Manual decision by manager"],
    // Audit
    ["35", "Audit", "Audit logging middleware (insert-only AuditLog table)", "Medium", "16", "\u00d71.5", "24", ""],
    ["36", "Audit", "Audit trail UI (view history per entity)", "Medium", "14", "\u00d71.5", "21", ""],
    // Exports
    ["37", "Exports", "CSV export from approved allocations", "Low", "8", "\u00d71.2", "10", ""],
    // Permissions
    ["38", "Permissions", "Role-based UI visibility (AuthorizeView across pages)", "Medium", "14", "\u00d71.5", "21", ""],
    // QA
    ["39", "QA", "Unit tests (services + critical business logic)", "Medium", "20", "\u00d71.5", "30", ""],
    ["40", "QA", "Integration tests (API/page endpoints)", "Medium", "14", "\u00d71.5", "21", ""],
    ["41", "QA", "Bug fixing buffer (10% of MVP hours)", "\u2014", "\u2014", "\u2014", "90", "Based on ~900 hrs pre-buffer"],
];

// Section headers for MVP table
const mvpSections = {
    0: "Project Setup",
    3: "Authentication & Authorization \u2014 Option A: Azure AD Groups (Confirmed)",
    7: "Customer Management",
    10: "Inventory Management",
    17: "Bid & Offer Management",
    24: "Allocation & Approval Workflow",
    29: "Allocation Reversal (Client-confirmed)",
    31: "Allocation Tie-Breaker (Client-confirmed)",
    32: "Act-on-Behalf (Client-requested \u2014 Kim: \u201cvery important\u201d)",
    34: "Split Allocations (Client-requested)",
    35: "Audit & Compliance",
    37: "Order-Ready Exports",
    38: "Permissions UI",
    39: "Testing & Bug Buffer",
};

// Post-MVP items
const postMvpItems = [
    ["42", "Allocation", "Escalation paths (auto-escalate if not approved in X time)", "Medium", "16", "\u00d71.5", "24", "Suggested enhancement"],
    ["43", "Exports", "PDF export (order-ready documents via QuestPDF)", "Medium", "14", "\u00d71.5", "21", "Client mentioned; CSV is in MVP"],
    ["44", "Audit", "Advanced audit views (filter by user, date, entity type)", "Medium", "10", "\u00d71.5", "15", "Suggested enhancement"],
    ["45", "Admin", "System configuration UI (thresholds, settings)", "Medium", "14", "\u00d71.5", "21", "Suggested enhancement"],
    ["46", "QA", "UAT support + bug fixes from user feedback", "Medium", "24", "\u00d71.5", "36", "Standard"],
];

// ========== BUILD MVP TABLE ==========
function buildMvpTable() {
    const cw = [550, 1100, 4100, 900, 800, 750, 900, 3860];
    const totalWidth = cw.reduce((a, b) => a + b, 0);
    const headers = ["#", "Module", "Task", "Complexity", "Base Hrs", "Factor", "Adjusted", "Notes"];
    
    const rows = [
        new TableRow({ tableHeader: true, children: headers.map((h, i) => hCell(h, cw[i], i >= 3 && i <= 6 ? AlignmentType.CENTER : AlignmentType.LEFT)) })
    ];

    mvpItems.forEach((item, idx) => {
        if (mvpSections[idx] !== undefined) {
            rows.push(sectionCell(mvpSections[idx], totalWidth, 8));
        }
        rows.push(new TableRow({
            children: item.map((val, i) => tc(val, cw[i], {
                align: i >= 3 && i <= 6 ? AlignmentType.CENTER : AlignmentType.LEFT,
                bold: i === 6, // Adjusted column bold
                size: 15,
            }))
        }));
    });

    // Total row
    rows.push(new TableRow({ children: [
        new TableCell({ borders, width: { size: cw[0] + cw[1] + cw[2] + cw[3] + cw[4] + cw[5], type: WidthType.DXA }, columnSpan: 6,
            shading: { fill: BRAND, type: ShadingType.CLEAR }, margins: cm,
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "MVP Total (Auth Option A)", bold: true, font: "Arial", size: 16, color: W })] })] }),
        tc("~998 hrs", cw[6], { bold: true, align: AlignmentType.CENTER, shade: BRAND, color: W, size: 16 }),
        tc("", cw[7], { shade: BRAND }),
    ]}));

    return new Table({ width: { size: totalWidth, type: WidthType.DXA }, columnWidths: cw, rows });
}

// ========== BUILD POST-MVP TABLE ==========
function buildPostMvpTable() {
    const cw = [550, 1100, 4100, 900, 800, 750, 900, 3860];
    const totalWidth = cw.reduce((a, b) => a + b, 0);
    const headers = ["#", "Module", "Task", "Complexity", "Base Hrs", "Factor", "Adjusted", "Source"];
    
    const rows = [
        new TableRow({ tableHeader: true, children: headers.map((h, i) => hCell(h, cw[i], i >= 3 && i <= 6 ? AlignmentType.CENTER : AlignmentType.LEFT)) })
    ];

    postMvpItems.forEach(item => {
        rows.push(new TableRow({
            children: item.map((val, i) => tc(val, cw[i], {
                align: i >= 3 && i <= 6 ? AlignmentType.CENTER : AlignmentType.LEFT,
                bold: i === 6, size: 15,
            }))
        }));
    });

    rows.push(new TableRow({ children: [
        new TableCell({ borders, width: { size: cw[0] + cw[1] + cw[2] + cw[3] + cw[4] + cw[5], type: WidthType.DXA }, columnSpan: 6,
            shading: { fill: BRAND, type: ShadingType.CLEAR }, margins: cm,
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Post-MVP Total", bold: true, font: "Arial", size: 16, color: W })] })] }),
        tc("~117 hrs", cw[6], { bold: true, align: AlignmentType.CENTER, shade: BRAND, color: W, size: 16 }),
        tc("", cw[7], { shade: BRAND }),
    ]}));

    return new Table({ width: { size: totalWidth, type: WidthType.DXA }, columnWidths: cw, rows });
}

// ========== SIMPLE TABLE (portrait width) ==========
function simpleTable(headers, dataRows, colWidths) {
    const rows = [
        new TableRow({ tableHeader: true, children: headers.map((h, i) => hCell(h, colWidths[i])) })
    ];
    dataRows.forEach(row => {
        rows.push(new TableRow({
            children: row.map((val, i) => tc(val, colWidths[i], { size: 17 }))
        }));
    });
    return new Table({ width: { size: colWidths.reduce((a,b) => a + b, 0), type: WidthType.DXA }, columnWidths: colWidths, rows });
}

// ========== SUMMARY TABLE ==========
function buildSummaryTable() {
    const cw = [5800, 3560];
    return simpleTable(["Concept", "Hours"], [
        ["MVP (Must Have) \u2014 Auth Option A: Azure AD Groups", "~998 hrs"],
        ["MVP (Must Have) \u2014 Auth Option B: Internal DB Roles", "~1,022 hrs"],
        ["Post-MVP (Should Have)", "~117 hrs"],
        ["Learning Curve", "~56 hrs"],
        ["Full Scope (MVP + Post-MVP + Learning) \u2014 Auth Option A", "~1,171 hrs"],
        ["Full Scope (MVP + Post-MVP + Learning) \u2014 Auth Option B", "~1,195 hrs"],
    ], cw);
}

// ========== RISK TABLE ==========
function buildRiskTable() {
    const cw = [3200, 1200, 1000, 1400, 6160];
    return simpleTable(["Risk", "Probability", "Impact", "Hours at Risk", "Mitigation"], [
        ["MudBlazor DataGrid insufficient for in-cell editing", "Medium", "High", "+16-24 hrs", "Evaluate Sprint 0; Telerik/Syncfusion fallback"],
        ["SignalR connection reliability", "Low", "Medium", "+8-16 hrs", "Built-in reconnection; test under real network"],
        ["Blazor community smaller", "Medium", "Medium", "+8-16 hrs", "MudBlazor Discord, Microsoft docs"],
        ["Partial/split allocation rules unclear", "Low", "High", "+24-40 hrs", "SC-003 resolved: auto-release, no reservation, flat records"],
        ["Allocation reversal edge cases", "Medium", "High", "+16-24 hrs", "Define reversal rules with POs; test with real scenarios"],
        ["Inventory composite uniqueness conflicts", "Medium", "Medium", "+8-16 hrs", "Define exact rules with client; validate Sprint 0"],
        ["CSV upload edge cases", "Medium", "Medium", "+8-16 hrs", "Define validation rules; limit file sizes"],
        ["Azure infra not available on time", "Medium", "High", "Blocks 1-2 wk", "Confirm access before Sprint 1"],
        ["Scope creep from 3 Product Owners", "Medium", "High", "+40-80 hrs", "Reference charter; change request process"],
        ["Open discovery questions (21 unresolved)", "High", "High", "+40-150 hrs", "Prioritize before Sprint 1; see discovery-questions.md"],
    ], cw);
}

// ========== TIMELINE TABLE ==========
function buildTimelineTable(devCount, hrsPerWeek) {
    const cw = [2800, 2500, 2000, 2060];
    return simpleTable(["Scenario", "Scope", "Hours", "Calendar Estimate"], [
        ["MVP only", "Must Have + Learning", `~${998 + 56} hrs`, `~${((998+56)/hrsPerWeek).toFixed(1)} weeks (~${((998+56)/hrsPerWeek/4).toFixed(1)} months)`],
        ["MVP + Post-MVP", "Full Phase 1", `~1,171 hrs`, `~${(1171/hrsPerWeek).toFixed(1)} weeks (~${(1171/hrsPerWeek/4).toFixed(1)} months)`],
    ], cw);
}

// ========== GRID LIBRARY TABLE ==========
function buildGridTable() {
    const cw = [2200, 2500, 1600, 1400, 3260];
    return simpleTable(["Library", "License", "Cost", "In-Cell Editing", "Notes"], [
        ["MudBlazor DataGrid (Recommended)", "MIT (free, open source)", "$0", "Good", "Active community, evaluate Sprint 0"],
        ["Radzen DataGrid", "MIT (free, open source)", "$0", "Good", "Alternative to MudBlazor"],
        ["AG Grid (Blazor wrapper)", "Community: MIT / Enterprise: Commercial", "~$1,100/dev", "Best-in-class", "Same AG Grid as React"],
        ["Telerik UI for Blazor", "Commercial (paid license)", "~$1,000/dev/yr", "Excellent", "Full UI suite + professional support"],
        ["Syncfusion Blazor", "Community: free <$1M rev", "$0 or ~$995/dev/yr", "Very good", "Free tier may apply"],
        ["Manual (jQuery/JS)", "N/A", "$0", "Painful", "NOT recommended \u2014 conflicts with Blazor DOM"],
    ], cw);
}

// ========== LEARNING CURVE TABLE ==========
function buildLearningTable() {
    const cw = [3200, 1200, 1000, 3960];
    return simpleTable(["Technology", "Who", "Hours", "Justification"], [
        ["Blazor component model + render modes", "Dev 1", "12", "Components, lifecycle, SSR vs Interactive"],
        ["Blazor component model + render modes", "Dev 2", "12", "Same"],
        ["MudBlazor (DataGrid + UI components)", "Dev 1", "8", "Grid API, cell editing, forms"],
        ["MudBlazor (DataGrid + UI components)", "Dev 2", "6", "Support knowledge"],
        ["Microsoft.Identity.Web (Blazor auth)", "Dev 1", "6", "Built-in auth patterns"],
        ["Azure App Service + SQL (if new)", "Both", "8", "Deployment, config"],
        ["CI/CD pipeline setup", "TBD", "4", "Single project = simpler"],
    ], cw);
}

// ========== COMPARISON TABLE ==========
function buildComparisonTable() {
    const cw = [3200, 2500, 2500, 1160];
    return simpleTable(["Metric", "React + .NET 10", "Blazor + .NET 10", "Difference"], [
        ["MVP Hours (Auth Option A)", "~1,100 hrs*", "~998 hrs", "Blazor saves ~102 hrs"],
        ["Post-MVP Hours", "~126 hrs", "~117 hrs", "Blazor saves ~9 hrs"],
        ["Learning Curve", "~100 hrs", "~56 hrs", "Blazor saves ~44 hrs"],
        ["Total Hours (Auth Option A)", "~1,326 hrs*", "~1,171 hrs", "Blazor saves ~155 hrs"],
        ["MVP Timeline (2 devs)", "~15 weeks*", "~13.2 weeks", "~1.8 weeks faster"],
        ["Full Scope Timeline (2 devs)", "~16.5 weeks*", "~14.6 weeks", "~1.9 weeks faster"],
        ["In-cell editing quality", "Best (AG Grid)", "Good (MudBlazor)", "React has better grid"],
        ["Future customer portal", "Excellent", "Good", "React better long-term"],
        ["Hiring future devs", "Excellent", "Limited", "React market larger"],
        ["CI/CD complexity", "Medium (2 deploys)", "Low (1 deploy)", "Blazor simpler"],
    ], cw);
}

// ========== DOCUMENT ASSEMBLY ==========
const doc = new Document({
    numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
    styles: {
        default: { document: { run: { font: "Arial", size: 21 } } },
        paragraphStyles: [
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 28, bold: true, font: "Arial", color: BRAND }, paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 0 } },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 24, bold: true, font: "Arial", color: BRAND }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
        ]
    },
    sections: [
        // ===== SECTION 1: Intro + Architecture + Grid Library (Portrait) =====
        {
            properties: portraitProps,
            headers: { default: makeHeader("Simpat Tech") },
            footers: { default: footerObj },
            children: [
                new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Estimation: Bid Intelligence Platform", font: "Arial", size: 36, bold: true, color: BRAND })] }),
                new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "ReMarkets \u2014 Bid Intelligence Platform", font: "Arial", size: 22, color: ACCENT })] }),
                p("Option B \u2014 Blazor Web App + .NET 10", { bold: true, after: 200 }),

                h1("Scope Summary"),
                p("Internal web application for REMarkets to replace spreadsheet/email-based bidding workflows. Covers bid management, inventory handling, allocation approvals, role-based access, act-on-behalf, audit trails, and order-ready exports. Authentication via Microsoft Entra. All data stored in clean, normalized SQL for future analytics consumption."),

                h1("Architecture Summary"),
                bullet("Frontend + Backend: Blazor Web App (.NET 10) \u2014 unified C# codebase"),
                bullet("Render Modes: Static SSR for simple pages, Interactive Server for bid tables and allocation views"),
                bullet("UI Components: MudBlazor (free) with DataGrid for in-cell editing"),
                bullet("Database: Azure SQL Database with Entity Framework Core 10 (Code-First)"),
                bullet("Auth: Microsoft Entra ID via Microsoft.Identity.Web (built-in Blazor auth)"),
                bullet("Hosting: Azure App Service (3 environments: Dev, Test, Prod)"),
                bullet("Deploy: Single project, single deploy"),

                h1("Data Grid Library Options"),
                p("The in-cell editing grid is the most critical UI component \u2014 it\u2019s where sales reps enter bids, quantities, and prices directly in a table (like Excel in the browser)."),
                buildGridTable(),
                spacer(120),
                p("Recommendation: Start with MudBlazor (free, MIT). If Sprint 0 shows it\u2019s insufficient, upgrade to Telerik or AG Grid (~$2\u20133K for 2\u20133 devs).", { bold: true, size: 19 }),

                h1("MVP Definition"),
                p("Core question: Can REMarkets run 100% of internal bid-to-allocation workflows through the platform instead of spreadsheets and email?", { bold: true }),
                p("MVP goal: A working web application where sales reps can create offers, enter bids, upload inventory, and route allocations through an approval workflow \u2014 with full audit logging and role-based access."),
            ]
        },

        // ===== SECTION 2: MVP Table (Landscape) =====
        {
            properties: landscapeProps,
            headers: { default: makeHeader("Simpat Tech") },
            footers: { default: footerObj },
            children: [
                h1("MVP Scope (Must Have)"),
                p("Without these, the project fails to replace the current spreadsheet/email process.", { after: 200 }),
                buildMvpTable(),
            ]
        },

        // ===== SECTION 3: Post-MVP + Backlog (Landscape) =====
        {
            properties: landscapeProps,
            headers: { default: makeHeader("Simpat Tech") },
            footers: { default: footerObj },
            children: [
                h1("Post-MVP Scope (Should Have)"),
                p("Features that add value after MVP is stable.", { after: 200 }),
                buildPostMvpTable(),
                spacer(300),

                h1("Backlog (Could Have)"),
                simpleTable(["#", "Task", "Source"], [
                    ["47", "Dashboard with key metrics (active offers, pending approvals, recent bids)", "Suggested enhancement"],
                    ["48", "Bulk bid operations (approve/reject multiple at once)", "Suggested enhancement"],
                    ["49", "Advanced search and filtering across all entities", "Suggested enhancement"],
                    ["50", "Email notifications on approval status changes", "Suggested enhancement"],
                    ["51", "Data export API for future external consumption", "Suggested enhancement"],
                    ["52", "User activity log (who logged in when)", "Suggested enhancement"],
                ], [550, 8600, 3810]),

                spacer(200),
                h2("Out of Scope (Won\u2019t Have)"),
                bullet("Customer-facing portal (future phase)"),
                bullet("In-app analytics dashboards (future consideration)"),
                bullet("Mobile application"),
                bullet("Integration with external ERP or order management systems"),
                bullet("Email/notifications"),
            ]
        },

        // ===== SECTION 4: Learning Curve + Risk (Landscape) =====
        {
            properties: landscapeProps,
            headers: { default: makeHeader("Simpat Tech") },
            footers: { default: footerObj },
            children: [
                h1("Learning Curve Budget"),
                buildLearningTable(),
                new Paragraph({ spacing: { after: 80 }, children: [
                    new TextRun({ text: "Learning Curve Total: ", bold: true, font: "Arial", size: 20, color: BRAND }),
                    new TextRun({ text: "~56 hrs", bold: true, font: "Arial", size: 20, color: G800 }),
                ]}),
                spacer(300),

                h1("Risk Assessment"),
                buildRiskTable(),
            ]
        },

        // ===== SECTION 5: Summary + Timelines + Comparison + Sign-off (Portrait) =====
        {
            properties: portraitProps,
            headers: { default: makeHeader("Simpat Tech") },
            footers: { default: footerObj },
            children: [
                h1("Summary"),
                buildSummaryTable(),
                spacer(80),
                p("Updated Feb\u2013Mar 2026 after client Q&A. SC-001: +146 hrs. SC-002: +8 hrs. SC-003: 0 hrs (design decisions only, no new scope).", { size: 17, italics: true, after: 300 }),

                h2("Timeline Scenarios \u2014 Auth Option A (2 developers, 80 hrs/week)"),
                buildTimelineTable(2, 80),
                spacer(200),

                h2("With 3 developers (120 hrs/week)"),
                buildTimelineTable(3, 120),
                spacer(80),
                p("Auth Option B adds ~24 hrs to all scenarios. Timelines assume devs are productive from week 1 after learning curve. Actual ramp-up may add 1\u20132 weeks.", { size: 17, italics: true, after: 300 }),

                h1("Head-to-Head: React vs Blazor"),
                buildComparisonTable(),
                spacer(80),
                p("* React estimation not yet updated with client Q&A scope changes. Numbers are projected proportional estimates.", { size: 17, italics: true }),
                p("Bottom line: Blazor saves ~160 hours and ~2 weeks on timeline. React costs more upfront but offers better in-cell editing, easier hiring, and a stronger path to a future customer portal.", { bold: true, after: 300 }),

                h1("Team Sign-off"),
                simpleTable(["Name", "Role", "Approved"], [
                    ["TBD", "Simpat Lead", ""],
                    ["TBD", "Dev 1", ""],
                    ["TBD", "Dev 2", ""],
                ], [3120, 3120, 3120]),
            ]
        }
    ]
});

const outDir = path.resolve(__dirname);
const outPath = path.join(outDir, "estimation-blazor.docx");
Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(outPath, buffer);
    console.log(`Generated: ${outPath}`);
    console.log(`\nTo create PDF, run:`);
    console.log(`  libreoffice --headless --convert-to pdf "${outPath}" --outdir "${outDir}"`);
});
