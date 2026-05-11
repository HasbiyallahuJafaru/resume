import { NextRequest, NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import React from "react";
import { ResumeData, TemplateId } from "@/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { data, template }: { data: ResumeData; template: TemplateId } = await req.json();

    let DocComp: React.ComponentType<{ data: ResumeData }>;

    switch (template) {
      case "executive":
        DocComp = (await import("@/templates/pdf/ExecutivePDF")).default;
        break;
      case "modern-professional":
        DocComp = (await import("@/templates/pdf/ModernPDF")).default;
        break;
      default:
        DocComp = (await import("@/templates/pdf/MinimalATSPDF")).default;
    }

    const element = React.createElement(DocComp, { data });
    const buffer = await pdf(element as React.ReactElement).toBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(data.candidate.name || "Resume").replace(/\s+/g, "_")}_Resume.pdf"`,
      },
    });
  } catch (error) {
    console.error("[/api/pdf] Error:", error);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
