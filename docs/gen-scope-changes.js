#!/usr/bin/env node
/**
 * EMPA Scope Change Register Generator
 * 
 * Usage:
 *   node gen-scope-changes.js SC_001
 *   node gen-scope-changes.js SC_002
 * 
 * Reads:  docs/SC_XXX/scope-changes.json
 * Writes: docs/SC_XXX/scope-changes.docx
 * 
 * Then convert to PDF with:
 *   libreoffice --headless --convert-to pdf docs/SC_XXX/scope-changes.docx --outdir docs/SC_XXX/
 */

const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, LevelFormat,
        BorderStyle, WidthType, ShadingType, VerticalAlign, PageNumber,
        TabStopType, TabStopPosition } = require("docx");

// ========== RESOLVE SC FOLDER ==========
const scId = process.argv[2];
if (!scId) {
    console.error("Usage: node gen-scope-changes.js SC_001");
    console.error("\nAvailable folders:");
    const docsDir = path.resolve(__dirname);
    fs.readdirSync(docsDir).filter(f => f.startsWith("SC_") && fs.statSync(path.join(docsDir, f)).isDirectory())
        .forEach(f => console.error(`  ${f}`));
    process.exit(1);
}

const scDir = path.resolve(__dirname, scId);
const jsonPath = path.join(scDir, "scope-changes.json");

if (!fs.existsSync(scDir)) {
    fs.mkdirSync(scDir, { recursive: true });
    console.log(`Created folder: ${scDir}`);
}

if (!fs.existsSync(jsonPath)) {
    console.error(`Missing: ${jsonPath}`);
    console.error(`Create scope-changes.json in ${scDir}/ first.`);
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
console.log(`Generating scope change register for ${scId}...`);
console.log(`  Project: ${data.project}`);
console.log(`  Changes: ${data.changes.length} batch(es), ${data.changes.reduce((s,b) => s + b.items.length, 0)} total items`);

// ========== BRAND ==========
const BRAND = "1B3A5C";
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
const PW = 9360;

// ========== HELPERS ==========
function hCell(text, width, align) {
    return new TableCell({
        borders, width: { size: width, type: WidthType.DXA },
        shading: { fill: BRAND, type: ShadingType.CLEAR },
        margins: cm, verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: align || AlignmentType.LEFT,
            children: [new TextRun({ text, bold: true, font: "Arial", size: 17, color: W })] })]
    });
}

function tc(text, width, opts = {}) {
    return new TableCell({
        borders, width: { size: width, type: WidthType.DXA },
        shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR } : undefined,
        margins: cm, verticalAlign: VerticalAlign.CENTER,
        columnSpan: opts.span || 1,
        children: [new Paragraph({ alignment: opts.align || AlignmentType.LEFT,
            children: [new TextRun({ text: String(text), font: "Arial", size: opts.size || 18, bold: !!opts.bold, italics: !!opts.italics, color: opts.color || G800 })] })]
    });
}

function h1(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, font: "Arial" })] }); }
function h2(text) { return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, font: "Arial" })] }); }

function p(text, opts = {}) {
    return new Paragraph({ spacing: { after: opts.after || 120 }, alignment: opts.align,
        children: [new TextRun({ text, font: "Arial", size: opts.size || 21, bold: !!opts.bold, italics: !!opts.italics, color: opts.color || G800 })] });
}

function pMulti(runs, opts = {}) {
    return new Paragraph({ spacing: { after: opts.after || 120 }, alignment: opts.align,
        children: runs.map(r => new TextRun({ text: r.text, font: "Arial", size: r.size || 21, bold: !!r.bold, italics: !!r.italics, color: r.color || G800 })) });
}

function bullet(text) {
    return new Paragraph({ numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({ text, font: "Arial", size: 20 })] });
}

function spacer(pts) { return new Paragraph({ spacing: { after: pts || 200 } }); }

function impactColor(val) { return val > 0 ? RED : val < 0 ? GREEN : G800; }
function impactText(val) { return val > 0 ? `+${val} hrs` : val < 0 ? `${val} hrs` : "0 hrs"; }

function changeTypeBadge(type) {
    const map = {
        added: { text: "NEW", bg: GREEN },
        modified: { text: "MODIFIED", bg: ORANGE },
        removed: { text: "REMOVED", bg: RED },
        confirmed: { text: "CONFIRMED", bg: ACCENT }
    };
    return map[type] || map.added;
}

