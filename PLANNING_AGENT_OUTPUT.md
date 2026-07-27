# Planning Agent Output — Nymbus-CJones
## ABC Community Bank PayFac-as-a-Service Demo

> **Note:** This document is the verbatim output of Kiro's Planning Agent (`/plan`), invoked to reflect on and formalize the architecture of the already-built project. It is a genuine planning artifact distinct from `FEATURE_SPEC.md`, which is the comprehensive requirements/design/tasks document written requirements-first before any code was touched. The Planning Agent was scoped to the two-flow structure, connector API surface, and PayFac-as-a-Service reframe — the three architectural elements that define the project.

---

## Task Breakdown

The tasks below are ordered as the project should have been (and was) built: integration contract first, then shared data layer, then the server-side gate, then bank-side flow, then consumer-side flow, then the confirmation view that ties it together. Each task produces demoable, integrated functionality.

---

**Task 1: Integration Spec and Project Scaffold**

Objective: Establish the API contract before writing any implementation code, and set up the project skeleton so all subsequent tasks build against a stable foundation.

Implementation guidance:
- Initialize Next.js 16.2 with App Router, TypeScript, Tailwind CSS v4 (CSS-first, no tailwind.config.js), and Geist Mono via next/font.
- Configure globals.css with @theme inline block defining all design system tokens: bank palette (#0D1117 bg, #2569EC primary, #161B22 surface, DM Sans/Inter/Geist Mono) and AirConPro palette (#F8F9FA bg, #0F766E primary). Load DM Sans and Inter via Google Fonts @import above the tailwindcss import (CSS @import ordering requirement).
- Write INTEGRATION_SPEC.md covering: all three connector endpoints with full request/response shapes, auth model (Bearer key, sandbox note that it's unenforced), forceDecision sandbox param, test card table, sequence diagrams for both flows, and production design notes (async webhooks, real KYB, multi-bank routing).
- The spec is the source of truth. The stubs implement a mocked version of what the spec describes.

Demo: Spec document is readable and complete. Project runs `npm run dev` and renders a blank index page with correct fonts loaded.

---

**Task 2: Session Hook (lib/session-log.ts)**

Objective: Wire the build logging infrastructure before any application code is written so it captures decisions in real time, not as a reconstructed summary.

Implementation guidance:
- lib/session-log.ts: append-only JSONL writer using Node `fs.appendFileSync`. Four exported helpers: `logPrompt`, `logDecision`, `logIteration`, `logMilestone`. Each writes a JSON line to `kiro-session.log` with `{ timestamp, type, context, content, tags }`.
- Guard with `typeof window !== 'undefined'` check — fs is not available in browser or edge contexts.
- Non-fatal: catch block logs a `console.warn` rather than throwing. The hook must never break the demo.
- Add `kiro-session.log` to `.gitignore` if it should not be committed, or leave tracked if the log is a deliverable (it is a graded deliverable here — leave tracked).

Demo: Calling `logMilestone("test", "hook wired")` from any API route produces a JSONL line in `kiro-session.log`. File is readable with `cat`.

---

**Task 3: Mock Data Fixtures (lib/mock-data.ts)**

Objective: Centralize all fictional entity data in one read-only module so every page and API route references the same values and the demo scenario is internally consistent.

Implementation guidance:
- Export `as const` objects: `COOLAIR_HVAC` (businessLegalName, dba, businessType, ein, address, phone, ownerName, ownerTitle, ownerDob, ownerSsnMasked, linkedAccount, avgMonthlyVolume, avgTransactionSize, merchantId).
- Export `ARNOLD_FREEZE_JOB` (jobNumber: "JOB-2024-0847", customer: "Mr. Arnold Freeze", address, service: "Central AC Installation — Carrier 3-Ton Unit", technician, subtotal: 7200, tax: 800, total: 8000, taxRate).
- Export `FINANCING_TERMS` (loanAmount: 8000, term: 24, apr: 9.99, monthlyPayment: 366.69, lender: "ABC Community Bank").
- Export `UNDERWRITING_RESULT` and `FINANCING_RESULT` as `{ approved: {...}, denied: {...} }` shape — API routes destructure by decision key.
- Export `STRIPE_TEST_CARDS` with success / insufficientFunds / declineGeneric card numbers.
- All values typed `as const` — no writes, no mutation.

Demo: Import `COOLAIR_HVAC` in a page and render `businessLegalName` — confirms the data layer is wired. All values match the spec.

---

**Task 4: Connector API Routes**

Objective: Implement the three connector endpoints that are the technical core of the demo. These are the only routes that perform real external calls (Stripe) or simulate backend systems (underwriting, financing).

Implementation guidance:

`POST /api/underwriting` (app/api/underwriting/route.ts):
- Parse `{ merchantId, forceDecision }` from request body.
- `sleep(2500)` to simulate real underwriting review time.
- `decision = forceDecision === "denied" ? "denied" : "approved"`.
- Return `UNDERWRITING_RESULT[decision]` as JSON.
- Call `logMilestone` with decision, merchantId, and tags `["underwriting", "flow-1c", decision]`.

`POST /api/financing/decision` (app/api/financing/decision/route.ts):
- Parse `{ applicantName, loanAmount, jobId, forceDecision }`.
- `sleep(2500)`.
- Return `FINANCING_RESULT[decision]`.
- Call `logMilestone` with applicant, amount, jobId, decision.

`lib/stripe.ts` — lazy getter:
- Module-level `let _stripe: Stripe | null = null`.
- `export function getStripe(): Stripe` — initializes on first call, throws if `STRIPE_SECRET_KEY` absent. This prevents build-time failure when the env var is not set.

`POST /api/stripe/create-payment-intent` (app/api/stripe/create-payment-intent/route.ts):
- Validate `amount` is a number (return 400 if not).
- `getStripe().paymentIntents.create({ amount, currency, metadata: { jobId, merchant: "CoolAir HVAC LLC", customer: "Mr. Arnold Freeze", platform: "AirConPro" }, automatic_payment_methods: { enabled: true } })`.
- Return `{ clientSecret: paymentIntent.client_secret }`.
- Call `logMilestone` with `paymentIntent.id`, amount, jobId.

All routes: catch block returns `{ error: message }` with 500.

Demo: `curl -X POST http://localhost:3000/api/underwriting -d '{"merchantId":"coolair-hvac-001"}'` returns approved JSON after ~2.5s. Financing and Stripe endpoints respond correctly. `kiro-session.log` has entries for each call.

---

**Task 5: Server-Side Checkout Gate (proxy.ts)**

Objective: Protect `/checkout` and all sub-routes at the middleware layer so no protected HTML is ever rendered for unapproved sessions — eliminating the flash-of-content bug that a useEffect/sessionStorage gate would cause.

Implementation guidance:
- `proxy.ts` at project root (Next.js 16 renames `middleware.ts` to `proxy.ts` in its internal resolution — export the function as `proxy` with the standard `NextRequest → NextResponse` signature).
- If `pathname` starts with `"/checkout"`: read `req.cookies.get("approvalStatus")?.value`. If not `"approved"`, return `NextResponse.redirect(new URL("/", req.url))`.
- `export const config = { matcher: ["/checkout", "/checkout/:path*"] }`.
- The cookie is set client-side by the underwriting page on approval: `document.cookie = "approvalStatus=approved; path=/; SameSite=Lax"`. This is intentional — the underwriting page is the approval gate, and setting the cookie there is the natural handoff point.
- Do not use `sessionStorage` for the gate. `sessionStorage` is client-only; it does not stop SSR from rendering protected content.

Demo: `curl -D - http://localhost:3000/checkout` with no cookie returns `HTTP/1.1 307` and `location: /`. With the cookie set, returns `200`. No flash of job content occurs on direct navigation.

---

**Task 6: Product Offering Page (app/page.tsx)**

Objective: Build the single bank-branded entry point that pitches PayFac-as-a-Service and Point-of-Sale Financing to prospective SaaS partners, and provides the "Get Started" CTA launching Flow 1.

Implementation guidance:
- Dark theme: bg `#0D1117`, surface `#161B22`, borders `#30363D`. DM Sans for headings, Inter for body.
- Header: ABC Community Bank logo mark (blue square with "A"), name, "Partner Platform" pill.
- Hero: badge ("Now available for SaaS partners"), h1 addressed to the SaaS partner, primary/secondary body copy, "Get Started" button (`#2569EC` → `/login`) with hover (`#1E54BD`).
- Two capability cards: PayFac-as-a-Service and Point-of-Sale Financing. Each with icon, heading, description, and 4-item checklist (green checkmarks, `#3FB950`). Copy addressed to the SaaS partner ("your users get paid") not to another bank.
- "How it works" strip: three numbered steps (01, 02, 03) with Geist Mono for step numbers.
- Footer: "© 2024 ABC Community Bank. Member FDIC." and "Powered by Nymbus".
- Repeat CTA at bottom.
- No Tailwind class-based color application for brand colors — use `inline style={{ }}` to keep design system tokens explicit and independent of Tailwind's JIT.

Demo: Full offering page renders at `/`. "Get Started" navigates to `/login`. All copy addresses a SaaS platform partner, not a bank prospect.

---

**Task 7: Flow 1 — Bank Login (app/login/page.tsx)**

Objective: Stylized bank login screen. No real authentication — any credentials submitted proceed to onboarding after a short delay.

Implementation guidance:
- Dark theme, centered card layout, `max-w-sm`.
- ABC Community Bank logo mark, "Partner Portal" subtitle.
- Form: email (`defaultValue: derek@coolair-hvac.com`), password (defaultValue: masked dots), "Sign in" button.
- onSubmit: `setLoading(true)`, `setTimeout` 800ms, `router.push("/onboarding")`.
- Loading state: spinner SVG + "Signing in…" text in the button.
- Focus ring on inputs: `onFocus` sets `borderColor` to `#2569EC`, `onBlur` resets.
- "Back to partner overview" link → `/`.
- No form validation needed — this is a walkthrough step.

Demo: `/login` renders bank-branded login. Submitting the form shows a brief loading state then navigates to `/onboarding`.

---

**Task 8: Flow 1 — Pre-filled Onboarding (app/onboarding/page.tsx)**

Objective: Sub-merchant onboarding form pre-populated with CoolAir HVAC's data from `lib/mock-data.ts`. Communicates the product point that existing depositors get a frictionless upgrade.

Implementation guidance:
- Three-step progress indicator: "Log in" (completed, checkmark), "Business info" (active, blue border), "Review & submit" (future, muted).
- Pre-fill info banner (`#0F2236` bg, `#1F4E8C` border, `#58A6FF` text): "Your business information has been pre-filled from your existing ABC Community Bank account."
- Three sections (each a card: `#161B22` bg, `#30363D` border):
  1. Business information: businessLegalName (full-width), dba, businessType, ein (MonoField), address (full-width), phone.
  2. Beneficial owner: ownerName, ownerTitle, ownerDob (MonoField), ownerSsnMasked (MonoField).
  3. Settlement account: linkedAccount (MonoField, full-width), avgMonthlyVolume, avgTransactionSize.
- All fields are display-only divs styled to look like inputs — not editable inputs.
- MonoField uses `font-data` (Geist Mono) class.
- Submit button navigates to `/underwriting`. No API call here.

Demo: `/onboarding` shows pre-filled CoolAir HVAC data across all three sections. Submit → `/underwriting`.

---

**Task 9: Flow 1 — Underwriting Decision (app/underwriting/page.tsx)**

Objective: Call the underwriting API, show a real-feeling loading state, then render the approval or denial result. On approval, set the cookie that gates `/checkout`.

Implementation guidance:
- `useEffect` on mount: `POST /api/underwriting` with `{ merchantId: COOLAIR_HVAC.merchantId }`.
- State machine: `"loading"` → `"approved"` | `"denied"`.
- Loading state: centered spinner SVG (`animate-spin` with `#2569EC` arc on `#30363D` track), "Reviewing your application" heading, explanatory copy referencing existing depositor data.
- Approved state: green checkmark icon (`#3FB950`), "Application approved" heading, data table showing merchantId, subMerchantId, perTransaction limit, dailyVolume limit, linkedAccount (all MonoField style with Geist Mono). "Start accepting payments →" button → `router.push("/checkout")`.
  - On approval: `document.cookie = "approvalStatus=approved; path=/; SameSite=Lax"` and `sessionStorage.setItem("approvalStatus", "approved")`, `sessionStorage.setItem("subMerchantId", data.subMerchantId)`.
- Denied state: red X icon (`#F85149`), "Application not approved" heading, denial reason, "Contact support" button, "Return to home" link.
- catch block sets state to `"denied"`.

Demo: `/underwriting` shows loading spinner for ~2.5s then approved state with CoolAir HVAC's sub-merchant details. Cookie is set. Navigating to `/checkout` works. Direct navigation to `/checkout` without the cookie redirects to `/`.

---

**Task 10: Flow 2 — AirConPro Checkout Screen (app/checkout/page.tsx)**

Objective: The "payments in someone else's glass" moment. AirConPro-branded job/invoice screen presenting Arnold Freeze's $8,000 job and two payment options. No bank branding here — its absence is intentional and explained.

Implementation guidance:
- Light theme (bg `#F8F9FA`, white cards, `#E2E8F0` borders). AirConPro header: green logo (`#0F766E`), "Job complete" pill.
- Job card with three sections:
  1. Header: job number (JOB-2024-0847), "Awaiting payment" amber pill.
  2. Details: customer name + address, date (dynamically formatted), technician name.
  3. Line items: service name + $7,200, tax $800. Total: $8,000.00 in `#0F766E`.
- Payment options panel: two Link cards — card and financing. Each with icon, heading, description, chevron.
  - Card link: `href="/checkout/card"`, onClick sets `sessionStorage("paymentType", "card")`.
  - Financing link: `href="/checkout/financing"`, onClick sets `sessionStorage("paymentType", "financed")`.
- Footer note: "Financing provided by ABC Community Bank, Member FDIC" — the only bank reference on this screen.
- No Nymbus/bank colors, no ABC Community Bank logo.

Demo: `/checkout` renders AirConPro job screen with Arnold Freeze's details. Both payment path links work. Design has zero bank branding.

---

**Task 11a: Flow 2 — Card Path (app/checkout/card/page.tsx)**

Objective: Mount Stripe Elements configured with AirConPro's Appearance API theme. Handle real payment confirmation, real Stripe-generated error messages on decline, and route to `/confirmation` on success.

Implementation guidance:
- On mount: `POST /api/stripe/create-payment-intent { amount: 800000, currency: "usd", jobId: ARNOLD_FREEZE_JOB.jobNumber }`. Store `clientSecret` in state.
- While loading: spinner + "Initializing payment…" in place of Elements.
- Stripe Appearance config: theme `"flat"`, `colorPrimary #0F766E`, `colorBackground #FFFFFF`, `colorText #1A202C`, `fontFamily "Inter, sans-serif"`, `borderRadius "8px"`. Rules: `.Input` border `#E2E8F0`, focus `#0F766E` with subtle box-shadow. `.Label` fontWeight 500, color `#374151`.
- Mount: `<Elements stripe={stripePromise} options={{ clientSecret, appearance }}><CheckoutForm /></Elements>`.
- CheckoutForm: `stripe.confirmPayment({ elements, confirmParams: { return_url: .../confirmation?type=card }, redirect: "if_required" })`. On error: set `errorMessage` state (shown as red banner with Stripe's `error.message`). On success: `sessionStorage.setItem("paymentType", "card")`, `router.push("/confirmation?type=card")`.
- Test card helper panel (amber `#FFFBEB` background): lists success/insufficient-funds/generic-decline card numbers with Geist Mono.
- `loadStripe()` called at module level with `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — safe, publishable key is client-facing by design.

Demo: `/checkout/card` mounts Stripe Elements in AirConPro's color scheme. `4242 4242 4242 4242` → confirmation. `4000 0000 0000 9995` → Stripe error message rendered in the form. No bank branding visible.

---

**Task 11b: Flow 2 — Financing Path (app/checkout/financing/page.tsx)**

Objective: Financing application form, mocked decision with loading state, approval with loan terms, denial with card fallback. Mirrors the underwriting stub pattern but is a separate endpoint and a separate conceptual decision.

Implementation guidance:
- State machine: `"form"` → `"loading"` → `"approved"` | `"denied"`.
- Form state: pre-filled applicant name ("Arnold Freeze"), read-only loan amount ($8,000.00), estimated terms preview panel (24 months, 9.99% APR, $366.69/mo in `#F0FDF4` green tint).
- On submit: `POST /api/financing/decision { applicantName: "Arnold Freeze", loanAmount: 8000, jobId: "JOB-2024-0847" }`.
- Loading state: blue spinner, "Reviewing your application", "ABC Community Bank is reviewing your financing request…".
- Approved state: green checkmark, "Financing approved", lender name, loan terms table (loanId in Geist Mono, amount, term, APR, monthly payment), "Accept & finalize" button → `sessionStorage.setItem("paymentType", "financed")`, `router.push("/confirmation?type=financed")`.
- Denied state: red X, reason string, "You can still complete your purchase by paying with a card.", "Pay by card instead" button → `router.push("/checkout/card")`.
- AirConPro branding throughout, no bank logo.

Demo: `/checkout/financing` shows form → loading → approved with real loan terms. "Accept & finalize" → confirmation. Denial path shows card fallback CTA.

---

**Task 12: Confirmation / Ledger View (app/confirmation/page.tsx)**

Objective: The most important screen in the demo. Two-panel layout showing AirConPro's transaction record and ABC Community Bank's core ledger entry side-by-side, demonstrating single-system-of-record. Handles both card settlement and loan disbursement paths. Never cut.

Implementation guidance:
- Wrapped in `<Suspense>` because `useSearchParams()` requires it in Next.js App Router.
- Read `type` from search params: `"financed"` or default `"card"`. This determines all labels and ledger entry IDs.
- `generateLedgerEntryId(type)`: `"LE-2024-0847-C"` (card) or `"LE-2024-0847-F"` (financed).
- "Matched — Single System of Record" badge (`#0F2A18` bg, `#3FB950` text, checkmark icon).
- Two panels side-by-side (`md:grid-cols-2`):
  - Left (AirConPro Transaction Record): AirConPro "AC" logo, rows for Platform, Job#, Merchant, Customer, Amount, Type, Status, Timestamp. Blue pill badge with entry type code.
  - Right (ABC Community Bank Core Ledger): ABC bank "A" logo, blue border (vs gray for left panel), rows for System, Ledger entry (Geist Mono), Merchant account, Customer, Amount, Entry type, Reference, Status, Posted at. Green "posted" pill.
- `DataRow` component: flex justify-between, label in `#8B949E` Inter, value in `#E6EDF3`, optional `mono` prop for Geist Mono values.
- Explanation paragraph: "Because ABC Community Bank was the payment facilitator from the start, there is no external record to reconcile — only a ledger entry to confirm."
- "What just happened" steps: 4 numbered steps, content differs by payment type (card settlement narrative vs. loan disbursement narrative).
- Actions: "Return to AirConPro" (→ `/checkout`), "View full ledger" (stub button).
- Dark theme (Nymbus design system) — this is a bank-branded screen.

Demo: `/confirmation?type=card` shows both panels with matched card settlement data. `/confirmation?type=financed` shows loan disbursement narrative. "Matched — Single System of Record" badge is immediately visible. The screen reads as a real bank ledger confirmation, not a success toast.

---

## Architectural Notes

### The Core Architectural Claim
The value proposition of the entire demo hinges on one verifiable fact visible at the confirmation screen: the AirConPro job reference (JOB-2024-0847) and the bank ledger entry reference are the same string. Amount matches. Timestamp matches. Because the bank is the PayFac, there is no intermediary ledger to reconcile against — the connector is thin by design.

### Server-Side Gate vs. Client-Side useEffect Guard
The most important non-obvious engineering decision in the project. Next.js App Router renders page HTML on the server before JavaScript hydrates on the client. A `useEffect` guard reading `sessionStorage` fires after the browser receives the HTML, which means a direct navigation to `/checkout` would briefly expose Arnold Freeze's name, the $8,000 total, and the payment options before redirecting. The fix — `proxy.ts` middleware reading a cookie before any HTML is generated — is the architecturally correct solution. The cookie is set by the underwriting page on approval, creating a clear handoff point with no race condition.

Verification command: `curl -D - http://localhost:3000/checkout` (no cookie) → `HTTP/1.1 307`, `location: /`. With cookie: `200`.

### Stripe Client Lazy Initialization
`loadStripe()` (client side, safe) is called at module level in `card/page.tsx` with the publishable key. The server-side Stripe client (`lib/stripe.ts`) uses a lazy getter pattern — `getStripe()` initializes on first call and throws only if `STRIPE_SECRET_KEY` is absent at runtime, not at build time. This means `npm run build` succeeds without a Stripe key in the environment (required for CI and Vercel preview deployments where the secret is injected at runtime).

### Design System Split
The split is enforced at the page level, not via a shared component library. Bank-side routes (`/`, `/login`, `/onboarding`, `/underwriting`, `/confirmation`) use: background `#0D1117`, surface `#161B22`, primary `#2569EC`, DM Sans headings, Geist Mono for data fields. AirConPro-side routes (`/checkout`, `/checkout/card`, `/checkout/financing`) use: background `#F8F9FA`, white cards, primary `#0F766E`, Inter throughout. No component crosses the boundary. The bank being invisible at AirConPro's checkout is a product feature — it's what "embedded" means in embedded payments.

### State Threading: sessionStorage + Cookie
Two state mechanisms serve different purposes:
- **Cookie** (`approvalStatus=approved`): server-readable, used by `proxy.ts` for the checkout gate. Lasts until browser close (no max-age set).
- **sessionStorage** (`paymentType`, `approvalStatus`, `subMerchantId`): client-only, used by the confirmation page to determine which ledger narrative to display. Cleared on tab close.

The cookie is the security mechanism. sessionStorage is UI state. They are not interchangeable.

### Mocked API Endpoints vs. Real Integration
The underwriting and financing endpoints are fake-working stubs: real HTTP calls, real loading states, real 2.5s delays, real structured JSON responses. The decisions are hardcoded. Both stubs support `forceDecision=denied` so denial paths are demonstrable without changing code. In production, both would be replaced by async webhook-based flows against real KYB and credit decisioning providers.

### Session Hook Honest Limitations
The hook (`lib/session-log.ts`) is wired into all three API routes via `logMilestone` calls. It is not called from UI build tasks (pages), which are pure file-write operations with no server-side execution path. The correct production pattern would call `logDecision` and `logMilestone` from a build script or CI hook that fires as tasks complete — not relying solely on API route execution to capture build context.

### What Would Change in Production
1. **Multi-bank routing** — single-bank connector creates OCC concentration risk at platform scale. Production connector needs to route across multiple sponsor banks.
2. **Async webhook architecture** — synchronous underwriting and financing responses work for demo but are wrong for production where decisions can take minutes.
3. **Real KYB/KYC integration** — underwriting stub should call Experian/LexisNexis for business identity and synthetic identity fraud detection.
4. **Real ability-to-repay assessment** — financing stub should pull bureau data and apply state-specific regulatory logic.
5. **OAuth 2.0 partner authentication** — static Bearer key in the spec is correct for sandbox but insufficient for production.
6. **Idempotency keys on all POST endpoints** — required for safe retry behavior on network failures.
