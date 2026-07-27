"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { ARNOLD_FREEZE_JOB, STRIPE_TEST_CARDS } from "@/lib/mock-data";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// AirConPro Stripe Appearance — blends into AirConPro's own UI
const appearance = {
  theme: "flat" as const,
  variables: {
    colorPrimary: "#0F766E",
    colorBackground: "#FFFFFF",
    colorText: "#1A202C",
    colorDanger: "#DC2626",
    colorTextSecondary: "#64748B",
    colorTextPlaceholder: "#94A3B8",
    colorIconTab: "#64748B",
    colorIconTabSelected: "#0F766E",
    fontFamily: "Inter, sans-serif",
    fontSizeBase: "14px",
    borderRadius: "8px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid #E2E8F0",
      padding: "10px 14px",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "1px solid #0F766E",
      boxShadow: "0 0 0 3px rgba(15,118,110,0.1)",
    },
    ".Label": {
      fontWeight: "500",
      color: "#374151",
      marginBottom: "6px",
    },
  },
};

function CheckoutForm({ jobId }: { jobId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/confirmation?type=card`,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
    } else {
      sessionStorage.setItem("paymentType", "card");
      router.push("/confirmation?type=card");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: "tabs" }} />

      {errorMessage && (
        <div className="mt-4 rounded-lg px-4 py-3 text-sm flex items-start gap-2" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full mt-5 py-3 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
        style={{ background: "#0F766E", fontFamily: "'Inter', sans-serif" }}
        onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#0D6B64"; }}
        onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#0F766E"; }}
      >
        {submitting ? "Processing…" : `Pay $${ARNOLD_FREEZE_JOB.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
      </button>
    </form>
  );
}

export default function CardCheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: ARNOLD_FREEZE_JOB.total * 100, // cents
        currency: "usd",
        jobId: ARNOLD_FREEZE_JOB.jobNumber,
      }),
    })
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) {
          let detail = text;
          try { detail = JSON.parse(text).error ?? text; } catch { /* use raw */ }
          setError(`Unable to initialize payment (HTTP ${r.status}): ${detail}`);
          return;
        }
        let data: { clientSecret?: string; error?: string };
        try {
          data = JSON.parse(text);
        } catch {
          setError("Unable to initialize payment: unexpected server response.");
          return;
        }
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error ?? "Unable to initialize payment: no client secret returned.");
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Network error";
        setError(`Unable to initialize payment: ${msg}`);
      });
  }, []);

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "#F8F9FA", color: "#1A202C", fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-md mx-auto">
        {/* AirConPro header */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: "#0F766E" }}>
            AC
          </div>
          <span className="text-base font-semibold">AirConPro</span>
        </div>

        {/* Order summary */}
        <div className="rounded-xl border bg-white p-5 mb-5" style={{ borderColor: "#E2E8F0" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748B" }}>Order summary</p>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm">{ARNOLD_FREEZE_JOB.service}</p>
            <p className="text-sm font-semibold">${ARNOLD_FREEZE_JOB.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </div>
          <p className="text-xs" style={{ color: "#64748B" }}>
            {ARNOLD_FREEZE_JOB.customer} · {ARNOLD_FREEZE_JOB.jobNumber} · CoolAir HVAC
          </p>
        </div>

        {/* Stripe Elements */}
        <div className="rounded-xl border bg-white p-6 mb-5" style={{ borderColor: "#E2E8F0" }}>
          <p className="text-sm font-semibold mb-5">Card details</p>

          {error && (
            <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: "#FEF2F2", color: "#DC2626" }}>
              {error}
            </div>
          )}

          {!clientSecret && !error && (
            <div className="flex items-center justify-center py-10 gap-2" style={{ color: "#94A3B8" }}>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Loading">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 6" />
              </svg>
              <span className="text-sm">Initializing payment…</span>
            </div>
          )}

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
              <CheckoutForm jobId={ARNOLD_FREEZE_JOB.jobNumber} />
            </Elements>
          )}
        </div>

        {/* Test card helper */}
        <div className="rounded-xl border p-5" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "#92400E" }}>
            🧪 Test cards (sandbox only)
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "#78350F" }}>Success</span>
              <code className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "#FEF3C7", color: "#92400E" }}>
                {STRIPE_TEST_CARDS.success}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "#78350F" }}>Insufficient funds</span>
              <code className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "#FEF3C7", color: "#92400E" }}>
                {STRIPE_TEST_CARDS.insufficientFunds}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "#78350F" }}>Generic decline</span>
              <code className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "#FEF3C7", color: "#92400E" }}>
                {STRIPE_TEST_CARDS.declineGeneric}
              </code>
            </div>
            <p className="text-xs mt-2" style={{ color: "#78350F" }}>
              Use any future expiry and any 3-digit CVC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
