import { NextRequest, NextResponse } from "next/server";
import { PublishingGateway } from "@/lib/publishing/gateway";
import { ServerDatabase } from "@/lib/db/adapter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, destination, actor } = body;

    if (!submissionId || !destination) {
      return NextResponse.json({ error: "submissionId and destination are required." }, { status: 400 });
    }

    const submission = ServerDatabase.getSubmissionById(submissionId);
    if (!submission) {
      return NextResponse.json({ error: "Content submission not found." }, { status: 404 });
    }

    const dispatchResult = await PublishingGateway.dispatchToDestination(
      submission,
      destination,
      actor || { id: "usr-bm", name: "Alex Rivera", role: "brand_manager" }
    );

    return NextResponse.json({ success: true, result: dispatchResult });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Publishing gateway failure" }, { status: 403 });
  }
}
