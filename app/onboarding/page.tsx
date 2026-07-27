"use client";

import { useRouter } from "next/navigation";
import { COOLAIR_HVAC } from "@/lib/mock-data";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
        {label}
      </label>
      <div
        className="w-full rounded-lg px-3.5 py-2.5 text-sm"
        style={{
          background: "#0D1117",
          border: "1px solid #21262D",
          color: "#E6EDF3",
          fontFamily: "'Inter', sans-serif",
          opacity: 0.85,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MonoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
        {label}
      </label>
      <div
        className="w-full rounded-lg px-3.5 py-2.5 text-sm font-data"
        style={{
          background: "#0D1117",
          border: "1px solid #21262D",
          color: "#E6EDF3",
          opacity: 0.85,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/underwriting");
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: "#0D1117" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: "#2569EC" }}>
            A
          </div>
          <span className="text-base font-semibold" style={{ fontFamily: "'DM Sans', sans-serif", color: "#E6EDF3" }}>
            ABC Community Bank
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {["Log in", "Business info", "Review & submit"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: i === 1 ? "#E6EDF3" : "#6E7681", fontFamily: "'Inter', sans-serif" }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: i < 1 ? "#2569EC" : i === 1 ? "#21262D" : "transparent",
                    border: i === 1 ? "1px solid #2569EC" : "none",
                    color: i < 1 ? "white" : i === 1 ? "#2569EC" : "#6E7681",
                  }}
                >
                  {i < 1 ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                {step}
              </div>
              {i < 2 && <div className="w-8 h-px" style={{ background: "#30363D" }} />}
            </div>
          ))}
        </div>

        {/* Pre-fill notice */}
        <div className="rounded-lg px-4 py-3 mb-6 flex items-start gap-3 border" style={{ background: "#0F2236", borderColor: "#1F4E8C" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" stroke="#58A6FF" strokeWidth="1.2" />
            <path d="M8 7v4M8 5.5v.5" stroke="#58A6FF" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <p className="text-sm" style={{ color: "#58A6FF", fontFamily: "'Inter', sans-serif" }}>
            Your business information has been pre-filled from your existing ABC Community Bank account. Review and submit to apply for PayFac sub-merchant status.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-xl border p-7 mb-5" style={{ background: "#161B22", borderColor: "#30363D" }}>
            <h2 className="text-base font-semibold mb-5" style={{ fontFamily: "'DM Sans', sans-serif", color: "#E6EDF3" }}>
              Business information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Business legal name" value={COOLAIR_HVAC.businessLegalName} />
              </div>
              <Field label="DBA / Trade name" value={COOLAIR_HVAC.dba} />
              <Field label="Business type" value={COOLAIR_HVAC.businessType} />
              <div className="col-span-2">
                <MonoField label="EIN" value={COOLAIR_HVAC.ein} />
              </div>
              <div className="col-span-2">
                <Field label="Business address" value={COOLAIR_HVAC.address} />
              </div>
              <Field label="Phone" value={COOLAIR_HVAC.phone} />
            </div>
          </div>

          <div className="rounded-xl border p-7 mb-5" style={{ background: "#161B22", borderColor: "#30363D" }}>
            <h2 className="text-base font-semibold mb-5" style={{ fontFamily: "'DM Sans', sans-serif", color: "#E6EDF3" }}>
              Beneficial owner
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full name" value={COOLAIR_HVAC.ownerName} />
              <Field label="Title" value={COOLAIR_HVAC.ownerTitle} />
              <MonoField label="Date of birth" value={COOLAIR_HVAC.ownerDob} />
              <MonoField label="SSN (last 4)" value={COOLAIR_HVAC.ownerSsnMasked} />
            </div>
          </div>

          <div className="rounded-xl border p-7 mb-5" style={{ background: "#161B22", borderColor: "#30363D" }}>
            <h2 className="text-base font-semibold mb-5" style={{ fontFamily: "'DM Sans', sans-serif", color: "#E6EDF3" }}>
              Settlement account
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <MonoField label="Linked bank account" value={COOLAIR_HVAC.linkedAccount} />
              </div>
              <Field label="Avg. monthly volume" value={COOLAIR_HVAC.avgMonthlyVolume} />
              <Field label="Avg. transaction size" value={COOLAIR_HVAC.avgTransactionSize} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: "#2569EC", fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1E54BD")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2569EC")}
          >
            Submit application
          </button>
          <p className="text-xs text-center mt-3" style={{ color: "#6E7681", fontFamily: "'Inter', sans-serif" }}>
            By submitting, you authorize ABC Community Bank to verify this information.
          </p>
        </form>
      </div>
    </div>
  );
}
