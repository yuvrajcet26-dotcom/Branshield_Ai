import { NextRequest, NextResponse } from "next/server";
import { VisionGovernanceEngine } from "@/lib/vision/governance";
import { ServerDatabase } from "@/lib/db/adapter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brandId, imageName, scenario } = body;

    const brand = ServerDatabase.getBrandById(brandId || "brand-novatech");
    if (!brand) {
      return NextResponse.json({ error: "Brand profile not found." }, { status: 404 });
    }

    const report = await VisionGovernanceEngine.analyzeVisualAsset(
      imageName || "marketing-banner-q4.png",
      brand,
      scenario || "banner_violation"
    );

    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to analyze visual asset" }, { status: 500 });
  }
}
