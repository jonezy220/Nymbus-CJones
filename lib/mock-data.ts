/**
 * Mock data fixtures for the demo.
 * All values are consistent with the feature spec.
 * These are read-only — no writes, no database.
 */

export const COOLAIR_HVAC = {
  businessLegalName: "CoolAir HVAC LLC",
  dba: "CoolAir HVAC",
  businessType: "LLC",
  ein: "47-2831906",
  address: "214 Thornfield Rd, Greenville, SC 29601",
  phone: "(864) 555-0192",
  ownerName: "Derek Sutton",
  ownerTitle: "Owner",
  ownerDob: "1981-04-12",
  ownerSsnMasked: "***-**-7741",
  linkedAccount: "ABC Community Bank — Checking ••••3847",
  avgMonthlyVolume: "$24,000",
  avgTransactionSize: "$1,200",
  merchantId: "coolair-hvac-001",
} as const;

export const ARNOLD_FREEZE_JOB = {
  jobNumber: "JOB-2024-0847",
  customer: "Mr. Arnold Freeze",
  address: "88 Glacier Point Ln, Greenville, SC 29607",
  service: "Central AC Installation — Carrier 3-Ton Unit",
  technician: "Derek Sutton",
  subtotal: 7200.0,
  tax: 800.0,
  total: 8000.0,
  taxRate: "11.11%",
} as const;

export const FINANCING_TERMS = {
  loanAmount: 8000.0,
  term: 24,
  apr: 9.99,
  monthlyPayment: 366.69,
  lender: "ABC Community Bank",
} as const;

export const UNDERWRITING_RESULT = {
  approved: {
    decision: "approved" as const,
    merchantId: "coolair-hvac-001",
    subMerchantId: "SM-2024-00847",
    approvedLimits: {
      dailyVolume: 50000,
      perTransaction: 15000,
    },
    linkedAccount: "ABC Community Bank — Checking ••••3847",
  },
  denied: {
    decision: "denied" as const,
    reason: "Unable to verify business information",
    merchantId: "coolair-hvac-001",
  },
};

export const FINANCING_RESULT = {
  approved: {
    decision: "approved" as const,
    loanId: "LN-2024-003847",
    loanAmount: 8000.0,
    term: 24,
    apr: 9.99,
    monthlyPayment: 366.69,
    lender: "ABC Community Bank",
  },
  denied: {
    decision: "denied" as const,
    reason: "Unable to approve financing at this time",
    fallback: "card" as const,
  },
};

// Stripe test card numbers for the demo helper panel
export const STRIPE_TEST_CARDS = {
  success: "4242 4242 4242 4242",
  insufficientFunds: "4000 0000 0000 9995",
  declineGeneric: "4000 0000 0000 0002",
} as const;