// ========== BASELINE TABLE ==========
function buildBaselineTable() {
    const b = data.baseline;
    const cw = [5400, 3960];
    const rows = [
        new TableRow({ tableHeader: true, children: [hCell("Metric", cw[0]), hCell("Value", cw[1])] }),
        new TableRow({ children: [tc("Baseline Date", cw[0]), tc(b.date, cw[1])] }),
        new TableRow({ children: [tc("MVP Hours (Auth Option A)", cw[0]), tc(`~${b.mvpHours} hrs`, cw[1], { bold: true })] }),
        new TableRow({ children: [tc("Post-MVP Hours", cw[0]), tc(`~${b.postMvpHours} hrs`, cw[1])] }),
        new TableRow({ children: [tc("Learning Curve", cw[0]), tc(`~${b.learningHours} hrs`, cw[1])] }),
        new TableRow({ children: [tc("Full Scope (MVP + Post-MVP + Learning)", cw[0]), tc(`~${b.fullScopeHours} hrs`, cw[1], { bold: true })] }),
    ];
    return new Table({ width: { size: PW, type: WidthType.DXA }, columnWidths: cw, rows });
}

// ========== CHANGE ITEM DETAIL ==========
function buildChangeDetail(item) {
    const badge = changeTypeBadge(item.changeType);
    const elements = [];

    elements.push(pMulti([
        { text: `${badge.text}  `, bold: true, color: badge.bg, size: 18 },
        { text: item.trigger, bold: true, size: 24, color: BRAND },
    ], { after: 80 }));

    if (item.clientAnswer && !item.clientAnswer.startsWith("N/A")) {
        elements.push(new Paragraph({
            spacing: { after: 80 },
            indent: { left: 360, right: 360 },
            border: { left: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 8 } },
            children: [
                new TextRun({ text: "Client answer: ", font: "Arial", size: 19, bold: true, color: ACCENT }),
                new TextRun({ text: `"${item.clientAnswer}"`, font: "Arial", size: 19, italics: true, color: G500 }),
            ]
        }));
    }

    elements.push(pMulti([
        { text: "Change: ", bold: true, size: 20 },
        { text: item.description, size: 20 },
    ], { after: 60 }));

    elements.push(p("Estimation items affected:", { bold: true, size: 19, after: 40 }));
    item.estimationItems.forEach(ei => { elements.push(bullet(ei)); });

    const cw = [3120, 3120, 3120];
    const impactTable = new Table({
        width: { size: PW, type: WidthType.DXA }, columnWidths: cw,
        rows: [
            new TableRow({ children: [
                tc("Hours Added", cw[0], { shade: G100, bold: true, align: AlignmentType.CENTER }),
                tc("Hours Removed", cw[1], { shade: G100, bold: true, align: AlignmentType.CENTER }),
                tc("Net Impact", cw[2], { shade: G100, bold: true, align: AlignmentType.CENTER }),
            ]}),
            new TableRow({ children: [
                tc(item.hoursAdded > 0 ? `+${item.hoursAdded} hrs` : "\u2014", cw[0], { align: AlignmentType.CENTER, color: item.hoursAdded > 0 ? RED : G500 }),
                tc(item.hoursRemoved > 0 ? `-${item.hoursRemoved} hrs` : "\u2014", cw[1], { align: AlignmentType.CENTER, color: item.hoursRemoved > 0 ? GREEN : G500 }),
                tc(impactText(item.netImpact), cw[2], { align: AlignmentType.CENTER, bold: true, color: impactColor(item.netImpact) }),
            ]}),
        ]
    });
    elements.push(spacer(80));
    elements.push(impactTable);

    elements.push(new Paragraph({
        spacing: { before: 160, after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: G200, space: 8 } },
    }));

    return elements;
}

