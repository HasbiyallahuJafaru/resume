import { NextRequest, NextResponse } from "next/server";
import { ResumeData, TemplateId } from "@/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { data, template }: { data: ResumeData; template: TemplateId } = await req.json();

    // Dynamic import keeps @react-pdf/renderer out of the module-level bundle
    const { pdf } = await import("@react-pdf/renderer");
    const React = (await import("react")).default;

    console.log("[pdf] pdf type:", typeof pdf);
    console.log("[pdf] React type:", typeof React, typeof React.createElement);

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

    console.log("[pdf] DocComp:", typeof DocComp, (DocComp as unknown as { name?: string })?.name);

    const element = React.createElement(DocComp, { data });
    console.log("[pdf] element.type:", typeof element.type);

    const buffer = await pdf(element as React.ReactElement).toBuffer();
    console.log("[pdf] buffer size:", buffer.length);

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
