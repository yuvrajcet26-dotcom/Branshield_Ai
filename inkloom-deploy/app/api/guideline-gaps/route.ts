import { NextRequest, NextResponse } from "next/server";
import { GuidelineOptimizer } from "@/lib/ai/guideline-optimizer";
import { ServerDatabase } from "@/lib/db/adapter";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId") || "brand-novatech";

    const brand = ServerDatabase.getBrandById(brandId);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found." }, { status: 404 });
    }

    const submissions = ServerDatabase.getSubmissions();
    const gaps = GuidelineOptimizer.analyzeGaps(brand, submissions);

    return NextResponse.json({ success: true, brand, gaps });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to analyze guideline gaps" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brandId, gapId } = body;

    if (!brandId || !gapId) {
      return NextResponse.json({ error: "brandId and gapId are required." }, { status: 400 });
    }

    const updatedBrand = GuidelineOptimizer.adoptRefinement(brandId, gapId);
    if (!updatedBrand) {
      return NextResponse.json({ error: "Failed to adopt refinement: Brand not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully refined guidelines for ${updatedBrand.name}! Upgraded to version ${updatedBrand.version}.`,
      updatedBrand,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to adopt refinement" }, { status: 500 });
  }
}
