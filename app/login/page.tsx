"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // No real auth — stylized walkthrough step only
    setTimeout(() => router.push("/onboarding"), 800);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#0D1117" }}>
      {/* Card */}
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold mb-4" style={{ background: "#2569EC" }}>
            A
          </div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: "'DM Sans', sans-serif", color: "#E6EDF3" }}>
            ABC Community Bank
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
            Partner Portal
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border p-8" style={{ background: "#161B22", borderColor: "#30363D" }}>
          <h2 className="text-base font-semibold mb-1" style={{ fontFamily: "'DM Sans', sans-serif", color: "#E6EDF3" }}>
            Sign in to your account
          </h2>
          <p className="text-sm mb-6" style={{ color: "#6E7681", fontFamily: "'Inter', sans-serif" }}>
            Access the PayFac partner portal
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
                Email address
              </label>
              <input
                type="email"
                defaultValue="derek@coolair-hvac.com"
                className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
                style={{
                  background: "#0D1117",
                  border: "1px solid #30363D",
                  color: "#E6EDF3",
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#2569EC")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#30363D")}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium" style={{ color: "#8B949E", fontFamily: "'Inter', sans-serif" }}>
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs"
                  style={{ color: "#2569EC", fontFamily: "'Inter', sans-serif" }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
                style={{
                  background: "#0D1117",
                  border: "1px solid #30363D",
                  color: "#E6EDF3",
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#2569EC")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#30363D")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              style={{ background: "#2569EC", fontFamily: "'Inter', sans-serif" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#1E54BD"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#2569EC"; }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 6" />
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="mt-5 text-center">
          <Link href="/" className="text-xs" style={{ color: "#6E7681", fontFamily: "'Inter', sans-serif" }}>
            ← Back to partner overview
          </Link>
        </div>
      </div>
    </div>
  );
}
