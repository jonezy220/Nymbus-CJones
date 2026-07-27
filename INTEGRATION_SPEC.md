# Connector API Integration Spec
## ABC Community Bank — PayFac-as-a-Service

**Version:** 1.0  
**Date:** 2026-07-27  
**Base URL (sandbox):** `https://your-demo.vercel.app/api`  
**Base URL (production):** TBD — issued per partner onboarding

---

## Overview

This document describes the connector API that a SaaS platform (e.g., AirConPro) integrates against to embed ABC Community Bank's PayFac-as-a-Service capability directly into its own product.

The connector has three functional areas:

| Area | What it does | When it runs |
|------|-------------|--------------|
| **Merchant Onboarding & Underwriting** | Registers a new sub-merchant and returns an underwriting decision | Once per business, before any payments are processed |
| **Transaction Processing** | Initiates a card payment or a bank-financed purchase | Per transaction, at the checkout moment |
| **Ledger Confirmation** | Returns the bank's ledger entry matching a processed transaction | After settlement or disbursement |

The integration is intentionally thin. AirConPro calls three endpoints. The bank handles everything behind them — KYB verification, underwriting, card processing via PayFac rails, loan origination, ledger posting. The SaaS platform never touches a banking system directly.

---

## Authentication

> **Sandbox note:** The demo implementation does not enforce authentication on API routes. A production deployment would require the following.

All requests to the connector API must include a partner API key in the request header:

```
Authorization: Bearer <PARTNER_API_KEY>
```

Partner API keys are issued during the bank's partner onboarding process. Keys are scoped per partner (e.g., one key for AirConPro's entire platform — not per merchant). Sub-merchant identity is established via `merchantId` in the request body, not via separate credentials.

---

## Endpoints

### 1. Merchant Onboarding & Underwriting

#### `POST /api/underwriting`

Submits a sub-merchant application and returns an underwriting decision. This is a synchronous call in the demo (with a simulated delay representing real review time). In production, this would be an asynchronous operation with a webhook callback.

**When to call:** Once per merchant, triggered when the merchant completes the onboarding form inside the SaaS platform. AirConPro calls this on behalf of CoolAir HVAC; the result is stored by the bank and referenced on all subsequent transactions for that merchant.

**Request**

```http
POST /api/underwriting
Content-Type: application/json
Authorization: Bearer <PARTNER_API_KEY>
```