// ========== BATCH SUMMARY TABLE ==========
function buildBatchSummary(summary) {
    const cw = [4800, 2280, 2280];
    const rows = [
        new TableRow({ tableHeader: true, children: [hCell("Metric", cw[0]), hCell("Before", cw[1]), hCell("After", cw[2])] }),
        new TableRow({ children: [
            tc("MVP Hours (Auth Option A)", cw[0]),
            tc(`~${summary.mvpBefore} hrs`, cw[1], { align: AlignmentType.RIGHT }),
            tc(`~${summary.mvpAfter} hrs`, cw[2], { align: AlignmentType.RIGHT, bold: true }),
        ]}),
        new TableRow({ children: [
            tc("Full Scope (MVP + Post-MVP + Learning)", cw[0]),
            tc(`~${summary.fullScopeBefore} hrs`, cw[1], { align: AlignmentType.RIGHT }),
            tc(`~${summary.fullScopeAfter} hrs`, cw[2], { align: AlignmentType.RIGHT, bold: true }),
        ]}),
        new TableRow({ children: [
            tc("Total Hours Added", cw[0], { shade: G100 }),
            tc("", cw[1], { shade: G100 }),
            tc(`+${summary.totalAdded} hrs`, cw[2], { shade: G100, align: AlignmentType.RIGHT, bold: true, color: RED }),
        ]}),
        new TableRow({ children: [
            tc("Total Hours Removed", cw[0], { shade: G100 }),
            tc("", cw[1], { shade: G100 }),
            tc(`-${summary.totalRemoved} hrs`, cw[2], { shade: G100, align: AlignmentType.RIGHT, color: GREEN }),
        ]}),
        new TableRow({ children: [
            new TableCell({ borders, width: { size: cw[0], type: WidthType.DXA }, shading: { fill: BRAND, type: ShadingType.CLEAR }, margins: cm,
                children: [new Paragraph({ children: [new TextRun({ text: "Net Impact on MVP", bold: true, font: "Arial", size: 19, color: W })] })] }),
            new TableCell({ borders, width: { size: cw[1], type: WidthType.DXA }, shading: { fill: BRAND, type: ShadingType.CLEAR }, margins: cm, children: [new Paragraph({ children: [] })] }),
            new TableCell({ borders, width: { size: cw[2], type: WidthType.DXA }, shading: { fill: BRAND, type: ShadingType.CLEAR }, margins: cm,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: impactText(summary.netImpact), bold: true, font: "Arial", size: 19, color: W })] })] }),
        ]}),
    ];
    // Add timeline rows if timelineContext is present in summary JSON
    if (summary.timelineContext) {
        const t2 = summary.timelineContext.twoDevs;
        const t3 = summary.timelineContext.threeDevs;
        rows.push(new TableRow({ children: [
            tc("MVP Timeline (2 devs)", cw[0], { shade: G100, bold: true }),
            tc("", cw[1], { shade: G100 }),
            tc(`~${t2.mvpMonths} months (~${t2.mvpWeeks} wks)`, cw[2], { shade: G100, align: AlignmentType.RIGHT, bold: true }),
        ]}));
        rows.push(new TableRow({ children: [
            tc("Full Scope (2 devs)", cw[0], { bold: true }),
            tc("", cw[1]),
            tc(`~${t2.fullMonths} months (~${t2.fullWeeks} wks)`, cw[2], { align: AlignmentType.RIGHT, bold: true }),
        ]}));
        rows.push(new TableRow({ children: [
            tc("MVP Timeline (3 devs)", cw[0], { shade: G100, bold: true }),
            tc("", cw[1], { shade: G100 }),
            tc(`~${t3.mvpMonths} months (~${t3.mvpWeeks} wks)`, cw[2], { shade: G100, align: AlignmentType.RIGHT, bold: true }),
        ]}));
        rows.push(new TableRow({ children: [
            tc("Full Scope (3 devs)", cw[0], { bold: true }),
            tc("", cw[1]),
            tc(`~${t3.fullMonths} months (~${t3.fullWeeks} wks)`, cw[2], { align: AlignmentType.RIGHT, bold: true }),
        ]}));
    }
    return new Table({ width: { size: PW, type: WidthType.DXA }, columnWidths: cw, rows });
}

