"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { COOLAIR_HVAC } from "@/lib/mock-data";

type Decision = "approved" | "denied";
type State = "loading" | Decision;

export default function UnderwritingPage() {
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [decision, setDecision] = useState<{ subMerchantId?: string; approvedLimits?: { perTransaction: number; dailyVolume: number }; linkedAccount?: string; reason?: string } | null>(null);

  useEffect(() => {
    async function runUnderwriting() {
      try {
        const res = await fetch("/api/underwriting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ merchantId: COOLAIR_HVAC.merchantId }),
        });
        const data = await res.json();
        setDecision(data);
        setState(data.decision as Decision);

        if (data.decision === "approved") {
          // Set cookie so middleware can gate /checkout server-side (no flash)
          document.cookie = "approvalStatus=approved; path=/; SameSite=Lax";
          sessionStorage.setItem("approvalStatus", "approved");
          sessionStorage.setItem("subMerchantId", data.subMerchantId ?? "");
        }
      } catch {
        setState("denied");
      }
    }

    runUnderwriting();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#0D1117" }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: "#2569EC" }}>
            A
          </div>
          <span className="text-base font-semibold" style={{ fontFamily: "'DM Sans', sans-serif", color: "#E6EDF3" }}>
            ABC Community Bank
          </span>
        </div>

        {/* Loading */}
        {state === "loading" && (
          <div className="rounded-xl border p-10 text-center" style={{ background: "#161B22", borderColor: "#30363D" }}>
            <div className="flex items-center justify-center mb-5">
              <svg className="animate-spin" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-label="Reviewing application">
                <circle cx="18" cy="18" r="14" stroke="#30363D" strokeWidth="2.5" />
                <path d="M18 4a14 14 0 0 1 14 14" stroke="#2569EC" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: "'DM Sans', sans-serif", color: "#E6EDF3" }}>
              Reviewing your application
            </h2>
            <p className="text-sm" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
              We're verifying your business information with ABC Community Bank on file. This usually takes just a moment.
            </p>
          </div>
        )}

        {/* Approved */}
        {state === "approved" && decision && (
          <div className="rounded-xl border p-8" style={{ background: "#161B22", borderColor: "#30363D" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#0F2A18" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M4 9l3 3 7-7" stroke="#3FB950" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ fontFamily: "'DM Sans', sans-serif", color: "#E6EDF3" }}>
                  Application approved
                </h2>
                <p className="text-sm" style={{ color: "#3FB950", fontFamily: "'Inter', sans-serif" }}>
                  CoolAir HVAC is now a PayFac sub-merchant
                </p>
              </div>
            </div>

            <div className="rounded-lg p-4 mb-6 space-y-3" style={{ background: "#0D1117", border: "1px solid #21262D" }}>
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>Merchant ID</span>
                <span className="text-xs font-data" style={{ color: "#E6EDF3" }}>{COOLAIR_HVAC.merchantId}</span>
              </div>
              <div className="h-px" style={{ background: "#21262D" }} />
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>Sub-merchant ID</span>
                <span className="text-xs font-data" style={{ color: "#E6EDF3" }}>{decision.subMerchantId}</span>
              </div>
              <div className="h-px" style={{ background: "#21262D" }} />
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>Per-transaction limit</span>
                <span className="text-xs font-data" style={{ color: "#E6EDF3" }}>${decision.approvedLimits?.perTransaction?.toLocaleString()}</span>
              </div>
              <div className="h-px" style={{ background: "#21262D" }} />
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>Daily volume limit</span>
                <span className="text-xs font-data" style={{ color: "#E6EDF3" }}>${decision.approvedLimits?.dailyVolume?.toLocaleString()}</span>
              </div>
              <div className="h-px" style={{ background: "#21262D" }} />
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>Settlement account</span>
                <span className="text-xs font-data" style={{ color: "#E6EDF3" }}>{decision.linkedAccount}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: "#2569EC", fontFamily: "'Inter', sans-serif" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1E54BD")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#2569EC")}
            >
              Start accepting payments →
            </button>
          </div>
        )}

        {/* Denied */}
        {state === "denied" && (
          <div className="rounded-xl border p-8" style={{ background: "#161B22", borderColor: "#30363D" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#2A0F0F" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M6 6l6 6M12 6l-6 6" stroke="#F85149" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ fontFamily: "'DM Sans', sans-serif", color: "#E6EDF3" }}>
                  Application not approved
                </h2>
                <p className="text-sm" style={{ color: "#F85149", fontFamily: "'Inter', sans-serif" }}>
                  We're unable to approve your application at this time
                </p>
              </div>
            </div>

            <p className="text-sm mb-6" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
              {decision?.reason ?? "Based on our review, we're unable to approve your application at this time. Please contact support for more information."}
            </p>

            <div className="flex flex-col gap-3">
              <button
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ background: "#2569EC", fontFamily: "'Inter', sans-serif" }}
              >
                Contact support
              </button>
              <Link
                href="/"
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-colors"
                style={{ border: "1px solid #30363D", color: "#8B949E", fontFamily: "'Inter', sans-serif" }}
              >
                Return to home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
