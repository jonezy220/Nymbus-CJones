import { NextRequest, NextResponse } from "next/server";
import { UNDERWRITING_RESULT } from "@/lib/mock-data";
import { logMilestone } from "@/lib/session-log";

// Simulate underwriting review delay
const UNDERWRITING_DELAY_MS = 2500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchantId, forceDecision } = body;

    // Simulate real underwriting review time
    await sleep(UNDERWRITING_DELAY_MS);

    // forceDecision=denied can be passed to demo the denial path
    const decision = forceDecision === "denied" ? "denied" : "approved";
    const result =
      decision === "approved"
        ? UNDERWRITING_RESULT.approved
        : UNDERWRITING_RESULT.denied;

    logMilestone(
      "api/underwriting",
      `Underwriting decision: ${decision} for merchantId=${merchantId}`,
      ["underwriting", "flow-1c", decision]
    );

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[underwriting]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
