"use client";

import { ResumeData, TemplateId } from "@/types";

// ── Shared helpers ─────────────────────────────────────────────────────────

type Doc = import("jspdf").jsPDF;

function wrap(doc: Doc, text: string, maxW: number): string[] {
  const words = String(text ?? "").split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (doc.getTextWidth(test) > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

function validDate(d?: string): string | null {
  if (!d) return null;
  const t = d.trim();
  return ["string","null","undefined",""].includes(t) ? null : t;
}

// ── Shared colour palette ─────────────────────────────────────────────────
const C = {
  navy:    [15,  23,  42]  as [number,number,number],
  navyMid: [30,  41,  59]  as [number,number,number],
  accent:  [56, 189, 248]  as [number,number,number],
  sidebar: [241,245,249]   as [number,number,number],
  white:   [255,255,255]   as [number,number,number],
  dark:    [15,  23,  42]  as [number,number,number],
  mid:     [71,  85, 105]  as [number,number,number],
  light:   [148,163,184]   as [number,number,number],
  rule:    [226,232,240]   as [number,number,number],
};

// ══════════════════════════════════════════════════════════════════════════
// TEMPLATE 1 — Modern Pro  (two-column, navy header)
// ══════════════════════════════════════════════════════════════════════════
function buildModernPro(doc: Doc, data: ResumeData) {
  const PW = 612, PH = 792;
  const HDR = 108, SBW = 188, SBPAD = 20, MPAD = 26;
  const MX = SBW, MW = PW - SBW, SBCW = SBW - SBPAD * 2, MCW = MW - MPAD * 2;

  let sbY = HDR + 24, mainY = HDR + 24;

  const paint = () => {
    doc.setFillColor(...C.navy);   doc.rect(0, 0, PW, HDR, "F");
    doc.setFillColor(...C.accent); doc.rect(0, HDR - 3, PW, 3, "F");
    doc.setFillColor(...C.sidebar);doc.rect(0, HDR, SBW, PH - HDR, "F");
    doc.setFillColor(...C.white);  doc.rect(MX, HDR, MW, PH - HDR, "F");
    doc.setDrawColor(...C.rule);   doc.setLineWidth(0.5); doc.line(SBW, HDR, SBW, PH);
  };
  paint();

  const newPage = () => {
    doc.addPage(); paint(); sbY = HDR + 18; mainY = HDR + 18;
  };
  const chkSb   = (n: number) => { if (sbY   + n > PH - 20) newPage(); };
  const chkMain = (n: number) => { if (mainY + n > PH - 20) newPage(); };

  const sbSec = (t: string) => {
    chkSb(26);
    doc.setFillColor(...C.accent); doc.rect(SBPAD, sbY, 18, 2, "F"); sbY += 7;
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...C.mid);
    doc.text(t.toUpperCase(), SBPAD, sbY); sbY += 13;
  };

  const mainSec = (t: string) => {
    chkMain(28);
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...C.mid);
    doc.text(t.toUpperCase(), MX + MPAD, mainY);
    const tw = doc.getTextWidth(t.toUpperCase());
    doc.setFillColor(...C.accent);
    doc.rect(MX + MPAD + tw + 6, mainY - 4, MCW - tw - 6, 1.5, "F");
    mainY += 14;
  };

  const { candidate, summary, experience, skills, education, projects, coverLetter } = data;
  const contacts = [candidate.email, candidate.phone, candidate.location, candidate.linkedin].filter(Boolean) as string[];

  // Header
  doc.setFont("helvetica","bold"); doc.setFontSize(24); doc.setTextColor(...C.white);
  doc.text((candidate.name || "").toUpperCase(), 30, 44);
  if (contacts.length) {
    doc.setFont("helvetica","normal"); doc.setFontSize(8.5);
    let cx = 30;
    contacts.forEach((c, i) => {
      doc.setTextColor(...C.accent); doc.text(c, cx, 67); cx += doc.getTextWidth(c);
      if (i < contacts.length - 1) { doc.setTextColor(...C.light); doc.text("  ·  ", cx, 67); cx += doc.getTextWidth("  ·  "); }
    });
  }
  const extra = [candidate.website, candidate.github].filter(Boolean) as string[];
  if (extra.length) { doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...C.light); doc.text(extra.join("   ·   "), 30, 83); }

  // Sidebar — Skills
  if (skills?.length) {
    sbSec("Skills");
    for (const g of skills) {
      chkSb(30);
      doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(...C.dark);
      doc.text(g.category || "", SBPAD, sbY); sbY += 11;
      doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...C.mid);
      for (const l of wrap(doc, (g.items ?? []).join(", "), SBCW)) { chkSb(11); doc.text(l, SBPAD, sbY); sbY += 11; }
      sbY += 4;
    }
    sbY += 4;
  }

  // Sidebar — Education
  if (education?.length) {
    sbSec("Education");
    for (const e of education) {
      chkSb(42);
      doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(...C.dark);
      for (const l of wrap(doc, e.degree + (e.field ? ` in ${e.field}` : ""), SBCW)) { doc.text(l, SBPAD, sbY); sbY += 11; }
      doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...C.mid);
      for (const l of wrap(doc, e.institution || "", SBCW)) { chkSb(11); doc.text(l, SBPAD, sbY); sbY += 11; }
      const ds = [validDate(e.startDate), validDate(e.endDate)].filter(Boolean).join(" – ");
      if (ds) { doc.setTextColor(...C.light); doc.setFontSize(7.5); doc.text(ds, SBPAD, sbY); sbY += 11; }
      sbY += 6;
    }
  }

  // Main — Summary
  if (summary?.trim()) {
    mainSec("Professional Summary");
    doc.setFont("helvetica","normal"); doc.setFontSize(9.5); doc.setTextColor(...C.dark);
    for (const l of wrap(doc, summary, MCW)) { chkMain(13); doc.text(l, MX + MPAD, mainY); mainY += 13; }
    mainY += 10;
  }

  // Main — Experience
  if (experience?.length) {
    mainSec("Experience");
    for (const job of experience) {
      chkMain(36);
      doc.setFont("helvetica","bold"); doc.setFontSize(10.5); doc.setTextColor(...C.dark);
      doc.text(job.title || "", MX + MPAD, mainY);
      const ds = [validDate(job.startDate), validDate(job.endDate)].filter(Boolean).join(" – ");
      if (ds) { doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...C.light); doc.text(ds, MX + MW - MPAD - doc.getTextWidth(ds), mainY); }
      mainY += 13;
      doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...C.accent);
      doc.text(job.company || "", MX + MPAD, mainY); mainY += 13;
      doc.setFontSize(9); doc.setTextColor(...C.mid);
      for (const b of job.responsibilities ?? []) {
        const bls = wrap(doc, b, MCW - 12);
        for (let i = 0; i < bls.length; i++) {
          chkMain(12);
          if (i === 0) { doc.setFillColor(...C.accent); doc.circle(MX + MPAD + 2.5, mainY - 3, 1.8, "F"); doc.text(bls[i], MX + MPAD + 9, mainY); }
          else doc.text(bls[i], MX + MPAD + 9, mainY);
          mainY += 12;
        }
      }
      mainY += 8;
    }
  }

  // Main — Projects
  if (projects?.length) {
    mainSec("Projects");
    for (const p of projects) {
      chkMain(28);
      doc.setFont("helvetica","bold"); doc.setFontSize(9.5); doc.setTextColor(...C.dark);
      doc.text(p.name || "", MX + MPAD, mainY); mainY += 12;
      if (p.technologies?.length) { doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...C.accent); doc.text(p.technologies.join("  ·  "), MX + MPAD, mainY); mainY += 11; }
      if (p.description) { doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...C.mid); for (const l of wrap(doc, p.description, MCW)) { chkMain(12); doc.text(l, MX + MPAD, mainY); mainY += 12; } }
      mainY += 6;
    }
  }

  // Cover letter
  if (coverLetter?.trim()) {
    doc.addPage();
    doc.setFillColor(...C.navy);   doc.rect(0, 0, PW, HDR, "F");
    doc.setFillColor(...C.accent); doc.rect(0, HDR - 3, PW, 3, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(22); doc.setTextColor(...C.white); doc.text("COVER LETTER", 30, 44);
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...C.accent); doc.text(candidate.name || "", 30, 67);
    const PAD = 48, CW = PW - PAD * 2; let cy = HDR + 36;
    doc.setFont("helvetica","normal"); doc.setFontSize(10.5); doc.setTextColor(...C.dark);
    for (const para of coverLetter.split("\n").filter(p => p.trim())) {
      for (const l of wrap(doc, para, CW)) { if (cy + 16 > PH - 48) { doc.addPage(); cy = 48; } doc.text(l, PAD, cy); cy += 16; }
      cy += 8;
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// TEMPLATE 2 — Executive  (single column, bold navy section bars)
// ══════════════════════════════════════════════════════════════════════════
function buildExecutive(doc: Doc, data: ResumeData) {
  const PW = 612, PH = 792, ML = 50, MR = 50, CW = PW - ML - MR;
  let y = 0;

  const newPage = () => { doc.addPage(); y = 50; };
  const chk = (n: number) => { if (y + n > PH - 45) newPage(); };

  const { candidate, summary, experience, skills, education, projects, coverLetter } = data;
  const contacts = [candidate.email, candidate.phone, candidate.location, candidate.linkedin, candidate.website].filter(Boolean) as string[];

  // Full-width navy header
  const nameText = (candidate.name || "").toUpperCase();
  doc.setFont("helvetica","bold"); doc.setFontSize(28); doc.setTextColor(...C.white);
  const nameW = doc.getTextWidth(nameText);
  const headerH = 115;
  doc.setFillColor(...C.navy); doc.rect(0, 0, PW, headerH, "F");
  doc.setFillColor(...C.accent); doc.rect(0, headerH - 4, PW, 4, "F");
  doc.text(nameText, (PW - nameW) / 2, 52);

  // Contact bar inside header
  if (contacts.length) {
    doc.setFont("helvetica","normal"); doc.setFontSize(8.5);
    const full = contacts.join("   ·   ");
    const fw = doc.getTextWidth(full);
    let cx = (PW - fw) / 2;
    contacts.forEach((c, i) => {
      doc.setTextColor(...C.accent); doc.text(c, cx, 78); cx += doc.getTextWidth(c);
      if (i < contacts.length - 1) { doc.setTextColor(...C.light); doc.text("   ·   ", cx, 78); cx += doc.getTextWidth("   ·   "); }
    });
  }
  y = headerH + 28;

  const section = (title: string) => {
    chk(28);
    doc.setFillColor(...C.navy); doc.rect(ML, y - 10, CW, 18, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...C.white);
    doc.text(title.toUpperCase(), ML + 8, y + 3);
    y += 16;
  };

  const rule = () => { doc.setDrawColor(...C.rule); doc.setLineWidth(0.5); doc.line(ML, y, ML + CW, y); y += 8; };

  // Summary
  if (summary?.trim()) {
    section("Professional Summary");
    doc.setFont("helvetica","normal"); doc.setFontSize(9.5); doc.setTextColor(...C.dark);
    for (const l of wrap(doc, summary, CW)) { chk(13); doc.text(l, ML, y); y += 13; }
    y += 10;
  }

  // Experience
  if (experience?.length) {
    section("Experience");
    for (const job of experience) {
      chk(36); y += 4;
      // Title row
      doc.setFont("helvetica","bold"); doc.setFontSize(10.5); doc.setTextColor(...C.dark);
      doc.text(job.title || "", ML, y);
      const ds = [validDate(job.startDate), validDate(job.endDate)].filter(Boolean).join(" – ");
      if (ds) { doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...C.light); doc.text(ds, ML + CW - doc.getTextWidth(ds), y); }
      y += 13;
      // Company + accent dot
      doc.setFillColor(...C.accent); doc.rect(ML, y - 7, 3, 9, "F");
      doc.setFont("helvetica","normal"); doc.setFontSize(9.5); doc.setTextColor(...C.mid);
      doc.text(job.company || "", ML + 7, y); y += 14;
      // Bullets
      doc.setFontSize(9); doc.setTextColor(...C.mid);
      for (const b of job.responsibilities ?? []) {
        const bls = wrap(doc, b, CW - 14);
        for (let i = 0; i < bls.length; i++) {
          chk(13);
          if (i === 0) { doc.setFillColor(...C.accent); doc.circle(ML + 3, y - 3, 2, "F"); doc.text(bls[i], ML + 11, y); }
          else doc.text(bls[i], ML + 11, y);
          y += 13;
        }
      }
      rule();
    }
  }

  // Skills — two-column grid
  if (skills?.length) {
    section("Skills");
    const colW = CW / 2 - 8;
    skills.forEach((g, idx) => {
      const x = idx % 2 === 0 ? ML : ML + CW / 2 + 8;
      if (idx % 2 === 0) chk(24);
      doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...C.dark);
      doc.text(g.category || "", x, y);
      doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...C.mid);
      for (const l of wrap(doc, (g.items ?? []).join(", "), colW)) { doc.text(l, x, y + 11); y += 11; }
      if (idx % 2 === 1) y += 8;
    });
    if (skills.length % 2 !== 0) y += 8;
    y += 4;
  }

  // Education
  if (education?.length) {
    section("Education");
    for (const e of education) {
      chk(32); y += 4;
      doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(...C.dark);
      doc.text(e.degree + (e.field ? ` in ${e.field}` : ""), ML, y);
      const ds = [validDate(e.startDate), validDate(e.endDate)].filter(Boolean).join(" – ");
      if (ds) { doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...C.light); doc.text(ds, ML + CW - doc.getTextWidth(ds), y); }
      y += 13;
      doc.setFont("helvetica","normal"); doc.setFontSize(9.5); doc.setTextColor(...C.accent);
      doc.text(e.institution || "", ML, y); y += 16;
    }
  }

  // Cover letter
  if (coverLetter?.trim()) {
    doc.addPage();
    doc.setFillColor(...C.navy); doc.rect(0, 0, PW, 115, "F");
    doc.setFillColor(...C.accent); doc.rect(0, 111, PW, 4, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(22); doc.setTextColor(...C.white);
    const clt = "COVER LETTER"; doc.text(clt, (PW - doc.getTextWidth(clt)) / 2, 52);
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...C.accent);
    const nm = candidate.name || ""; doc.text(nm, (PW - doc.getTextWidth(nm)) / 2, 72);
    let cy = 115 + 36;
    doc.setFont("helvetica","normal"); doc.setFontSize(10.5); doc.setTextColor(...C.dark);
    for (const para of coverLetter.split("\n").filter(p => p.trim())) {
      for (const l of wrap(doc, para, CW)) { if (cy + 16 > PH - 45) { doc.addPage(); cy = 48; } doc.text(l, ML, cy); cy += 16; }
      cy += 8;
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// TEMPLATE 3 — Minimal ATS  (single column, left accent bar)
// ══════════════════════════════════════════════════════════════════════════
function buildMinimalATS(doc: Doc, data: ResumeData) {
  const PW = 612, PH = 792, ML = 52, MR = 48, CW = PW - ML - MR;
  const ACCENT_X = 36, ACCENT_W = 3;
  let y = 48;

  const newPage = () => { doc.addPage(); y = 48; };
  const chk = (n: number) => { if (y + n > PH - 45) newPage(); };

  const { candidate, summary, experience, skills, education, projects, coverLetter } = data;
  const contacts = [candidate.email, candidate.phone, candidate.location, candidate.linkedin].filter(Boolean) as string[];

  // Accent bar — full page height
  doc.setFillColor(...C.accent); doc.rect(ACCENT_X, 0, ACCENT_W, PH, "F");

  // Name
  doc.setFont("helvetica","bold"); doc.setFontSize(28); doc.setTextColor(...C.navy);
  doc.text(candidate.name || "", ML, y); y += 6;

  // Accent underline
  doc.setFillColor(...C.accent); doc.rect(ML, y, CW, 2.5, "F"); y += 10;

  // Contact row
  if (contacts.length) {
    doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...C.mid);
    let cx = ML;
    contacts.forEach((c, i) => {
      doc.text(c, cx, y); cx += doc.getTextWidth(c);
      if (i < contacts.length - 1) { doc.setTextColor(...C.light); doc.text("  |  ", cx, y); cx += doc.getTextWidth("  |  "); doc.setTextColor(...C.mid); }
    });
    y += 20;
  }

  const section = (title: string) => {
    chk(26);
    doc.setFillColor(...C.navy); doc.rect(ML, y, CW, 16, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...C.white);
    doc.text(title.toUpperCase(), ML + 6, y + 11);
    y += 22;
  };

  const hairline = () => { doc.setDrawColor(...C.rule); doc.setLineWidth(0.4); doc.line(ML, y, ML + CW, y); y += 7; };

  // Summary
  if (summary?.trim()) {
    section("Summary");
    doc.setFont("helvetica","normal"); doc.setFontSize(9.5); doc.setTextColor(...C.dark);
    for (const l of wrap(doc, summary, CW)) { chk(13); doc.text(l, ML, y); y += 13; }
    y += 8;
  }

  // Experience
  if (experience?.length) {
    section("Experience");
    for (const job of experience) {
      chk(36);
      // Title + date
      doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(...C.navy);
      doc.text(job.title || "", ML, y);
      const ds = [validDate(job.startDate), validDate(job.endDate)].filter(Boolean).join(" – ");
      if (ds) { doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...C.light); doc.text(ds, ML + CW - doc.getTextWidth(ds), y); }
      y += 13;
      // Company with accent dot
      doc.setFillColor(...C.accent); doc.circle(ML + 3, y - 3, 2.2, "F");
      doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...C.mid);
      doc.text(job.company || "", ML + 10, y); y += 14;
      // Bullets
      doc.setFontSize(9); doc.setTextColor(...C.dark);
      for (const b of job.responsibilities ?? []) {
        const bls = wrap(doc, b, CW - 12);
        for (let i = 0; i < bls.length; i++) {
          chk(12);
          if (i === 0) { doc.setDrawColor(...C.accent); doc.setLineWidth(1.5); doc.line(ML + 1, y - 3.5, ML + 1, y + 3.5); doc.text(bls[i], ML + 8, y); }
          else doc.text(bls[i], ML + 8, y);
          y += 12;
        }
      }
      hairline();
    }
  }

  // Skills
  if (skills?.length) {
    section("Skills");
    doc.setFontSize(9.5);
    for (const g of skills) {
      chk(14);
      doc.setFont("helvetica","bold"); doc.setTextColor(...C.navy);
      const lbl = `${g.category}: `;
      const lw = doc.getTextWidth(lbl);
      doc.text(lbl, ML, y);
      doc.setFont("helvetica","normal"); doc.setTextColor(...C.dark);
      const itemsText = (g.items ?? []).join(", ");
      const lines = wrap(doc, itemsText, CW - lw);
      doc.text(lines[0], ML + lw, y); y += 13;
      for (let i = 1; i < lines.length; i++) { chk(13); doc.text(lines[i], ML + lw, y); y += 13; }
    }
    y += 4;
  }

  // Education
  if (education?.length) {
    section("Education");
    for (const e of education) {
      chk(28);
      doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(...C.navy);
      doc.text(e.degree + (e.field ? ` in ${e.field}` : ""), ML, y);
      const ds = [validDate(e.startDate), validDate(e.endDate)].filter(Boolean).join(" – ");
      if (ds) { doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...C.light); doc.text(ds, ML + CW - doc.getTextWidth(ds), y); }
      y += 13;
      doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...C.mid);
      doc.text(e.institution || "", ML, y); y += 16;
    }
  }

  // Cover letter
  if (coverLetter?.trim()) {
    doc.addPage();
    doc.setFillColor(...C.accent); doc.rect(ACCENT_X, 0, ACCENT_W, PH, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(22); doc.setTextColor(...C.navy);
    doc.text("Cover Letter", ML, 52);
    doc.setFillColor(...C.accent); doc.rect(ML, 58, CW, 2.5, "F");
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...C.mid);
    doc.text(candidate.name || "", ML, 74);
    let cy = 96;
    doc.setFont("helvetica","normal"); doc.setFontSize(10.5); doc.setTextColor(...C.dark);
    for (const para of coverLetter.split("\n").filter(p => p.trim())) {
      for (const l of wrap(doc, para, CW)) { if (cy + 16 > PH - 45) { doc.addPage(); cy = 48; } doc.text(l, ML, cy); cy += 16; }
      cy += 8;
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// Main export
// ══════════════════════════════════════════════════════════════════════════
export async function generatePDF(
  data: ResumeData,
  template: TemplateId = "modern-professional"
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter", compress: true });

  switch (template) {
    case "executive":
      buildExecutive(doc, data);
      break;
    case "minimal-ats":
      buildMinimalATS(doc, data);
      break;
    default:
      buildModernPro(doc, data);
  }

  return doc.output("blob");
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
