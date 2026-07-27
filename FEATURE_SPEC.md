# Feature Spec: ABC Community Bank — PayFac-as-a-Service Demo
**Project:** Nymbus-CJones  
**Date:** 2026-07-27  
**Author:** C. Jones  
**Status:** Approved — ready to build

---

## 1. Purpose and Framing

This demo shows how a community bank can win back SMB deposits and lending relationships by becoming the payment facilitator for the software small businesses already use — instead of sitting behind a third-party processor at arm's length.

The architecture being demonstrated: a Nymbus-built connector layer lets a SaaS platform (AirConPro) plug directly into ABC Community Bank's own PayFac-as-a-Service capability. Funds flow native to the bank's ledger from the start. The SaaS platform's transaction record and the bank's ledger entry are the same event — there is nothing to reconcile, only something to confirm.

This is intended as a product launch package, not just a UI prototype:
- A product offering page (what the bank offers integration partners)
- An integration spec (how a partner engineers against the connector)
- A working proof of concept (the connector in action, both flows)

---

## 2. Entities

| Entity | Role | Notes |
|--------|------|-------|
| **ABC Community Bank** | The bank offering PayFac-as-a-Service + POS financing | Fictional community bank/credit union. Owns the connector layer via Nymbus. The system of record for all funds. |
| **AirConPro** | SaaS platform (vertical: HVAC) | Job management, invoicing, scheduling software. Integrates the connector once; all contractor customers inherit embedded payments. AirConPro is never bank-branded — the bank is invisible at the checkout moment. |
| **CoolAir HVAC** | Sub-merchant / HVAC contractor | Existing depositor at ABC Community Bank. Onboards as a PayFac sub-merchant in Flow 1. Processes the $8,000 job in Flow 2. |
| **Mr. Arnold Freeze** | End consumer / homeowner | Getting a new central AC unit installed. Appears by name at checkout and on all transaction/ledger records. Not an entity that onboards — purely a checkout actor. |

---

## 3. Design System Rules

### Bank-side screens
Applies to: product offering page, Flow 1 (login, onboarding, underwriting), ledger/confirmation view.

