import { NextRequest, NextResponse } from "next/server";
import { FINANCING_RESULT } from "@/lib/mock-data";
import { logMilestone } from "@/lib/session-log";

const FINANCING_DELAY_MS = 2500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicantName, loanAmount, jobId, forceDecision } = body;

    // Simulate credit decisioning time
    await sleep(FINANCING_DELAY_MS);

    // forceDecision=denied can be passed to demo the denial path
    const decision = forceDecision === "denied" ? "denied" : "approved";
    const result =
      decision === "approved"
        ? FINANCING_RESULT.approved
        : FINANCING_RESULT.denied;

    logMilestone(
      "api/financing/decision",
      `Financing decision: ${decision} for ${applicantName}, $${loanAmount}, Job ${jobId}`,
      ["financing", "flow-2b", decision]
    );

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[financing/decision]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
