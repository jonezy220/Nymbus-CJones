"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ARNOLD_FREEZE_JOB, FINANCING_TERMS } from "@/lib/mock-data";

type FinancingState = "form" | "loading" | "approved" | "denied";

interface FinancingDecision {
  decision: "approved" | "denied";
  loanId?: string;
  loanAmount?: number;
  term?: number;
  apr?: number;
  monthlyPayment?: number;
  lender?: string;
  reason?: string;
  fallback?: string;
}

export default function FinancingPage() {
  const router = useRouter();
  const [state, setState] = useState<FinancingState>("form");
  const [result, setResult] = useState<FinancingDecision | null>(null);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");

    try {
      const res = await fetch("/api/financing/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantName: ARNOLD_FREEZE_JOB.customer.replace("Mr. ", ""),
          loanAmount: ARNOLD_FREEZE_JOB.total,
          jobId: ARNOLD_FREEZE_JOB.jobNumber,
        }),
      });
      const data: FinancingDecision = await res.json();
      setResult(data);
      setState(data.decision);
    } catch {
      setState("denied");
    }
  }

  function handleAccept() {
    sessionStorage.setItem("paymentType", "financed");
    document.cookie = "paymentComplete=financed; path=/; SameSite=Lax";
    router.push("/confirmation?type=financed");
  }

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
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748B" }}>Financing request</p>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm">{ARNOLD_FREEZE_JOB.service}</p>
            <p className="text-sm font-semibold">${ARNOLD_FREEZE_JOB.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </div>
          <p className="text-xs" style={{ color: "#64748B" }}>
            {ARNOLD_FREEZE_JOB.customer} · {ARNOLD_FREEZE_JOB.jobNumber}
          </p>
        </div>

        {/* Application form */}
        {state === "form" && (
          <div className="rounded-xl border bg-white p-6" style={{ borderColor: "#E2E8F0" }}>
            <p className="text-sm font-semibold mb-1">Apply for financing</p>
            <p className="text-xs mb-5" style={{ color: "#64748B" }}>
              Financing provided by ABC Community Bank, Member FDIC
            </p>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>
                  Full name
                </label>
                <input
                  type="text"
                  defaultValue="Arnold Freeze"
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
                  style={{ border: "1px solid #E2E8F0", color: "#1A202C", background: "#fff" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0F766E")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>
                  Loan amount
                </label>
                <input
                  type="text"
                  defaultValue="$8,000.00"
                  readOnly
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm"
                  style={{ border: "1px solid #E2E8F0", color: "#64748B", background: "#F8F9FA" }}
                />
              </div>

              <div className="rounded-lg p-4 space-y-2" style={{ background: "#F0FDF4", border: "1px solid #D1FAE5" }}>
                <p className="text-xs font-medium" style={{ color: "#065F46" }}>Estimated terms</p>
                <div className="flex justify-between text-xs" style={{ color: "#065F46" }}>
                  <span>Term</span>
                  <span>{FINANCING_TERMS.term} months</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: "#065F46" }}>
                  <span>APR</span>
                  <span>{FINANCING_TERMS.apr}%</span>
                </div>
                <div className="flex justify-between text-xs font-semibold" style={{ color: "#065F46" }}>
                  <span>Est. monthly payment</span>
                  <span>${FINANCING_TERMS.monthlyPayment}/mo</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ background: "#2569EC" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1E54BD")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#2569EC")}
              >
                Apply for financing
              </button>
            </form>
          </div>
        )}

        {/* Loading */}
        {state === "loading" && (
          <div className="rounded-xl border bg-white p-10 text-center" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-center mb-4">
              <svg className="animate-spin" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Reviewing application">
                <circle cx="16" cy="16" r="12" stroke="#E2E8F0" strokeWidth="2.5" />
                <path d="M16 4a12 12 0 0 1 12 12" stroke="#2569EC" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm font-semibold mb-1">Reviewing your application</p>
            <p className="text-xs" style={{ color: "#64748B" }}>
              ABC Community Bank is reviewing your financing request…
            </p>
          </div>
        )}

        {/* Approved */}
        {state === "approved" && result && (
          <div className="rounded-xl border bg-white p-6" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#D1FAE5" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M4 9l3 3 7-7" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold">Financing approved</p>
                <p className="text-xs mt-0.5" style={{ color: "#059669" }}>
                  {result.lender}
                </p>
              </div>
            </div>

            {/* Terms */}
            <div className="rounded-lg p-4 mb-5 space-y-3" style={{ background: "#F8F9FA", border: "1px solid #E2E8F0" }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#64748B" }}>Loan ID</span>
                <span className="font-mono text-xs">{result.loanId}</span>
              </div>
              <div className="h-px" style={{ background: "#E2E8F0" }} />
              <div className="flex justify-between text-sm">
                <span style={{ color: "#64748B" }}>Amount</span>
                <span className="font-semibold">${result.loanAmount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="h-px" style={{ background: "#E2E8F0" }} />
              <div className="flex justify-between text-sm">
                <span style={{ color: "#64748B" }}>Term</span>
                <span>{result.term} months</span>
              </div>
              <div className="h-px" style={{ background: "#E2E8F0" }} />
              <div className="flex justify-between text-sm">
                <span style={{ color: "#64748B" }}>APR</span>
                <span>{result.apr}%</span>
              </div>
              <div className="h-px" style={{ background: "#E2E8F0" }} />
              <div className="flex justify-between text-sm">
                <span style={{ color: "#64748B" }}>Monthly payment</span>
                <span className="font-semibold">${result.monthlyPayment}/mo</span>
              </div>
            </div>

            <button
              onClick={handleAccept}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: "#2569EC" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1E54BD")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#2569EC")}
            >
              Accept &amp; finalize
            </button>
          </div>
        )}

        {/* Denied */}
        {state === "denied" && (
          <div className="rounded-xl border bg-white p-6" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FEE2E2" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M6 6l6 6M12 6l-6 6" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold">Financing not approved</p>
                <p className="text-xs mt-0.5" style={{ color: "#DC2626" }}>
                  {result?.reason ?? "Unable to approve financing at this time"}
                </p>
              </div>
            </div>

            <p className="text-sm mb-5" style={{ color: "#64748B" }}>
              You can still complete your purchase by paying with a card.
            </p>

            <button
              onClick={() => router.push("/checkout/card")}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: "#0F766E" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0D6B64")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#0F766E")}
            >
              Pay by card instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