// ========== CUMULATIVE SUMMARY ==========
function buildCumulativeTable() {
    const allChanges = data.changes;
    const last = allChanges[allChanges.length - 1];
    const totalNet = allChanges.reduce((sum, ch) => sum + ch.summary.netImpact, 0);
    const totalItems = allChanges.reduce((sum, ch) => sum + ch.items.length, 0);

    const cw = [5400, 3960];
    const rows = [
        new TableRow({ tableHeader: true, children: [hCell("Cumulative Metric", cw[0]), hCell("Value", cw[1])] }),
        new TableRow({ children: [tc("Total Change Batches", cw[0]), tc(String(allChanges.length), cw[1], { bold: true })] }),
        new TableRow({ children: [tc("Total Individual Changes", cw[0]), tc(String(totalItems), cw[1], { bold: true })] }),
        new TableRow({ children: [tc("Original MVP Estimate", cw[0]), tc(`~${data.baseline.mvpHours} hrs`, cw[1])] }),
        new TableRow({ children: [tc("Current MVP Estimate", cw[0]), tc(`~${last.summary.mvpAfter} hrs`, cw[1], { bold: true })] }),
        new TableRow({ children: [tc("Cumulative Net Impact on MVP", cw[0]), tc(impactText(totalNet), cw[1], { bold: true, color: impactColor(totalNet) })] }),
        new TableRow({ children: [tc("Original Full Scope", cw[0]), tc(`~${data.baseline.fullScopeHours} hrs`, cw[1])] }),
        new TableRow({ children: [tc("Current Full Scope", cw[0]), tc(`~${last.summary.fullScopeAfter} hrs`, cw[1], { bold: true })] }),
    ];
    // Add timeline from latest SC if available
    if (last.summary.timelineContext) {
        const t2 = last.summary.timelineContext.twoDevs;
        const t3 = last.summary.timelineContext.threeDevs;
        rows.push(new TableRow({ children: [tc("Current MVP Timeline (2 devs)", cw[0], { shade: G100 }), tc(`~${t2.mvpMonths} months`, cw[1], { bold: true, shade: G100 })] }));
        rows.push(new TableRow({ children: [tc("Current MVP Timeline (3 devs)", cw[0]), tc(`~${t3.mvpMonths} months`, cw[1], { bold: true })] }));
    }
    // Add open questions row if present
    if (data.openQuestions) {
        rows.push(new TableRow({ children: [tc("Open Discovery Questions", cw[0]), tc(data.openQuestions, cw[1], { color: ORANGE })] }));
    }
    return new Table({ width: { size: PW, type: WidthType.DXA }, columnWidths: cw, rows });
}

// ========== BUILD ALL CHANGE ELEMENTS ==========
function buildAllChangeElements() {
    const elements = [];
    data.changes.forEach((batch) => {
        elements.push(h1(`${batch.id}: ${batch.batch}`));
        elements.push(pMulti([
            { text: "Date: ", bold: true, size: 20 },
            { text: batch.date, size: 20 },
            { text: `    |    ${batch.items.length} changes    |    Net impact: `, size: 20 },
            { text: impactText(batch.summary.netImpact), bold: true, size: 20, color: impactColor(batch.summary.netImpact) },
        ], { after: 200 }));

        batch.items.forEach((item) => {
            elements.push(...buildChangeDetail(item));
        });

        elements.push(h2("Batch Summary"));
        elements.push(buildBatchSummary(batch.summary));
        if (batch.summary.note) {
            elements.push(p(batch.summary.note, { size: 18, italics: true, after: 200 }));
        }
    });
    return elements;
}

// ========== DOCUMENT ==========
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
    sections: [{
        properties: {
            page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
        },
        headers: { default: new Header({ children: [new Paragraph({
            children: [
                new TextRun({ text: "Scope Change Register", font: "Arial", size: 16, color: G500 }),
                new TextRun({ text: "\tSimpat Tech", font: "Arial", size: 16, color: G500 }),
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BRAND, space: 4 } },
        })] }) },
        footers: { default: new Footer({ children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: "Confidential \u2014 For internal use only", font: "Arial", size: 16, color: G500 }),
                new TextRun({ text: "\tPage ", font: "Arial", size: 16, color: G500 }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: G500 }),
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        })] }) },
        children: [
            new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Scope Change Register", font: "Arial", size: 36, bold: true, color: BRAND })] }),
            new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: data.project, font: "Arial", size: 22, color: ACCENT })] }),
            p(data.option, { bold: true, after: 80 }),
            p("This document tracks all scope changes to the estimation driven by client Q&A answers, stakeholder feedback, and discovery findings. Each change is linked to the specific client response that triggered it.", { size: 19, after: 240 }),

            h1("Baseline Estimation"),
            p(data.baseline.note, { size: 19, italics: true, after: 120 }),
            buildBaselineTable(),
            spacer(300),

            ...buildAllChangeElements(),
            spacer(200),

            h1("Cumulative Impact"),
            buildCumulativeTable(),
            spacer(200),

            p("This document is updated each time client answers or stakeholder decisions affect the project scope. All changes reference the specific trigger (Q&A answer, meeting decision, or discovery finding) that justified the modification.", { size: 18, italics: true }),
        ]
    }]
});

const outPath = path.join(scDir, "scope-changes.docx");
Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(outPath, buffer);
    console.log(`\nGenerated: ${outPath}`);
    console.log(`\nTo create PDF, run:`);
    console.log(`  libreoffice --headless --convert-to pdf "${outPath}" --outdir "${scDir}"`);
});
