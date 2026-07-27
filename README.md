# Nymbus-CJones: ABC Community Bank — PayFac-as-a-Service Demo

A working proof of concept showing how a community bank can win back SMB deposits and lending relationships by becoming the payment facilitator for the software small businesses already use to run their operations — instead of sitting behind a third-party processor at arm's length.

This is a product launch package, not just a UI prototype: a product offering page, a connector integration spec, and a working demo of both flows.

---

## What was built, why, and who the user is

### The problem

Community banks are losing SMB deposits to fintechs and vertical SaaS platforms that make it easy to move money without ever touching a bank relationship. The typical fix routes payments through a third-party payment facilitator sitting between the SaaS platform and the bank — which means the bank is still an arm's-length sponsor, still doesn't own the software experience, and still reconciles a ledger it didn't originate.

The stronger fix: the bank itself becomes the payment facilitator. A connector layer lets the SaaS platform plug directly into the bank's own PayFac-as-a-Service capability. Funds never leave the bank's platform. The SaaS platform's transaction record and the bank's ledger entry are the same event — there is nothing to reconcile, only something to confirm. And because the bank is already the system of record for payments, offering point-of-sale financing on large-ticket transactions through the same connector turns a single checkout moment into both a deposit and a lending relationship.

### Who the user is — this is multi-sided, and collapsing it to one "user" misses the point

**ABC Community Bank** is the direct buyer and beneficiary of the capability. The bank (via Nymbus) deploys the PayFac-as-a-Service connector and owns the ledger. Flow 1 — the product offering page, onboarding, and underwriting — is the bank's surface.

**AirConPro** is the technical integration partner: a vertical SaaS platform (job management, invoicing, scheduling) used by HVAC contractors. AirConPro integrates the connector once. Every contractor on AirConPro inherits the embedded payments and financing experience without building it themselves. AirConPro is never bank-branded — the bank being invisible at the checkout moment is a feature, not an oversight.

**CoolAir HVAC** is the sub-merchant: an HVAC contractor, existing depositor at ABC Community Bank, onboarding into the PayFac program through AirConPro in Flow 1. The pre-filled onboarding form reflects a real product point — existing depositors already have verified data on file, so onboarding is a frictionless upgrade rather than a cold KYB form. That frictionlessness is itself a reason for a business to bank there.

**Mr. Arnold Freeze** is the end consumer — the homeowner getting a new AC unit installed, who shows up by name at the checkout moment and on all ledger records. He makes a transaction-level payment decision (card or financing) that is entirely distinct from CoolAir HVAC's business-level onboarding decision. Don't conflate the two.

### What was built

- **Product offering page** (`/`) — bank-branded, pitches PayFac-as-a-Service and POS financing to prospective SaaS integration partners
- **Flow 1** — CoolAir HVAC's path through bank login → prefilled onboarding → underwriting stub (loading/approved/denied) → access to checkout
- **Flow 2** — Arnold Freeze's checkout inside AirConPro: job/invoice screen → card path (Stripe Elements) or financing path (mocked credit decision) → ledger confirmation view
- **Integration spec** (`INTEGRATION_SPEC.md`) — full connector API surface: endpoints, request/response shapes, auth model, sequence diagrams, production design notes
- **Kiro session hook** (`kiro-session.log`) — append-only JSONL log of decisions and milestones captured during the build

---

## APIs used and how they serve the product

### Stripe (test mode) — card payment path

Stripe is used for the card path in Flow 2a. A server-side API route (`/api/stripe/create-payment-intent`) creates a test-mode PaymentIntent and returns a `clientSecret`. The frontend mounts Stripe Elements using that secret, configured with Stripe's Appearance API to match AirConPro's own color scheme and typography rather than Stripe's defaults.

