import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { logMilestone } from "@/lib/session-log";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "usd", jobId } = body;

    if (!amount || typeof amount !== "number") {
      return NextResponse.json(
        { error: "amount is required and must be a number (in cents)" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        jobId: jobId ?? "",
        merchant: "CoolAir HVAC LLC",
        customer: "Mr. Arnold Freeze",
        platform: "AirConPro",
      },
      automatic_payment_methods: { enabled: true },
    });

    logMilestone(
      "api/stripe/create-payment-intent",
      `PaymentIntent created: ${paymentIntent.id} for ${amount} ${currency} — Job ${jobId}`,
      ["stripe", "card-path", "flow-2a"]
    );

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe/create-payment-intent]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
