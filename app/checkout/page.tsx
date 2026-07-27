"use client";

import Link from "next/link";
import { ARNOLD_FREEZE_JOB } from "@/lib/mock-data";

export default function CheckoutPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "#F8F9FA", color: "#1A202C", fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-xl mx-auto">
        {/* AirConPro header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: "#0F766E" }}>
              AC
            </div>
            <span className="text-base font-semibold" style={{ fontFamily: "'Inter', sans-serif", color: "#1A202C" }}>
              AirConPro
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#F0FDF4", color: "#0F766E", border: "1px solid #D1FAE5" }}>
            Job complete
          </span>
        </div>

        {/* Job card */}
        <div className="rounded-xl border bg-white mb-5 overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
          {/* Job header */}
          <div className="px-6 py-5 border-b" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "#64748B" }}>Job number</p>
                <p className="text-base font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>{ARNOLD_FREEZE_JOB.jobNumber}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium mt-1" style={{ background: "#FEF3C7", color: "#92400E" }}>
                Awaiting payment
              </span>
            </div>
          </div>

          {/* Job details */}
          <div className="px-6 py-5 space-y-3 border-b" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex gap-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                <circle cx="8" cy="7" r="3" stroke="#64748B" strokeWidth="1.2" />
                <path d="M8 2C5.24 2 3 4.24 3 7c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" stroke="#64748B" strokeWidth="1.2" />
              </svg>
              <div>
                <p className="text-xs mb-0.5" style={{ color: "#64748B" }}>Customer</p>
                <p className="text-sm font-medium">{ARNOLD_FREEZE_JOB.customer}</p>
                <p className="text-xs" style={{ color: "#64748B" }}>{ARNOLD_FREEZE_JOB.address}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#64748B" strokeWidth="1.2" />
                <path d="M5 1v3M11 1v3M2 7h12" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <div>
                <p className="text-xs mb-0.5" style={{ color: "#64748B" }}>Date</p>
                <p className="text-sm font-medium">{today}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                <circle cx="8" cy="8" r="6" stroke="#64748B" strokeWidth="1.2" />
                <path d="M8 5v3l2 2" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <div>
                <p className="text-xs mb-0.5" style={{ color: "#64748B" }}>Technician</p>
                <p className="text-sm font-medium">{ARNOLD_FREEZE_JOB.technician}</p>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="px-6 py-5 border-b" style={{ borderColor: "#E2E8F0" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#64748B" }}>Service</p>
            <div className="flex justify-between items-start mb-3">
              <p className="text-sm pr-4">{ARNOLD_FREEZE_JOB.service}</p>
              <p className="text-sm font-semibold shrink-0">${ARNOLD_FREEZE_JOB.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex justify-between items-center text-sm" style={{ color: "#64748B" }}>
              <p>Tax ({ARNOLD_FREEZE_JOB.taxRate})</p>
              <p>${ARNOLD_FREEZE_JOB.tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Total */}
          <div className="px-6 py-4 flex justify-between items-center" style={{ background: "#F8F9FA" }}>
            <p className="text-base font-bold">Total due</p>
            <p className="text-xl font-bold" style={{ color: "#0F766E" }}>
              ${ARNOLD_FREEZE_JOB.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Payment options */}
        <div className="rounded-xl border bg-white p-6" style={{ borderColor: "#E2E8F0" }}>
          <p className="text-sm font-semibold mb-4">How would you like to pay?</p>

          <div className="flex flex-col gap-3">
            {/* Card option */}
            <Link
              href="/checkout/card"
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:border-teal-600"
              style={{ borderColor: "#E2E8F0" }}
              onClick={() => sessionStorage.setItem("paymentType", "card")}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#F0FDF4" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="2" y="5" width="16" height="11" rx="2" stroke="#0F766E" strokeWidth="1.5" />
                  <path d="M2 9h16" stroke="#0F766E" strokeWidth="1.5" />
                  <path d="M5 13h3" stroke="#0F766E" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Pay in full — card</p>
                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Visa, Mastercard, Amex, Discover</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 4l4 4-4 4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            {/* Financing option */}
            <Link
              href="/checkout/financing"
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:border-teal-600"
              style={{ borderColor: "#E2E8F0" }}
              onClick={() => sessionStorage.setItem("paymentType", "financed")}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EFF6FF" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 2v16M6 6h5.5a2.5 2.5 0 0 1 0 5H6m0 0h6a2.5 2.5 0 0 1 0 5H6" stroke="#2569EC" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Apply for financing</p>
                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>$8,000 over 24 months — from $366/mo</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 4l4 4-4 4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <p className="text-xs text-center mt-4" style={{ color: "#94A3B8" }}>
            Financing provided by ABC Community Bank, Member FDIC
          </p>
        </div>
      </div>
    </div>
  );
}