**Why Stripe specifically:** it's the fastest path to a real, working card integration without building custom card-entry UI. The Appearance API lets the Elements component blend into AirConPro's interface so it doesn't look like an obvious third-party widget — which matters here because the bank being invisible to the end consumer is part of the story. Using Stripe also means the test decline cards (e.g., `4000 0000 0000 9995` for insufficient funds) surface real, Stripe-generated error messages rather than mocked strings. That's meaningful — a demo that only ever shows success isn't demonstrating error handling. The assignment explicitly notes external API integration is optional; it's included here because it's cheap to do well and it's one of the few genuinely working integrations in the demo rather than a stub.

**Stripe key scoping:** the secret key in `.env.local` is a restricted test-mode key scoped to Payment Intents only. The publishable key is exposed to the client via `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` as intended by Stripe's architecture.

### Mocked API routes — underwriting and financing

Two mocked endpoints simulate backend systems the bank would actually own:

- `/api/underwriting` — sub-merchant underwriting decision (2.5s simulated delay, returns approved or denied with limits and linked account)
- `/api/financing/decision` — consumer credit decision (2.5s simulated delay, returns approved with loan terms or denied with card fallback)

Both are fake-working: the loading states and delays are real, the responses are stubbed JSON. Both support a denied outcome — a real underwriting or credit decision isn't guaranteed positive, and surfacing the denial path is evidence of edge-case thinking, not just happy-path demos.

---

## How to run it locally

**Prerequisites:** Node.js 18+, npm

```bash
git clone https://github.com/jonezy220/Nymbus-CJones.git
cd Nymbus-CJones
npm install
```

Create `.env.local` in the project root:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=rk_test_...
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo walkthrough:**

1. Start at `/` — product offering page. Click **Get Started**.
2. `/login` — submit any credentials (no real auth). Proceeds to onboarding.
3. `/onboarding` — CoolAir HVAC's data is pre-filled. Click **Submit application**.
4. `/underwriting` — watch the loading state resolve to **Approved**. Click **Start accepting payments**.
5. `/checkout` — Arnold Freeze's $8,000 AC job. Choose a payment path:
   - **Card:** use test card `4242 4242 4242 4242` (success) or `4000 0000 0000 9995` (insufficient funds decline). Any future expiry, any 3-digit CVC.
   - **Financing:** submit the application, watch the decision resolve to Approved, click **Accept & Finalize**.
6. `/confirmation` — two-panel ledger view. Both paths land here.

**Note on the checkout gate:** `/checkout` and all sub-routes require the `approvalStatus` cookie set during the underwriting step. Navigating directly to `/checkout` without completing Flow 1 redirects to `/`. This is enforced server-side in `proxy.ts`.

