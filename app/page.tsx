"use client";

import Link from "next/link";

export default function ProductOfferingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0D1117", color: "#E6EDF3" }}>
      {/* Header */}
      <header className="border-b px-8 py-5 flex items-center justify-between" style={{ borderColor: "#30363D" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: "#2569EC" }}>
            A
          </div>
          <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif", color: "#E6EDF3" }}>
            ABC Community Bank
          </span>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#21262D", color: "#8B949E", border: "1px solid #30363D" }}>
          Partner Platform
        </span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-4xl mx-auto w-full">
        <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "#0F2236", color: "#58A6FF", border: "1px solid #1F4E8C" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
          Now available for SaaS partners
        </div>

        <h1 className="text-5xl font-bold leading-tight mb-5 mt-2" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>
          Our bank,<br />
          <span style={{ color: "#2569EC" }}>inside your software.</span>
        </h1>

        <p className="text-lg leading-relaxed mb-4 max-w-2xl" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
          ABC Community Bank's PayFac-as-a-Service connector lets your platform embed payments and point-of-sale financing directly into your product — with funds settling natively on our ledger, not a third-party processor's. One integration for your engineering team. Two capabilities for your users.
        </p>

        <p className="text-base leading-relaxed mb-10 max-w-xl" style={{ color: "#6E7681", fontFamily: "'Inter', sans-serif" }}>
          Every transaction becomes a deposit relationship. Every large-ticket job becomes a potential lending relationship. All of it invisible to your users — they just get paid.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-white font-semibold text-base transition-colors"
          style={{ background: "#2569EC", fontFamily: "'Inter', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1E54BD")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2569EC")}
        >
          Get Started
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {/* Capability Cards */}
        <div className="grid md:grid-cols-2 gap-5 mt-16 w-full text-left">
          {/* PayFac card */}
          <div className="rounded-xl p-7 border" style={{ background: "#161B22", borderColor: "#30363D" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ background: "#0F2236" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="2" y="5" width="16" height="11" rx="2" stroke="#2569EC" strokeWidth="1.5" />
                <path d="M2 8h16" stroke="#2569EC" strokeWidth="1.5" />
                <path d="M5 12h3" stroke="#2569EC" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              PayFac-as-a-Service
            </h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
              Integrate once, and your users — contractors, retailers, service businesses — get paid without leaving your product. Funds land directly on our ledger from the first dollar. No third-party processor in the middle, no separate reconciliation step at month-end.
            </p>
            <ul className="space-y-2">
              {[
                "Your users get paid inside the product they already use",
                "Funds native to our core ledger — nothing to reconcile",
                "Existing depositors onboard in minutes, not days",
                "Card processing on our own PayFac rails",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                    <path d="M2.5 7l3 3 6-6" stroke="#3FB950" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Financing card */}
          <div className="rounded-xl p-7 border" style={{ background: "#161B22", borderColor: "#30363D" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ background: "#0F2236" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 2v16M6 6h5.5a2.5 2.5 0 0 1 0 5H6m0 0h6a2.5 2.5 0 0 1 0 5H6" stroke="#2569EC" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Point-of-Sale Financing
            </h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
              When your user closes a large-ticket job, their customer can apply for financing at checkout — inside your product, no redirect, no separate lender app. We make the credit decision and disburse directly to your user's account. Same connector, same ledger entry, same integration your team already built.
            </p>
            <ul className="space-y-2">
              {[
                "Financing decision at checkout — no branch, no redirect",
                "Disbursement posts directly to your user's account",
                "Consumer repays us — zero collections burden on you",
                "Same ledger record as a card settlement",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                    <path d="M2.5 7l3 3 6-6" stroke="#3FB950" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How it works strip */}
        <div className="mt-14 w-full rounded-xl p-8 border" style={{ background: "#161B22", borderColor: "#30363D" }}>
          <h3 className="text-sm font-semibold uppercase tracking-widest mb-7" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
            How it works
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              {
                step: "01",
                title: "Partner integrates once",
                body: "AirConPro's engineering team integrates the connector API. Every contractor using AirConPro inherits the embedded payments and financing experience.",
              },
              {
                step: "02",
                title: "Merchants onboard as sub-merchants",
                body: "CoolAir HVAC applies through the bank's PayFac program. Existing depositors are pre-verified — onboarding takes minutes, not days.",
              },
              {
                step: "03",
                title: "Every checkout is a bank transaction",
                body: "Card or financing — the money moves on the bank's own rails. The SaaS platform's job record and the bank's ledger entry are the same event.",
              },
            ].map(({ step, title, body }) => (
              <div key={step}>
                <div className="text-3xl font-bold mb-3 font-data" style={{ color: "#30363D" }}>{step}</div>
                <h4 className="text-sm font-semibold mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: "#6E7681", fontFamily: "'Inter', sans-serif" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA repeat */}
        <div className="mt-14 flex flex-col items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-white font-semibold text-base transition-colors"
            style={{ background: "#2569EC", fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1E54BD")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2569EC")}
          >
            Get Started as a Partner
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="text-xs" style={{ color: "#6E7681", fontFamily: "'Inter', sans-serif" }}>
            Demo walkthrough — CoolAir HVAC onboarding via AirConPro
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-8 py-5 flex items-center justify-between" style={{ borderColor: "#30363D" }}>
        <span className="text-xs" style={{ color: "#6E7681", fontFamily: "'Inter', sans-serif" }}>
          © 2024 ABC Community Bank. Member FDIC.
        </span>
        <span className="text-xs" style={{ color: "#6E7681", fontFamily: "'Inter', sans-serif" }}>
          Powered by Nymbus
        </span>
      </footer>
    </div>
  );
}
