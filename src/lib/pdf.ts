import jsPDF from "jspdf";
import { ScanRequest, Finding, Severity } from "./types";

const COLORS = {
  primary: [15, 23, 42] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  success: [16, 185, 129] as [number, number, number],
  destructive: [244, 63, 94] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  orange: [249, 115, 22] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  bg: [248, 250, 252] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
};

const severityColor: Record<Severity, [number, number, number]> = {
  critical: COLORS.destructive,
  high: COLORS.orange,
  medium: COLORS.warning,
  low: COLORS.muted,
};

const ratingColor = (rating: string): [number, number, number] => {
  if (rating === "Excellent" || rating === "Good") return COLORS.success;
  if (rating === "Needs Work") return COLORS.warning;
  return COLORS.destructive;
};

function checkPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 270) {
    doc.addPage();
    return 20;
  }
  return y;
}

export function generatePDF(scan: ScanRequest): void {
  if (!scan.result) return;
  const { result } = scan;
  const doc = new jsPDF("p", "mm", "a4");
  const pw = 210;
  const margin = 20;
  const contentW = pw - margin * 2;

  // ===== COVER PAGE =====
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pw, 297, "F");

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("BRADU SECURE AI", margin, 40);

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("Security Assessment", margin, 65);
  doc.text("Report", margin, 78);

  doc.setDrawColor(...COLORS.white);
  doc.setLineWidth(0.5);
  doc.line(margin, 90, margin + 40, 90);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(scan.url, margin, 105);
  doc.setFontSize(10);
  doc.text(new Date(result.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), margin, 113);

  // Score circle on cover
  const cx = pw / 2, cy = 180, r = 35;
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  doc.circle(cx, cy, r);
  const rc = ratingColor(result.rating);
  doc.setFillColor(...rc);
  doc.circle(cx, cy, r - 4, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text(String(result.score), cx, cy + 4, { align: "center" });
  doc.setFontSize(10);
  doc.text("/ 100", cx, cy + 13, { align: "center" });

  doc.setFontSize(14);
  doc.text(result.rating, cx, cy + r + 14, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(180, 190, 210);
  doc.text(`Report generated for ${scan.email}`, margin, 275);
  doc.text(`Scan duration: ${result.scanDuration}s`, margin, 281);

  // ===== PAGE 2: EXECUTIVE SUMMARY =====
  doc.addPage();
  let y = 25;

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", margin, y);
  y += 10;

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pw - margin, y);
  y += 8;

  const sevCounts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  result.findings.forEach((f) => sevCounts[f.severity]++);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);

  const summaryLines = doc.splitTextToSize(
    `The security assessment of ${scan.url} identified ${result.findings.length} findings across multiple categories. ` +
    `The overall security score is ${result.score}/100, rated as ${result.rating}. ` +
    (sevCounts.critical > 0 ? `There ${sevCounts.critical === 1 ? "is" : "are"} ${sevCounts.critical} critical finding${sevCounts.critical > 1 ? "s" : ""} requiring immediate attention. ` : "") +
    `The scan completed in ${result.scanDuration} seconds.`,
    contentW
  );
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 10;

  // Severity summary boxes
  const boxW = (contentW - 9) / 4;
  (["critical", "high", "medium", "low"] as Severity[]).forEach((sev, i) => {
    const bx = margin + i * (boxW + 3);
    doc.setFillColor(...severityColor[sev]);
    doc.roundedRect(bx, y, boxW, 22, 2, 2, "F");
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(String(sevCounts[sev]), bx + boxW / 2, y + 10, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(sev.charAt(0).toUpperCase() + sev.slice(1), bx + boxW / 2, y + 17, { align: "center" });
  });
  y += 32;

  // ===== FINDINGS TABLE =====
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Key Findings", margin, y);
  y += 8;

  // Table header
  doc.setFillColor(...COLORS.bg);
  doc.rect(margin, y, contentW, 8, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.muted);
  doc.text("SEVERITY", margin + 2, y + 5.5);
  doc.text("FINDING", margin + 28, y + 5.5);
  doc.text("CATEGORY", margin + contentW - 35, y + 5.5);
  y += 10;

  result.findings.forEach((f) => {
    y = checkPage(doc, y, 10);
    // Severity badge
    doc.setFillColor(...severityColor[f.severity]);
    doc.roundedRect(margin + 1, y - 3, 22, 6, 1, 1, "F");
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(f.severity.toUpperCase(), margin + 12, y + 1, { align: "center" });

    // Title
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const titleLines = doc.splitTextToSize(f.title, 90);
    doc.text(titleLines[0], margin + 28, y + 1);

    // Category
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(7);
    doc.text(f.category, margin + contentW - 35, y + 1);

    y += 8;
    doc.setDrawColor(...COLORS.border);
    doc.line(margin, y - 2, pw - margin, y - 2);
  });

  // ===== DETAILED FINDINGS =====
  doc.addPage();
  y = 25;
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Detailed Findings", margin, y);
  y += 10;
  doc.setDrawColor(...COLORS.border);
  doc.line(margin, y, pw - margin, y);
  y += 8;

  result.findings.forEach((f, idx) => {
    y = checkPage(doc, y, 45);

    // Severity + title
    doc.setFillColor(...severityColor[f.severity]);
    doc.roundedRect(margin, y - 3, 22, 6, 1, 1, "F");
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(f.severity.toUpperCase(), margin + 11, y + 1, { align: "center" });

    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(f.title, margin + 26, y + 1);
    y += 8;

    // Description
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(f.description, contentW - 4);
    doc.text(descLines, margin + 2, y);
    y += descLines.length * 4.5 + 4;

    // Evidence box
    doc.setFillColor(...COLORS.bg);
    const evLines = doc.splitTextToSize(f.evidence, contentW - 12);
    const evH = evLines.length * 4 + 8;
    doc.roundedRect(margin, y - 2, contentW, evH, 1, 1, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.muted);
    doc.text("EVIDENCE", margin + 4, y + 3);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.primary);
    doc.text(evLines, margin + 4, y + 8);
    y += evH + 3;

    // Remediation box
    const remLines = doc.splitTextToSize(f.remediation, contentW - 12);
    const remH = remLines.length * 4 + 8;
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, y - 2, contentW, remH, 1, 1, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.success);
    doc.text("REMEDIATION", margin + 4, y + 3);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.primary);
    doc.text(remLines, margin + 4, y + 8);
    y += remH + 10;
  });

  // ===== REMEDIATION PLAN =====
  y = checkPage(doc, y, 60);
  if (y < 30) y = 25;
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Remediation Plan", margin, y);
  y += 8;

  const criticalFindings = result.findings.filter(f => f.severity === "critical");
  const highFindings = result.findings.filter(f => f.severity === "high");
  const otherFindings = result.findings.filter(f => f.severity === "medium" || f.severity === "low");

  const plans = [
    { label: "Quick Wins (24–48 hours)", items: criticalFindings, color: COLORS.destructive },
    { label: "Short-term (7–14 days)", items: highFindings, color: COLORS.orange },
    { label: "Medium-term (30 days)", items: otherFindings, color: COLORS.warning },
  ];

  plans.forEach((plan) => {
    if (plan.items.length === 0) return;
    y = checkPage(doc, y, 15);
    doc.setFillColor(...plan.color);
    doc.roundedRect(margin, y - 3, 3, 6, 1, 1, "F");
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(plan.label, margin + 6, y + 1);
    y += 7;
    plan.items.forEach((f) => {
      y = checkPage(doc, y, 6);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.muted);
      doc.text(`•  ${f.title}`, margin + 8, y);
      y += 5;
    });
    y += 4;
  });

  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text("Bradu Secure AI — Confidential", margin, 290);
    doc.text(`Page ${i} of ${pageCount}`, pw - margin, 290, { align: "right" });
  }

  const domain = scan.url.replace(/^https?:\/\//, "").replace(/\/$/, "").replace(/[^a-zA-Z0-9.-]/g, "_");
  doc.save(`bradu-security-report-${domain}.pdf`);
}