**Live demo:** [https://nymbus-cjones.vercel.app](https://nymbus-cjones.vercel.app)

---

## Product decisions and reasoning

### Spec artifacts and product thinking

`KIRO_STARTING_BRIEF.md` in the repo root is the exact, unedited seed prompt used to initiate the build — the full product brief before any code existed. It's the evidence of the product thinking that preceded the implementation.

`FEATURE_SPEC.md` is a comprehensive requirements and task breakdown document written requirements-first before any code was touched, covering entities, flows, API surface, design system rules, and implementation order. It was written as a custom document using the file-write tool, not generated through the `/plan` mechanism.

`PLANNING_AGENT_OUTPUT.md` is the verbatim output of Kiro's Planning Agent, invoked to reflect on and formalize the already-built architecture — the two-flow structure, the connector API surface, and the PayFac-as-a-Service reframe. It is a genuine planning agent artifact, distinct from `FEATURE_SPEC.md`.

### The PayFac-as-a-Service reframe: funds-native vs. reconciliation-after-the-fact

The central product decision is architectural: keep funds on the bank's own ledger from the first dollar rather than routing through an intermediary processor and reconciling afterward. In the traditional model, a third-party PayFac sits between the SaaS platform and the sponsor bank — the bank sees a net settlement, not individual transactions, and has no real-time view into what's moving. In this model, the bank is the PayFac. Every card transaction and every loan disbursement posts directly to the bank's core ledger with a reference back to the originating job. The confirmation view makes this visible: two panels, one event, one system of record, nothing to reconcile.

### Why financing was added as a second transaction type

Financing isn't just an additional feature — it changes the nature of what the bank is doing in the relationship. A card payment is a settlement: money moves, the relationship is transactional. A financed purchase is a loan origination: the bank disburses funds to the merchant and holds a receivable against the consumer. For a large-ticket service business like an HVAC contractor, the ability to offer embedded point-of-sale financing at the moment of job close meaningfully increases the bank's share of that merchant's financial life — and it's the same ledger entry, same connector, same integration. The marginal cost to AirConPro of offering financing is near zero once the card path is wired. That's the argument for including it.

### Why underwriting and credit decisioning are stubbed

Both stubs fake-work — they call real API routes, simulate meaningful delay, and return structured responses — but the underlying decisions are hardcoded. Real KYB/KYC underwriting and ability-to-repay assessment involve third-party data providers (Experian, LexisNexis, SentiLink for identity; bureau pulls for credit), compliance logic that varies by state, and latency that can range from seconds to minutes. Building real integrations against those systems is days of work and outside the scope of a demo. The stubs are honest about what they are: the shape of the integration is correct, the API contract is documented in `INTEGRATION_SPEC.md`, and the denial paths are implemented so the demo doesn't pretend every application auto-approves.

### The checkout redirect bug and fix

The original gate on `/checkout` used a `useEffect` hook reading from `sessionStorage`: if `approvalStatus` wasn't set, call `router.replace("/")`. This fails in a specific and important way: Next.js App Router pre-renders the page HTML on the server before JavaScript hydrates on the client. The SSR output contains the full job card — Arnold Freeze's name, the $8,000 total, the payment options — and that HTML is delivered to the browser before the `useEffect` fires. A user navigating directly to `/checkout` without completing Flow 1 briefly sees the protected content before being redirected.

The fix is to move the gate server-side. In Next.js 16, that means `proxy.ts` (renamed from `middleware.ts` in Next.js 16's API). The proxy function reads an `approvalStatus` cookie — set by the underwriting page on approval — and issues a `307` redirect before any HTML is generated. Verified: `curl -D - http://localhost:3000/checkout` with no cookie returns `HTTP/1.1 307` and `location: /`. With the cookie, it returns `200`.

The broader lesson: any demo with a meaningful flow gate needs the gate enforced at the layer that actually controls request handling, not in client JavaScript that runs after the fact.

### The Cash App Pay bug: automatic_payment_methods pulling in unwanted payment types

The `create-payment-intent` route initially used `automatic_payment_methods: { enabled: true }`, which tells Stripe to enable every payment method the account is eligible for — including Cash App Pay, Affirm, and Klarna alongside Card. Stripe's Payment Element then defaulted to Cash App Pay as the selected tab, meaning card input fields were never visible on page load without manually switching tabs.

This was diagnosed by ruling out several false leads in sequence: the API route returning a valid `clientSecret` was confirmed via console diagnostics (HTTP 200, valid response body, multiple times). The publishable key was confirmed baked into the client bundle by searching the production JS chunks. Browser caching was ruled out via hard reload. The breakthrough came from direct DOM inspection: a real, correctly-sized Stripe iframe (406×245px) was mounting and rendering — the integration was working, but showing the wrong payment method's panel.

Fixed by changing `automatic_payment_methods: { enabled: true }` to `payment_method_types: ["card"]` server-side. The demo is specifically about the card path with documented test cards — there's no reason to offer Cash App Pay, Affirm, or Klarna. After the fix, the PaymentIntent only accepts card, and Stripe Elements renders the card number/expiry/CVC fields immediately on load with no tab switching.

### The confirmation guard: preventing fabricated ledger records from direct navigation

`/confirmation` could be reached by navigating directly — with no prior transaction, no query param, nothing in sessionStorage — and it would render a fully-formed, timestamped "Transaction confirmed" record with a real-looking ledger entry ID for a transaction that never happened. This undercuts the demo's own thesis: trust the ledger because it's the single source of truth. A confirmation view that fabricates plausible records when nothing real backs them is the opposite of what it's supposed to demonstrate.

Fixed with the same server-side gate pattern as `/checkout`: a `paymentComplete` cookie (value `"card"` or `"financed"`) is set by the card success path and the financing accept path at the moment of real completion. `proxy.ts` checks for this cookie on `/confirmation` before any HTML is generated. Direct navigation without a completed transaction hits the gate and gets a clean 307 redirect to `/`, not a fabricated confirmation. The query param alone (`?type=card`) cannot bypass the gate — the cookie must be present.

### The Kiro session hook — and its honest limitations

The hook (`lib/session-log.ts`) is an append-only JSONL logger that runs server-side, exposed through four helpers: `logPrompt`, `logDecision`, `logIteration`, `logMilestone`. It captures what actually happened during the build when invoked from API routes.

The honest limitation: the hook was wired into the three API routes but not called from the UI build tasks (Tasks 5–12). Those were pure file-write operations with no server-side execution, so the log went quiet after the initial API testing. A back-fill of reconstructed entries was generated and then removed — a disclosed reconstruction isn't real-time capture, and the assignment is explicit on that point. What remains in `kiro-session.log` are the 4 genuine API test entries from early integration testing, plus 1 real entry documenting the redirect bug fix as it was diagnosed and resolved.

In retrospect, the right approach is to call `logDecision` and `logMilestone` from real code at every meaningful step — not just from API routes, but from a build script or CI hook that fires as each task completes. Treating the hook as a one-time setup step rather than an ongoing discipline is the mistake made here. The Cash App Pay fix and the confirmation guard fix (documented above) weren't captured in `kiro-session.log` either — the wiring gap already disclosed wasn't fully closed even after being identified. Those fixes are documented in this README rather than backfilled into the log, which keeps the log trustworthy as exactly what it claims to be.

---

## What I'd change or add with more time

### Multi-bank routing and concentration risk

The current connector is single-bank: every transaction routes to ABC Community Bank. That's fine for a demo, but it's a real OCC concentration-risk problem at platform scale. If ABC Community Bank is frozen, fails, or has a regulatory hold on outbound payments, the entire connector goes down with it. A production version of this connector would need to support routing across more than one sponsor or partner bank — so the platform can shift volume if one bank becomes unavailable. This is a real concern that regulators have raised with PayFac platforms operating at scale, and it's the first architectural addition a production build would need.

### Async webhook architecture

The underwriting and financing endpoints are synchronous: the client polls and waits for a response. That works for a 2.5-second mock delay, but real underwriting and credit decisioning can take minutes (manual review, bureau pulls, identity verification queues). A production connector would use an event-driven architecture: the client POSTs an application, receives a `202 Accepted` with a `requestId`, and the bank POSTs a webhook to the SaaS platform's registered callback URL when the decision is ready. The integration spec documents this as a known gap.

### Real KYB and ability-to-repay underwriting

The stubs are honest about what they are, but they don't demonstrate integration with the data providers that would actually power these decisions — Experian or LexisNexis for business identity, bureau pulls for consumer credit, SentiLink or similar for synthetic identity risk. Wiring a real KYB provider would change the underwriting flow from a loading spinner to something that actually shows verification steps, handles edge cases (thin-file businesses, mismatched addresses), and surfaces real denial reasons rather than a generic string.

### Real-time fraud scoring on the financing decision

The current financing decision is binary: approved or denied, based on nothing. A production consumer lending decision would include real-time fraud scoring on the application — device fingerprinting, velocity checks, identity consistency between the name on the application and the card/account on file. That layer sits between the application submission and the credit decision, and it's invisible in this demo.

### Session hook wired throughout from Task 1

As noted above: `logDecision` and `logMilestone` should be called from real code at every meaningful step of the build — not just from API routes, and not as an afterthought. The right pattern is a build-time hook (a script or pre-commit action) that fires as tasks complete, not a server-side logger that only activates when API routes handle requests.

---

## Builder context

This demo was built by someone with 15+ years of direct payments and banking product experience.

That includes: enterprise payments and real-time rails product leadership at a top-10 US bank; embedded BaaS and multi-issuer card program product leadership at a major payments company; product leadership at a hypergrowth payments gateway.

Currently works independently, advising vertical SaaS platforms and PE-backed operators on embedded payments strategy and PayFac-as-a-Service models — helping platforms evaluate whether to build, buy, or partner for payments infrastructure, and helping banks structure the commercial and technical terms of platform partnerships.

The PayFac-as-a-Service reframe at the center of this demo — the idea that a community bank should be the PayFac rather than a sponsor bank behind someone else's PayFac — is not a hypothetical fintech concept selected for the exercise. It is the exact problem space worked in professionally. The entities, the flows, the ledger confirmation logic, the underwriting-as-a-depositor-upgrade point, the concentration-risk concern in the "what's next" section — these reflect real patterns from real platform deployments, not a first-pass approximation of how payments infrastructure works.

---

## Project structure

```
Nymbus-CJones/
├── app/
│   ├── page.tsx                          # / — Product offering page (bank-branded)
│   ├── login/page.tsx                    # /login — Flow 1a
│   ├── onboarding/page.tsx               # /onboarding — Flow 1b (prefilled)
│   ├── underwriting/page.tsx             # /underwriting — Flow 1c
│   ├── checkout/
│   │   ├── page.tsx                      # /checkout — Flow 2 job screen (AirConPro)
│   │   ├── card/page.tsx                 # /checkout/card — Stripe Elements
│   │   └── financing/page.tsx            # /checkout/financing — mocked credit decision
│   ├── confirmation/page.tsx             # /confirmation — ledger + confirmation view
│   └── api/
│       ├── underwriting/route.ts         # Underwriting stub
│       ├── financing/decision/route.ts   # Financing decision stub
│       └── stripe/create-payment-intent/ # Stripe PaymentIntent
├── lib/
│   ├── session-log.ts                    # Kiro session hook
│   ├── mock-data.ts                      # Fixtures: CoolAir HVAC, Arnold Freeze
│   └── stripe.ts                         # Stripe server-side client (lazy getter)
├── proxy.ts                              # Next.js 16 server-side route gate
├── KIRO_STARTING_BRIEF.md                # Seed prompt — the exact brief used to kick off the spec and build, before any code existed. Read this first for the product thinking that preceded everything.
├── PLANNING_AGENT_OUTPUT.md              # Kiro Planning Agent output — formal architecture reflection covering the two-flow structure, connector API surface, and key engineering decisions. Generated by the Planning Agent, distinct from FEATURE_SPEC.md.
├── FEATURE_SPEC.md                       # Requirements spec — comprehensive requirements, entities, flows, API surface, design system rules, and task breakdown written before any code was touched
├── INTEGRATION_SPEC.md                   # Connector API spec — full endpoint documentation with request/response shapes, auth model, sequence diagrams, and production design notes
├── kiro-session.log                      # Build session log (JSONL, genuine entries only)
└── README.md                             # This file
```

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Fonts | DM Sans + Inter (Google Fonts), Geist Mono (next/font) |
| Payments | Stripe test mode — `@stripe/stripe-js`, `@stripe/react-stripe-js` |
| State | `sessionStorage` + cookie (approval gate) |
| Deploy | Vercel — `jonezy220/Nymbus-CJones` |