| Token | Value |
|-------|-------|
| Heading / display font | DM Sans |
| Body / UI font | Inter |
| Code / data font | Geist Mono |
| Primary action | `#2569EC` |
| Primary hover | `#1E54BD` |
| Primary pressed | `#163F8F` |
| Theme | Dark by default |
| Brand reference | [Nymbus Design System](https://nymbus-joy.nymbus.com/design-system) |

### AirConPro-side screens
Applies to: Flow 2 checkout, job/invoice screen, Stripe payment element.

- No Nymbus or ABC Community Bank branding
- Independent visual identity (clean, neutral SaaS aesthetic)
- Stripe Appearance API should blend into AirConPro's own UI, not look like a generic Stripe page
- The bank being invisible to the end consumer is a feature, not an oversight

---

## 4. Routes / Page Map

```
/                          → Product offering page (bank-branded)
/login                     → Flow 1a: Bank login (stylized, no real auth)
/onboarding                → Flow 1b: CoolAir HVAC prefilled onboarding form
/underwriting              → Flow 1c: Underwriting stub (Approved | Denied)
/checkout                  → Flow 2: AirConPro job screen — Arnold Freeze, $8,000
/checkout/card             → Flow 2a: Stripe card payment path
/checkout/financing        → Flow 2b: Financing decision path
/confirmation              → Ledger + confirmation view (card or financed)
```

Entry point for Flow 1: `/` → `/login` → `/onboarding` → `/underwriting`  
Entry point for Flow 2: `/checkout` (only reachable post-approval from Flow 1)  
Both flows terminate at `/confirmation`

---

## 5. Screen-by-Screen Requirements

### 5.1 Product Offering Page (`/`)
**Brand:** ABC Community Bank (full Nymbus design system)  
**Purpose:** Pitch the PayFac-as-a-Service capability to prospective SaaS integration partners like AirConPro.

**Content blocks (single page, no scroll required on large screen):**
1. Bank name + tagline — positioned as a banking product, not a fintech product
2. Two capability cards:
   - **PayFac-as-a-Service** — embedded payments, funds native to bank ledger, no third-party processor in the middle
   - **Point-of-Sale Financing** — embedded lending at checkout, same ledger entry, no separate origination system
3. Value proposition copy — framed for the SaaS partner's engineering/product team, not for the end consumer
4. **"Get Started" CTA** — primary button, links to `/login`, launches Flow 1

**Constraints:**
- One screen. Not a marketing site.
- No navigation bar needed beyond the bank logo.
- Must feel like a real bank product page, not a generic SaaS landing page.

---

### 5.2 Flow 1a — Bank Login (`/login`)
**Brand:** ABC Community Bank  
**Purpose:** Stylized login step. Not real authentication — submitting any credentials proceeds to `/onboarding`.

**Requirements:**
- Bank logo / name visible
- Email + Password fields (not validated, not stored)
- "Log in" button → navigates to `/onboarding`
- Optional: "Forgot password?" link (dead, cosmetic only)
- No error states required (this is a stylized walkthrough step)

---

### 5.3 Flow 1b — Merchant Onboarding (`/onboarding`)
**Brand:** ABC Community Bank  
**Purpose:** CoolAir HVAC's PayFac sub-merchant application, pre-filled because they're already a depositor.

**Pre-filled fields (read from mock data, not from a real database):**

| Field | Value |
|-------|-------|
| Business Legal Name | CoolAir HVAC LLC |
| DBA | CoolAir HVAC |
| Business Type | LLC |
| EIN | 47-2831906 |
| Business Address | 214 Thornfield Rd, Greenville, SC 29601 |
| Phone | (864) 555-0192 |
| Owner Name | Derek Sutton |
| Owner Title | Owner |
| Owner DOB | 1981-04-12 |
| Owner SSN (masked) | ***-**-7741 |
| Bank Account (linked) | ABC Community Bank — Checking ••••3847 |
| Avg Monthly Volume | $24,000 |
| Avg Transaction Size | $1,200 |

**UI requirements:**
- Fields appear pre-filled, not editable (display-only or disabled inputs — visually looks "already known")
- Callout / banner: "Your business information is pre-filled from your existing ABC Community Bank account."
- "Submit Application" button → navigates to `/underwriting`
- This is a real product point worth surfacing in copy: existing depositors get a frictionless upgrade, which is itself a reason to bank here.

---

### 5.4 Flow 1c — Underwriting (`/underwriting`)
**Brand:** ABC Community Bank  
**Purpose:** Stubbed underwriting decision. Fake-working: real-feeling API call with loading state and delay.

**States:**

#### Loading state (auto-transitions after 2.5s delay)
- Animated spinner or progress indicator
- Copy: "Reviewing your application…" or similar
- This is the underwriting API call in progress

#### Approved state (primary path for CoolAir HVAC walkthrough)
- Clear visual: green indicator, "Application Approved"
- CoolAir HVAC is approved as a sub-merchant of ABC Community Bank's PayFac program
- Shows: Merchant ID, approved processing limits, linked bank account
- CTA: "Start Accepting Payments" → navigates to `/checkout`

#### Denied state (must be implemented, not just the approval path)
- Clear visual: red/amber indicator, "Application Not Approved"
- Reason copy (generic): "Based on our review, we're unable to approve your application at this time."
- CTA: "Contact Support" (dead link is fine) + "Return to Home"
- The demo walkthrough always shows Approved for CoolAir HVAC; Denied is a real state the stub supports

**Implementation note:** The decision comes from a mocked API route (`/api/underwriting`) that returns a stubbed JSON response after a server-side delay. Do not hardcode the decision in the component — call the endpoint so the loading state is real.

---

### 5.5 Flow 2 — AirConPro Checkout (`/checkout`)
**Brand:** AirConPro (no bank branding)  
**Purpose:** Job/invoice screen showing Mr. Arnold Freeze's $8,000 AC job, closed and ready for payment.

**Only reachable if CoolAir HVAC completed Flow 1 and received Approved status.** If state is missing, redirect to `/`.

**Job card content:**

| Field | Value |
|-------|-------|
| Job # | JOB-2024-0847 |
| Customer | Mr. Arnold Freeze |
| Address | 88 Glacier Point Ln, Greenville, SC 29607 |
| Service | Central AC Installation — Carrier 3-Ton Unit |
| Technician | Derek Sutton |
| Date | Today's date (dynamic) |
| Subtotal | $7,200.00 |
| Tax (11.11%) | $800.00 |
| **Total** | **$8,000.00** |

**Payment options presented to Arnold:**
1. **Pay in Full — Card** → navigates to `/checkout/card`
2. **Apply for Financing** — "Finance through ABC Community Bank" → navigates to `/checkout/financing`

**UI notes:**
- AirConPro-branded interface (thin — job card is enough context)
- The financing option can carry a small "Powered by ABC Community Bank" attribution in fine print — this is a real pattern in embedded finance and it's appropriate here, since it's a distinct branded financial product the consumer is being offered
- No back navigation required from here

---

### 5.6 Flow 2a — Card Payment (`/checkout/card`)
**Brand:** AirConPro UI wrapper + Stripe Elements (themed to match)  
**Purpose:** Real Stripe test-mode card payment, styled with the Stripe Appearance API.

**Requirements:**
- Stripe Elements Payment Element, mounted in an AirConPro-styled container
- Appearance API configuration: match AirConPro's color scheme, font, border radius — not Stripe's defaults
- Amount displayed: $8,000.00, for CoolAir HVAC, Job #JOB-2024-0847, Mr. Arnold Freeze
- On successful payment → navigate to `/confirmation?type=card`
- **Test decline card:** surface Stripe's `4000 0000 0000 9995` (insufficient funds) in a visible test-card helper panel so the demo can show a real decline state with a real Stripe error message
- Environment variable: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (placeholder until key is provided)
- API route: `/api/stripe/create-payment-intent` — creates a test-mode PaymentIntent for $800,000 (cents), returns `client_secret`

**Stripe Appearance API minimum config:**
```js
appearance: {
  theme: 'flat',
  variables: {
    colorPrimary: '<AirConPro primary>',
    colorBackground: '<AirConPro card bg>',
    colorText: '<AirConPro text>',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '6px',
  }
}
```

---

### 5.7 Flow 2b — Financing Path (`/checkout/financing`)
**Brand:** AirConPro UI wrapper + ABC Community Bank financing module  
**Purpose:** Mocked financing decision. Fake-working: same treatment as underwriting stub.

**Financing terms (mock):**

| Field | Value |
|-------|-------|
| Loan Amount | $8,000.00 |
| Term | 24 months |
| APR | 9.99% |
| Monthly Payment | $366.69 |
| Lender | ABC Community Bank |

**States:**

#### Application form
- Name (pre-filled: Arnold Freeze), Amount ($8,000, read-only), optional income field
- "Apply for Financing" button → triggers mocked API call

#### Loading state (2.5s delay)
- "Reviewing your application…" spinner
- API call to `/api/financing/decision`

#### Approved state (primary path)
- Green indicator, loan terms displayed
- CTA: "Accept & Finalize" → navigates to `/confirmation?type=financed`

#### Denied state (must be implemented)
- "We're unable to approve financing at this time."
- Fallback CTA: **"Pay by Card Instead"** → navigates to `/checkout/card`
- This is the explicit nudge back to the card path — real product behavior, not a dead end

**API route:** `/api/financing/decision` — returns stubbed JSON after delay:
```json
{
  "decision": "approved",
  "loanAmount": 8000.00,
  "term": 24,
  "apr": 9.99,
  "monthlyPayment": 366.69,
  "lender": "ABC Community Bank",
  "loanId": "LN-2024-003847"
}
```

---

### 5.8 Ledger + Confirmation View (`/confirmation`)
**Brand:** Bank-side (Nymbus design system, Geist Mono for data fields)  
**Purpose:** The most important screen. Shows both sides of the transaction — AirConPro's record and the bank's ledger entry — proving they're the same event.

**Query param:** `?type=card` or `?type=financed` (drives which ledger entry type is shown)

**Left panel — AirConPro Transaction Record:**

| Field | Value |
|-------|-------|
| Platform | AirConPro |
| Job # | JOB-2024-0847 |
| Merchant | CoolAir HVAC LLC |
| Customer | Mr. Arnold Freeze |
| Amount | $8,000.00 |
| Type | Card Settlement (or Financed Disbursement) |
| Status | Settled (or Disbursed) |
| Timestamp | Dynamic |

**Right panel — ABC Community Bank Ledger Entry:**

| Field | Value |
|-------|-------|
| System | ABC Community Bank Core Ledger |
| Ledger Entry | LE-[dynamic ID] |
| Merchant Account | CoolAir HVAC LLC — ••••3847 |
| Amount | $8,000.00 |
| Entry Type | Card Settlement (or Loan Disbursement) |
| Reference | JOB-2024-0847 |
| Status | Posted |
| Timestamp | Same as left panel |

**Match indicator (center / between panels):**
- Visual connector or badge: "✓ Matched — Single System of Record"
- Reinforces: same event, no reconciliation required

**Tagline or footer copy:**
> "Because ABC Community Bank was the payment facilitator from the start, there is no external record to reconcile — only a ledger entry to confirm."

**Requirements:**
- Both panels must render correctly for both `type=card` and `type=financed`
- Entry type label changes based on `type` param
- Geist Mono for all data field values
- "Return to AirConPro" button → `/checkout`
- "View Full Ledger" button → dead/cosmetic, but present

---

## 6. API Routes (Mocked)

All routes live under `/app/api/` (Next.js App Router route handlers).

| Route | Method | Purpose | Delay |
|-------|--------|---------|-------|
| `/api/underwriting` | POST | Sub-merchant underwriting decision | 2.5s |
| `/api/financing/decision` | POST | Consumer financing decision | 2.5s |
| `/api/stripe/create-payment-intent` | POST | Create Stripe test-mode PaymentIntent | None (real Stripe call) |

### `/api/underwriting` — Request/Response
```json
// Request
{ "merchantId": "coolair-hvac-001" }

// Response — Approved
{
  "decision": "approved",
  "merchantId": "coolair-hvac-001",
  "subMerchantId": "SM-2024-00847",
  "approvedLimits": {
    "dailyVolume": 50000,
    "perTransaction": 15000
  },
  "linkedAccount": "ABC Community Bank — Checking ••••3847"
}

// Response — Denied
{
  "decision": "denied",
  "reason": "Unable to verify business information",
  "merchantId": "coolair-hvac-001"
}
```

### `/api/financing/decision` — Request/Response
```json
// Request
{ "applicantName": "Arnold Freeze", "loanAmount": 8000, "jobId": "JOB-2024-0847" }

// Response — Approved
{
  "decision": "approved",
  "loanId": "LN-2024-003847",
  "loanAmount": 8000.00,
  "term": 24,
  "apr": 9.99,
  "monthlyPayment": 366.69,
  "lender": "ABC Community Bank"
}

// Response — Denied
{
  "decision": "denied",
  "reason": "Unable to approve financing at this time",
  "fallback": "card"
}
```

### `/api/stripe/create-payment-intent` — Request/Response
```json
// Request
{ "amount": 800000, "currency": "usd", "jobId": "JOB-2024-0847" }

// Response
{ "clientSecret": "pi_test_xxx_secret_xxx" }
```

---

## 7. State Management

No auth, no database, no multi-tenancy. State is held in:

- **`sessionStorage`** — `approvalStatus` (`"approved"` | `"denied"` | `null`) set after `/api/underwriting` resolves. Gate on `/checkout` reads this; missing or non-approved redirects to `/`.
- **`sessionStorage`** — `paymentType` (`"card"` | `"financed"`) set when navigating to `/confirmation`. Confirmation view reads this to select the correct panel content.
- No Redux, no Zustand, no Context required — sessionStorage is sufficient for a linear demo flow.

---

## 8. Kiro Session Hook

**File:** `lib/session-log.ts`  
**Output:** `kiro-session.log` (gitignored from prod deploy, committed to repo as a demo artifact)

**Purpose:** Log prompts, decisions, and iterations as the build happens — tells the story of the build in real time, not reconstructed afterward. Required deliverable, separate from the app.

**Log schema (append-only JSONL):**
```json
{
  "timestamp": "2026-07-27T14:11:00Z",
  "type": "prompt" | "decision" | "iteration" | "milestone",
  "context": "string — what screen/component/route is being worked on",
  "content": "string — the prompt text, decision rationale, or iteration note",
  "tags": ["string"]
}
```

**Helper functions to export:**
- `logPrompt(context, content, tags?)` — log a prompt
- `logDecision(context, content, tags?)` — log a product/technical decision
- `logIteration(context, content, tags?)` — log a build iteration
- `logMilestone(context, content, tags?)` — log a completed deliverable

---

## 9. Project Structure

```
Nymbus-CJones/
├── app/
│   ├── page.tsx                    # / — Product offering page
│   ├── login/page.tsx              # /login — Flow 1a
│   ├── onboarding/page.tsx         # /onboarding — Flow 1b
│   ├── underwriting/page.tsx       # /underwriting — Flow 1c
│   ├── checkout/
│   │   ├── page.tsx                # /checkout — Flow 2 job screen
│   │   ├── card/page.tsx           # /checkout/card — Flow 2a
│   │   └── financing/page.tsx      # /checkout/financing — Flow 2b
│   ├── confirmation/page.tsx       # /confirmation — Ledger view
│   └── api/
│       ├── underwriting/route.ts
│       ├── financing/
│       │   └── decision/route.ts
│       └── stripe/
│           └── create-payment-intent/route.ts
├── components/
│   ├── bank/                       # Bank-branded shared components
│   │   ├── BankLayout.tsx
│   │   ├── PrimaryButton.tsx
│   │   └── DataField.tsx           # Geist Mono data display
│   ├── airconpro/                  # AirConPro-branded components
│   │   ├── AirConProLayout.tsx
│   │   └── JobCard.tsx
│   └── shared/
│       └── LoadingSpinner.tsx
├── lib/
│   ├── session-log.ts              # Kiro session hook
│   ├── mock-data.ts                # CoolAir HVAC, Arnold Freeze, job data
│   └── stripe.ts                  # Stripe server-side client
├── styles/
│   └── globals.css                 # Design tokens, font imports
├── public/
├── kiro-session.log                # Auto-generated session log
├── FEATURE_SPEC.md                 # This document
├── INTEGRATION_SPEC.md             # Connector API spec (Task 4)
├── README.md                       # (Task 13)
├── .env.local                      # NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 10. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 14+ (App Router) | Requirement |
| Language | TypeScript | Standard for Next.js projects |
| Styling | Tailwind CSS | Fast token-based styling, pairs well with design system tokens |
| Fonts | Google Fonts (DM Sans, Inter) + Vercel Geist Mono | Per Nymbus design system spec |
| Payments | Stripe (test mode) | Real integration, cheap, lets demo effort go to the differentiated ledger/confirmation logic |
| State | sessionStorage | Sufficient for a linear, no-auth demo flow |
| Deploy | Vercel | Repo: `jonezy220/Nymbus-CJones` |

---

## 11. Prioritization (if time is short)

Per brief, in order:

1. Confirmation view — never cut
2. Integration spec — write it in markdown even if app build gets squeezed
3. Product offering page — one screen, cheap
4. Onboarding gate (Flow 1)
5. Checkout with both paths (Flow 2)
6. Financing path can degrade to "shows decision and terms" without a fully wired second ledger entry if truly out of time

---

## 12. Out of Scope

- Real authentication or session management
- Real KYB / KYC integration
- Real bank ledger API
- Multi-tenancy or admin tooling
- Multiple merchants or multiple banks
- Webhook / event-driven architecture (noted as a future enhancement in README)
- Real ability-to-repay underwriting

---

## 13. Success Criteria

Someone unfamiliar with the concept should be able to:
1. Read the product offering page and understand what ABC Community Bank is offering AirConPro and why it matters
2. Follow Flow 1 and watch CoolAir HVAC onboard as a PayFac sub-merchant in under 60 seconds of demo time
3. Follow Flow 2 and watch either a card payment or a financed purchase go through for the $8,000 Arnold Freeze job
4. Land on the confirmation view and immediately understand why it matters: the bank was the payment facilitator from the start, so there is nothing to reconcile — only something to confirm

---

*End of Feature Spec*
