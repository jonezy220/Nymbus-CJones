"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ARNOLD_FREEZE_JOB, COOLAIR_HVAC } from "@/lib/mock-data";
import { Suspense } from "react";

function generateLedgerEntryId(type: string) {
  return `LE-${ARNOLD_FREEZE_JOB.jobNumber.replace("JOB-", "")}-${type === "card" ? "C" : "F"}`;
}

function formatTimestamp() {
  return new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

function DataRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b last:border-0" style={{ borderColor: "#21262D" }}>
      <span className="text-xs shrink-0" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
        {label}
      </span>
      <span
        className={mono ? "text-xs text-right font-data" : "text-xs text-right"}
        style={{ color: "#E6EDF3", fontFamily: mono ? undefined : "'Inter', sans-serif" }}
      >
        {value}
      </span>
    </div>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") === "financed" ? "financed" : "card";

  const isCard = type === "card";
  const timestamp = formatTimestamp();
  const ledgerEntryId = generateLedgerEntryId(type);

  const entryTypeLabel = isCard ? "Card Settlement" : "Loan Disbursement";
  const entryTypeCode = isCard ? "card_settlement" : "loan_disbursement";
  const statusLabel = isCard ? "Settled" : "Disbursed";

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: "#0D1117" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: "#2569EC" }}>
              A
            </div>
            <span className="text-base font-semibold" style={{ fontFamily: "'DM Sans', sans-serif", color: "#E6EDF3" }}>
              ABC Community Bank
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#0F2A18", color: "#3FB950", border: "1px solid #1A4A2A" }}>
            ✓ Transaction confirmed
          </span>
        </div>

        <p className="text-xs mb-8" style={{ color: "#6E7681", fontFamily: "'Inter', sans-serif" }}>
          Core Ledger — PayFac Transaction Record
        </p>

        {/* Match badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border" style={{ background: "#0F2A18", borderColor: "#1A4A2A" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7l3 3 7-7" stroke="#3FB950" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-semibold font-data" style={{ color: "#3FB950" }}>
              Matched — Single System of Record
            </span>
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          {/* Left: AirConPro transaction record */}
          <div className="rounded-xl border p-6" style={{ background: "#161B22", borderColor: "#30363D" }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: "#0F766E" }}>
                AC
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
                AirConPro — Transaction Record
              </p>
            </div>

            <div>
              <DataRow label="Platform" value="AirConPro" />
              <DataRow label="Job #" value={ARNOLD_FREEZE_JOB.jobNumber} mono />
              <DataRow label="Merchant" value={COOLAIR_HVAC.businessLegalName} />
              <DataRow label="Customer" value={ARNOLD_FREEZE_JOB.customer} />
              <DataRow label="Amount" value={`$${ARNOLD_FREEZE_JOB.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} mono />
              <DataRow label="Type" value={entryTypeLabel} />
              <DataRow label="Status" value={statusLabel} />
              <DataRow label="Timestamp" value={timestamp} mono />
            </div>

            <div className="mt-4 pt-4 border-t" style={{ borderColor: "#21262D" }}>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#0F2236", color: "#58A6FF", border: "1px solid #1F4E8C" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {entryTypeCode}
              </span>
            </div>
          </div>

          {/* Right: Bank ledger entry */}
          <div className="rounded-xl border p-6" style={{ background: "#161B22", borderColor: "#2569EC" }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: "#2569EC" }}>
                A
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
                ABC Community Bank — Core Ledger
              </p>
            </div>

            <div>
              <DataRow label="System" value="ABC Community Bank Core Ledger" />
              <DataRow label="Ledger entry" value={ledgerEntryId} mono />
              <DataRow label="Merchant account" value={`${COOLAIR_HVAC.businessLegalName} — ••••3847`} />
              <DataRow label="Customer" value={ARNOLD_FREEZE_JOB.customer} />
              <DataRow label="Amount" value={`$${ARNOLD_FREEZE_JOB.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} mono />
              <DataRow label="Entry type" value={entryTypeLabel} />
              <DataRow label="Reference" value={ARNOLD_FREEZE_JOB.jobNumber} mono />
              <DataRow label="Status" value="Posted" />
              <DataRow label="Posted at" value={timestamp} mono />
            </div>

            <div className="mt-4 pt-4 border-t" style={{ borderColor: "#21262D" }}>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#0F2A18", color: "#3FB950", border: "1px solid #1A4A2A" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                posted
              </span>
            </div>
          </div>
        </div>

        {/* Connector line / explanation */}
        <div className="rounded-xl border p-6 mb-8" style={{ background: "#161B22", borderColor: "#30363D" }}>
          <p className="text-sm leading-relaxed text-center" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
            Because ABC Community Bank was the payment facilitator from the start, there is no external record to reconcile —{" "}
            <span style={{ color: "#E6EDF3" }}>only a ledger entry to confirm.</span>
            {" "}The AirConPro job record and the bank ledger entry share the same job reference, amount, and timestamp because they are the same underlying event.
          </p>
        </div>

        {/* What just happened */}
        <div className="rounded-xl border p-6 mb-8" style={{ background: "#161B22", borderColor: "#30363D" }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
            What just happened
          </h3>
          <div className="space-y-3">
            {isCard ? (
              <>
                <Step n={1} text={`Mr. Arnold Freeze paid $8,000 by card for ${ARNOLD_FREEZE_JOB.service}`} />
                <Step n={2} text="Stripe processed the card on ABC Community Bank's PayFac rails" />
                <Step n={3} text={`Funds settled directly to CoolAir HVAC LLC — ••••3847 at ABC Community Bank`} />
                <Step n={4} text={`Ledger entry ${ledgerEntryId} posted as card_settlement — no external reconciliation required`} />
              </>
            ) : (
              <>
                <Step n={1} text={`Arnold Freeze applied for $8,000 financing through ABC Community Bank`} />
                <Step n={2} text="ABC Community Bank approved the loan and disbursed funds directly to CoolAir HVAC" />
                <Step n={3} text={`Funds posted to CoolAir HVAC LLC — ••••3847 as loan disbursement`} />
                <Step n={4} text={`Ledger entry ${ledgerEntryId} posted as loan_disbursement — Arnold Freeze repays the bank directly`} />
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <Link
            href="/checkout"
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ border: "1px solid #30363D", color: "#8B949E", fontFamily: "'Inter', sans-serif" }}
          >
            ← Return to AirConPro
          </Link>
          <button
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ border: "1px solid #30363D", color: "#8B949E", fontFamily: "'Inter', sans-serif" }}
          >
            View full ledger
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 font-data"
        style={{ background: "#21262D", color: "#8B949E" }}
      >
        {n}
      </span>
      <p className="text-sm" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>{text}</p>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D1117" }}>
        <div className="text-sm" style={{ color: "#8B949E" }}>Loading confirmation…</div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