```json
{
  "merchantId": "coolair-hvac-001",
  "forceDecision": "approved"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `merchantId` | string | Yes | Stable identifier for the merchant within the SaaS platform. Should be unique per business, not per user. |
| `forceDecision` | string | No | Sandbox only. Pass `"denied"` to force a denial response for demo purposes. Omit for the default approved path. |

**Response — Approved (HTTP 200)**

```json
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
```

| Field | Type | Description |
|-------|------|-------------|
| `decision` | `"approved"` \| `"denied"` | The underwriting outcome. |
| `merchantId` | string | Echoed from request. |
| `subMerchantId` | string | Bank-assigned sub-merchant identifier. Store this — it is the reference on all future transactions for this merchant. |
| `approvedLimits.dailyVolume` | number | Maximum daily processing volume in USD. |
| `approvedLimits.perTransaction` | number | Maximum single transaction amount in USD. |
| `linkedAccount` | string | The bank account funds will settle into. |

**Response — Denied (HTTP 200)**

```json
{
  "decision": "denied",
  "reason": "Unable to verify business information",
  "merchantId": "coolair-hvac-001"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `decision` | `"denied"` | Underwriting outcome. |
| `reason` | string | Human-readable denial reason. Do not display this verbatim to the end user without UX review — surface a friendlier message. |
| `merchantId` | string | Echoed from request. |

**Behavior notes:**
- The demo simulates a 2.5-second processing delay before responding. Surface a loading state during this time.
- A denied merchant cannot process transactions. The SaaS platform should block payment initiation and surface the fallback (e.g., "Contact support" or "Try again later").
- In production, underwriting for an existing bank depositor (like CoolAir HVAC) resolves faster because the bank already holds verified business data. The demo reflects this with a fast approval path for known depositors.

---

### 2. Transaction Processing

Two sub-endpoints, one per payment type. These are independent decisions — a merchant's underwriting approval (above) is a one-time business-level gate; each transaction calls the appropriate payment endpoint at the moment of checkout.

---

#### `POST /api/stripe/create-payment-intent`

Creates a Stripe PaymentIntent for a card-based payment. Returns a `clientSecret` that the SaaS platform's frontend uses to mount Stripe Elements and collect card details. The bank is the PayFac on the underlying Stripe account — funds settle directly to the merchant's linked bank account, not to a third-party processor's ledger.

**When to call:** When the consumer selects "Pay by Card" at checkout, before mounting the Stripe Elements UI. The `clientSecret` is single-use and tied to the specific transaction amount.

**Request**

```http
POST /api/stripe/create-payment-intent
Content-Type: application/json
Authorization: Bearer <PARTNER_API_KEY>
```

```json
{
  "amount": 800000,
  "currency": "usd",
  "jobId": "JOB-2024-0847"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Transaction amount **in cents**. $8,000.00 → `800000`. |
| `currency` | string | No | ISO 4217 currency code. Defaults to `"usd"`. |
| `jobId` | string | No | SaaS platform's job or invoice reference. Stored as PaymentIntent metadata and propagated to the ledger entry. |

**Response (HTTP 200)**

```json
{
  "clientSecret": "pi_3TxthEENN4Yp4lBx1HUm3AwU_secret_GPAZcBC20Cx79rKDsGOZ5uFrW"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `clientSecret` | string | Stripe PaymentIntent client secret. Pass this to `stripe.confirmPayment()` on the frontend. Never log or expose this value. |

**Frontend usage (Stripe Elements):**

```typescript
// 1. Fetch clientSecret from your backend
const { clientSecret } = await fetch("/api/stripe/create-payment-intent", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ amount: 800000, currency: "usd", jobId: "JOB-2024-0847" }),
}).then((r) => r.json());

// 2. Mount Stripe Elements
const elements = stripe.elements({
  clientSecret,
  appearance: {
    theme: "flat",
    variables: {
      colorPrimary: "#0F766E",       // AirConPro brand color
      colorBackground: "#FFFFFF",
      colorText: "#1A202C",
      fontFamily: "Inter, sans-serif",
      borderRadius: "6px",
    },
  },
});

// 3. Confirm payment on form submit
const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: { return_url: "https://your-app.com/confirmation?type=card" },
});
```

**Test card numbers (sandbox only):**

| Card Number | Behavior |
|-------------|----------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 9995` | Declined — insufficient funds |
| `4000 0000 0000 0002` | Declined — generic decline |

Use any future expiry date and any 3-digit CVC.

**Behavior notes:**
- In production, the PaymentIntent is created on the bank's Stripe Connect platform account, and funds flow to the sub-merchant's connected account (linked to the bank's own core ledger). In the demo, a test-mode PaymentIntent is created directly against the demo Stripe account.
- A real payment failure (e.g., insufficient funds) returns a Stripe error object. Surface the `error.message` to the user — do not swallow card errors silently.

---

#### `POST /api/financing/decision`

Submits a consumer financing application and returns a credit decision with loan terms. This is a transaction-level decision — it is distinct from the merchant's underwriting approval and involves the consumer, not the business.

**When to call:** When the consumer selects "Apply for Financing" at checkout and submits the application form.

**Request**

```http
POST /api/financing/decision
Content-Type: application/json
Authorization: Bearer <PARTNER_API_KEY>
```

```json
{
  "applicantName": "Arnold Freeze",
  "loanAmount": 8000,
  "jobId": "JOB-2024-0847",
  "forceDecision": "approved"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `applicantName` | string | Yes | Consumer's full name as entered on the application. |
| `loanAmount` | number | Yes | Requested loan amount in USD (not cents). $8,000.00 → `8000`. |
| `jobId` | string | No | SaaS platform job reference. Tied to the ledger entry on disbursement. |
| `forceDecision` | string | No | Sandbox only. Pass `"denied"` to force a denial response. |

**Response — Approved (HTTP 200)**

```json
{
  "decision": "approved",
  "loanId": "LN-2024-003847",
  "loanAmount": 8000.00,
  "term": 24,
  "apr": 9.99,
  "monthlyPayment": 366.69,
  "lender": "ABC Community Bank"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `decision` | `"approved"` \| `"denied"` | Credit decision. |
| `loanId` | string | Bank-assigned loan identifier. Reference this on the ledger confirmation call. |
| `loanAmount` | number | Approved loan amount in USD. |
| `term` | number | Repayment term in months. |
| `apr` | number | Annual percentage rate as a decimal percentage (e.g., `9.99` = 9.99%). |
| `monthlyPayment` | number | Calculated monthly payment in USD. |
| `lender` | string | The originating lender. Always `"ABC Community Bank"` in this deployment. |

**Response — Denied (HTTP 200)**

```json
{
  "decision": "denied",
  "reason": "Unable to approve financing at this time",
  "fallback": "card"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `decision` | `"denied"` | Credit decision. |
| `reason` | string | Human-readable denial reason. |
| `fallback` | `"card"` | Suggested fallback payment method. Always surface this — a financing denial is not a checkout dead end. |

**Behavior notes:**
- The demo simulates a 2.5-second processing delay before responding. Surface a loading state.
- A denied financing application **must not end the checkout flow**. Surface the `fallback` value as a CTA: "Pay by Card Instead" → route to the card path.
- Loan disbursement (upon consumer acceptance of terms) goes directly to the merchant's bank account as a ledger entry. The consumer repays the bank directly; this is invisible to the SaaS platform.

---

### 3. Ledger Confirmation

#### `GET /api/ledger/entry?jobId=JOB-2024-0847&type=card`

> **Demo note:** This endpoint is not implemented as a live route in the demo. The confirmation view constructs the ledger entry from sessionStorage state and mock data. In production, this would be a real API call.

Returns the bank's ledger entry matching a completed transaction. This is the "single system of record" moment — the SaaS platform's transaction record and the bank's ledger entry are the same event.

**When to call:** After successful payment confirmation (card settled or financing accepted), to fetch the matching bank ledger entry for display.

**Request**

```http
GET /api/ledger/entry?jobId=JOB-2024-0847&type=card
Authorization: Bearer <PARTNER_API_KEY>
```

| Query Param | Type | Required | Description |
|-------------|------|----------|-------------|
| `jobId` | string | Yes | SaaS platform job reference used when initiating the transaction. |
| `type` | `"card"` \| `"financed"` | Yes | Payment type, determines the ledger entry format. |

**Response — Card Settlement (HTTP 200)**

```json
{
  "ledgerEntryId": "LE-20240847-C",
  "merchantAccount": "CoolAir HVAC LLC — ••••3847",
  "amount": 8000.00,
  "entryType": "card_settlement",
  "entryTypeLabel": "Card Settlement",
  "jobReference": "JOB-2024-0847",
  "status": "posted",
  "postedAt": "2026-07-27T19:03:00Z",
  "platform": "AirConPro",
  "customer": "Mr. Arnold Freeze"
}
```

**Response — Loan Disbursement (HTTP 200)**

```json
{
  "ledgerEntryId": "LE-20240847-F",
  "merchantAccount": "CoolAir HVAC LLC — ••••3847",
  "amount": 8000.00,
  "entryType": "loan_disbursement",
  "entryTypeLabel": "Loan Disbursement",
  "jobReference": "JOB-2024-0847",
  "loanId": "LN-2024-003847",
  "status": "posted",
  "postedAt": "2026-07-27T19:03:00Z",
  "platform": "AirConPro",
  "customer": "Mr. Arnold Freeze"
}
```

---

## Error Handling

All endpoints return HTTP 200 for business-logic outcomes (including denials). HTTP error codes indicate infrastructure failures only.

| HTTP Code | Meaning |
|-----------|---------|
| `400` | Malformed request — missing or invalid required fields. Check `error` field in response body. |
| `401` | Missing or invalid `Authorization` header. |
| `500` | Internal server error. Retry with exponential backoff; if persistent, contact support. |

**Error response shape:**

```json
{
  "error": "amount is required and must be a number (in cents)"
}
```

---

## Integration Sequence — Full Flow

### Flow 1: Merchant Onboarding (one time per business)

```
SaaS Platform                    Connector API                    ABC Community Bank
     |                                 |                                   |
     |-- POST /api/underwriting ------>|                                   |
     |   { merchantId }               |-- KYB lookup, risk review ------->|
     |                                |<-- decision + subMerchantId -------|
     |<-- { decision, subMerchantId } |                                   |
     |                                |                                   |
     | [store subMerchantId]          |                                   |
```

### Flow 2a: Card Payment (per transaction)

```
SaaS Platform                    Connector API                    Stripe / Bank Ledger
     |                                 |                                   |
     |-- POST /api/stripe/...-------->|                                   |
     |   { amount, jobId }            |-- stripe.paymentIntents.create -->|
     |<-- { clientSecret } -----------|<-- PaymentIntent -----------------|
     |                                |                                   |
     | [mount Stripe Elements]        |                                   |
     | [consumer enters card]         |                                   |
     | [stripe.confirmPayment()]      |-- card network auth ------------->|
     |                                |<-- settlement + ledger entry -----|
     |-- GET /api/ledger/entry ------>|                                   |
     |<-- { ledgerEntry } ------------|                                   |
```

### Flow 2b: Financing (per transaction)

```
SaaS Platform                    Connector API                    ABC Community Bank
     |                                 |                                   |
     |-- POST /api/financing/... ---->|                                   |
     |   { applicantName, amount }    |-- credit decisioning ------------>|
     |<-- { decision, terms } --------|<-- loan approval + terms ---------|
     |                                |                                   |
     | [consumer accepts terms]       |                                   |
     |-- POST /api/financing/accept ->|                                   |
     |                                |-- loan disbursement to merchant ->|
     |                                |<-- ledger entry posted ------------|
     |-- GET /api/ledger/entry ------>|                                   |
     |<-- { ledgerEntry } ------------|                                   |
```

---

## Key Design Decisions

**Why synchronous responses for underwriting and financing?**  
The demo uses synchronous responses with a simulated delay to keep the UI flow linear. A production implementation would use asynchronous webhooks — the SaaS platform POSTs the application, receives a `202 Accepted` with a `requestId`, and the bank POSTs a decision webhook when ready. This is the right production architecture because underwriting and credit decisioning can take seconds to minutes depending on the data sources queried.

**Why are underwriting and financing separate endpoints?**  
They are categorically different decisions. Underwriting is a business-level, one-time gate on the merchant (CoolAir HVAC). Financing is a transaction-level, per-consumer credit decision (Arnold Freeze). They involve different data, different risk models, different regulatory frameworks, and different actors. Conflating them would be a product design error.

**Why does the ledger entry match the SaaS platform's transaction record?**  
Because the bank is the PayFac. Funds move natively on the bank's own rails — there is no intermediary processor creating a separate record that later needs to be reconciled against the bank's ledger. The `jobId` threaded through all three API calls is what makes the match visible: same reference, same amount, same timestamp, one system of record.

**What would change in production?**  
- Async webhook architecture instead of polling/synchronous calls
- Real KYB/KYC integration on the underwriting endpoint
- Real ability-to-repay assessment on the financing endpoint
- Multi-bank routing — the connector should support more than one sponsor bank to avoid concentration risk (a single-bank connector can't redirect funds if that bank is frozen or under regulatory action, which is a real OCC concern for platform-scale PayFac deployments)
- OAuth 2.0 partner authentication instead of static API keys
- Idempotency keys on all POST endpoints

---

*End of Integration Spec*
