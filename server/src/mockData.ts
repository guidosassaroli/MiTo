// ============================================================
// Mock Financial Data — Marco Rossi (32, Milan, SW Engineer)
// ============================================================

// ─────────────────────────────────────────────────────────────
// Shared / Common Types
// ─────────────────────────────────────────────────────────────

export type Currency = "EUR" | "GBP" | "USD";

// ─────────────────────────────────────────────────────────────
// 1. REVOLUT
// ─────────────────────────────────────────────────────────────

export interface RevolutPocket {
  currency: Currency;
  balance: number;
}

export interface RevolutVault {
  name: string;
  currency: Currency;
  balance: number;
}

export interface RevolutTransaction {
  id: string;
  date: string; // ISO 8601
  description: string;
  amount: number; // negative = debit, positive = credit
  currency: Currency;
  category: string;
  type: "debit" | "credit";
  counterparty: string;
}

export interface RevolutProfile {
  name: string;
  username: string;
  pockets: RevolutPocket[];
  vaults: RevolutVault[];
  transactions: RevolutTransaction[];
}

export const revolutData: RevolutProfile = {
  name: "Marco Rossi",
  username: "@marcorossi",
  pockets: [
    { currency: "EUR", balance: 1452.30 },
    { currency: "GBP", balance: 318.75 },
    { currency: "USD", balance: 84.20 },
  ],
  vaults: [
    { name: "Vacation", currency: "EUR", balance: 640.00 },
    { name: "Emergency Fund", currency: "EUR", balance: 2100.00 },
  ],
  transactions: [
    {
      id: "rev_001",
      date: "2026-03-28",
      description: "Spotify Premium",
      amount: -9.99,
      currency: "EUR",
      category: "Entertainment",
      type: "debit",
      counterparty: "Spotify AB",
    },
    {
      id: "rev_002",
      date: "2026-03-27",
      description: "Amazon.it — Electronics",
      amount: -67.50,
      currency: "EUR",
      category: "Shopping",
      type: "debit",
      counterparty: "Amazon EU SARL",
    },
    {
      id: "rev_003",
      date: "2026-03-26",
      description: "Caffè Vergnano — Espresso",
      amount: -1.50,
      currency: "EUR",
      category: "Food & Drink",
      type: "debit",
      counterparty: "Caffè Vergnano Milano",
    },
    {
      id: "rev_004",
      date: "2026-03-25",
      description: "Esselunga Supermarket",
      amount: -43.20,
      currency: "EUR",
      category: "Groceries",
      type: "debit",
      counterparty: "Esselunga SpA",
    },
    {
      id: "rev_005",
      date: "2026-03-22",
      description: "EUR → GBP Exchange",
      amount: -200.00,
      currency: "EUR",
      category: "FX Exchange",
      type: "debit",
      counterparty: "Revolut FX",
    },
    {
      id: "rev_006",
      date: "2026-03-22",
      description: "EUR → GBP Exchange",
      amount: 170.24,
      currency: "GBP",
      category: "FX Exchange",
      type: "credit",
      counterparty: "Revolut FX",
    },
    {
      id: "rev_007",
      date: "2026-03-20",
      description: "Transfer to Luca Ferrari",
      amount: -35.00,
      currency: "EUR",
      category: "Transfer",
      type: "debit",
      counterparty: "Luca Ferrari",
    },
    {
      id: "rev_008",
      date: "2026-03-18",
      description: "Netflix Monthly",
      amount: -13.99,
      currency: "EUR",
      category: "Entertainment",
      type: "debit",
      counterparty: "Netflix International BV",
    },
    {
      id: "rev_009",
      date: "2026-03-15",
      description: "Uber — Milano Centro",
      amount: -11.40,
      currency: "EUR",
      category: "Transport",
      type: "debit",
      counterparty: "Uber BV",
    },
    {
      id: "rev_010",
      date: "2026-03-12",
      description: "Salary Bonus Q1",
      amount: 500.00,
      currency: "EUR",
      category: "Income",
      type: "credit",
      counterparty: "Tech Solutions Srl",
    },
    {
      id: "rev_011",
      date: "2026-03-10",
      description: "Bar Brera — Aperitivo",
      amount: -18.00,
      currency: "EUR",
      category: "Food & Drink",
      type: "debit",
      counterparty: "Bar Brera",
    },
    {
      id: "rev_012",
      date: "2026-03-05",
      description: "Decathlon — Running Shoes",
      amount: -89.99,
      currency: "EUR",
      category: "Shopping",
      type: "debit",
      counterparty: "Decathlon Italia",
    },
    {
      id: "rev_013",
      date: "2026-02-28",
      description: "Top-up from UniCredit",
      amount: 300.00,
      currency: "EUR",
      category: "Transfer",
      type: "credit",
      counterparty: "UniCredit SpA",
    },
    {
      id: "rev_014",
      date: "2026-02-20",
      description: "Trenord — Monthly Pass",
      amount: -39.00,
      currency: "EUR",
      category: "Transport",
      type: "debit",
      counterparty: "Trenord Srl",
    },
    {
      id: "rev_015",
      date: "2026-01-28",
      description: "Apple App Store",
      amount: -4.99,
      currency: "EUR",
      category: "Entertainment",
      type: "debit",
      counterparty: "Apple Distribution International",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 2. PAYPAL
// ─────────────────────────────────────────────────────────────

export interface PayPalTransaction {
  id: string;
  date: string; // ISO 8601
  description: string;
  amount: number; // negative = sent, positive = received/refund
  currency: Currency;
  type: "sent" | "received" | "refund";
  status: "completed" | "pending" | "refunded";
  counterparty: string;
}

export interface PayPalAccount {
  email: string;
  balance: number;
  currency: Currency;
  transactions: PayPalTransaction[];
}

export const paypalData: PayPalAccount = {
  email: "marco.rossi@gmail.com",
  balance: 87.43,
  currency: "EUR",
  transactions: [
    {
      id: "pp_001",
      date: "2026-03-26",
      description: "eBay — Vintage Camera Lens",
      amount: -54.00,
      currency: "EUR",
      type: "sent",
      status: "completed",
      counterparty: "eBay Marketplace",
    },
    {
      id: "pp_002",
      date: "2026-03-24",
      description: "Udemy — React Advanced Course",
      amount: -14.99,
      currency: "EUR",
      type: "sent",
      status: "completed",
      counterparty: "Udemy Inc.",
    },
    {
      id: "pp_003",
      date: "2026-03-21",
      description: "Payment from Sara Bianchi",
      amount: 30.00,
      currency: "EUR",
      type: "received",
      status: "completed",
      counterparty: "Sara Bianchi",
    },
    {
      id: "pp_004",
      date: "2026-03-19",
      description: "Amazon.it — Refund (Book)",
      amount: 12.90,
      currency: "EUR",
      type: "refund",
      status: "refunded",
      counterparty: "Amazon EU SARL",
    },
    {
      id: "pp_005",
      date: "2026-03-14",
      description: "Freelance Web Design — Client A",
      amount: 250.00,
      currency: "EUR",
      type: "received",
      status: "completed",
      counterparty: "Startuplab Srl",
    },
    {
      id: "pp_006",
      date: "2026-03-08",
      description: "Airbnb — Weekend Florence",
      amount: -178.00,
      currency: "EUR",
      type: "sent",
      status: "completed",
      counterparty: "Airbnb Ireland UC",
    },
    {
      id: "pp_007",
      date: "2026-02-28",
      description: "Transfer to Bank Account",
      amount: -200.00,
      currency: "EUR",
      type: "sent",
      status: "completed",
      counterparty: "UniCredit SpA",
    },
    {
      id: "pp_008",
      date: "2026-02-22",
      description: "G2A — Video Game Key",
      amount: -8.99,
      currency: "EUR",
      type: "sent",
      status: "completed",
      counterparty: "G2A.COM Limited",
    },
    {
      id: "pp_009",
      date: "2026-02-15",
      description: "Freelance Consultation — Client B",
      amount: 120.00,
      currency: "EUR",
      type: "received",
      status: "completed",
      counterparty: "Nextra Consulting Srl",
    },
    {
      id: "pp_010",
      date: "2026-02-10",
      description: "Etsy — Handmade Gift",
      amount: -24.50,
      currency: "EUR",
      type: "sent",
      status: "completed",
      counterparty: "Etsy Ireland UC",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 3. UNICREDIT
// ─────────────────────────────────────────────────────────────

export interface UniCreditTransaction {
  id: string;
  date: string; // ISO 8601
  description: string;
  amount: number; // positive = credit, negative = debit
  type: "credit" | "debit";
  category: string;
  balance_after: number;
}

export interface CreditCard {
  balance: number;
  limit: number;
  currency: Currency;
}

export interface UniCreditAccount {
  holder: string;
  iban: string;
  account_number: string;
  current_balance: number;
  available_balance: number;
  currency: Currency;
  credit_card: CreditCard;
  transactions: UniCreditTransaction[];
}

export const unicreditData: UniCreditAccount = {
  holder: "Marco Rossi",
  iban: "IT60 X054 2811 1010 0000 0123 456",
  account_number: "000123456",
  current_balance: 5234.18,
  available_balance: 4854.18,
  currency: "EUR",
  credit_card: {
    balance: 380.00,
    limit: 3000.00,
    currency: "EUR",
  },
  transactions: [
    {
      id: "uni_001",
      date: "2026-03-27",
      description: "STIPENDIO TECH SOLUTIONS SRL",
      amount: 3200.00,
      type: "credit",
      category: "Salary",
      balance_after: 5234.18,
    },
    {
      id: "uni_002",
      date: "2026-03-25",
      description: "AFFITTO MARZO — IMMOBILIARE MILANO SRL",
      amount: -850.00,
      type: "debit",
      category: "Rent",
      balance_after: 2034.18,
    },
    {
      id: "uni_003",
      date: "2026-03-24",
      description: "ENEL ENERGIA — BOLLETTA LUCE",
      amount: -67.40,
      type: "debit",
      category: "Utilities",
      balance_after: 2884.18,
    },
    {
      id: "uni_004",
      date: "2026-03-22",
      description: "CARREFOUR SUPERMERCATI",
      amount: -56.80,
      type: "debit",
      category: "Groceries",
      balance_after: 2951.58,
    },
    {
      id: "uni_005",
      date: "2026-03-20",
      description: "PRELIEVO ATM — VIA TORINO MILANO",
      amount: -200.00,
      type: "debit",
      category: "ATM Withdrawal",
      balance_after: 3008.38,
    },
    {
      id: "uni_006",
      date: "2026-03-18",
      description: "BONIFICO A INTESA SANPAOLO — RISPARMIO",
      amount: -500.00,
      type: "debit",
      category: "Transfer",
      balance_after: 3208.38,
    },
    {
      id: "uni_007",
      date: "2026-03-15",
      description: "RISTORANTE AL CANTINONE",
      amount: -38.50,
      type: "debit",
      category: "Dining",
      balance_after: 3708.38,
    },
    {
      id: "uni_008",
      date: "2026-03-12",
      description: "RICARICA REVOLUT",
      amount: -300.00,
      type: "debit",
      category: "Transfer",
      balance_after: 3746.88,
    },
    {
      id: "uni_009",
      date: "2026-03-10",
      description: "VODAFONE ITALIA — PIANO MOBILE",
      amount: -9.99,
      type: "debit",
      category: "Telecoms",
      balance_after: 4046.88,
    },
    {
      id: "uni_010",
      date: "2026-03-05",
      description: "PALESTRA VIRGIN ACTIVE MILANO",
      amount: -49.00,
      type: "debit",
      category: "Health & Fitness",
      balance_after: 4056.87,
    },
    {
      id: "uni_011",
      date: "2026-02-27",
      description: "STIPENDIO TECH SOLUTIONS SRL",
      amount: 3200.00,
      type: "credit",
      category: "Salary",
      balance_after: 4105.87,
    },
    {
      id: "uni_012",
      date: "2026-02-25",
      description: "AFFITTO FEBBRAIO — IMMOBILIARE MILANO SRL",
      amount: -850.00,
      type: "debit",
      category: "Rent",
      balance_after: 905.87,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 4. INTESA SANPAOLO
// ─────────────────────────────────────────────────────────────

export interface IntesaTransaction {
  id: string;
  date: string; // ISO 8601
  description: string;
  amount: number; // positive = credit, negative = debit
  type: "credit" | "debit";
  category: string;
  balance_after: number;
}

export interface IntesaAccount {
  holder: string;
  iban: string;
  account_type: string;
  balance: number;
  currency: Currency;
  transactions: IntesaTransaction[];
}

export const intesaData: IntesaAccount = {
  holder: "Marco Rossi",
  iban: "IT45 B030 6909 6061 0000 0017 832",
  account_type: "Conto Corrente Ordinario",
  balance: 18542.00,
  currency: "EUR",
  transactions: [
    {
      id: "int_001",
      date: "2026-03-18",
      description: "BONIFICO IN ENTRATA — UNICREDIT MARCO ROSSI",
      amount: 500.00,
      type: "credit",
      category: "Transfer",
      balance_after: 18542.00,
    },
    {
      id: "int_002",
      date: "2026-03-15",
      description: "PREMIO ASSICURATIVO GENERALI VITA",
      amount: -124.00,
      type: "debit",
      category: "Insurance",
      balance_after: 18042.00,
    },
    {
      id: "int_003",
      date: "2026-03-01",
      description: "VERSAMENTO FONDO EURIZON FLEX",
      amount: -300.00,
      type: "debit",
      category: "Investments",
      balance_after: 18166.00,
    },
    {
      id: "int_004",
      date: "2026-02-18",
      description: "BONIFICO IN ENTRATA — UNICREDIT MARCO ROSSI",
      amount: 500.00,
      type: "credit",
      category: "Transfer",
      balance_after: 18466.00,
    },
    {
      id: "int_005",
      date: "2026-02-01",
      description: "VERSAMENTO FONDO EURIZON FLEX",
      amount: -300.00,
      type: "debit",
      category: "Investments",
      balance_after: 17966.00,
    },
    {
      id: "int_006",
      date: "2026-01-31",
      description: "ACCREDITO INTERESSI TRIMESTRALI",
      amount: 18.75,
      type: "credit",
      category: "Interest",
      balance_after: 18266.00,
    },
    {
      id: "int_007",
      date: "2026-01-18",
      description: "BONIFICO IN ENTRATA — UNICREDIT MARCO ROSSI",
      amount: 500.00,
      type: "credit",
      category: "Transfer",
      balance_after: 18247.25,
    },
    {
      id: "int_008",
      date: "2026-01-02",
      description: "VERSAMENTO FONDO EURIZON FLEX",
      amount: -300.00,
      type: "debit",
      category: "Investments",
      balance_after: 17747.25,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 5. SPLITWISE
// ─────────────────────────────────────────────────────────────

export interface SplitwiseUser {
  id: number;
  name: string;
}

export interface SplitwiseSplit {
  user_id: number;
  owed_share: number;
}

export interface SplitwiseExpense {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  date: string; // ISO 8601
  group: string;
  paid_by: number; // user_id
  splits: SplitwiseSplit[];
}

export interface SplitwiseGroup {
  id: number;
  name: string;
  members: SplitwiseUser[];
  description: string;
}

export interface SplitwiseDebt {
  from: number; // user_id
  to: number; // user_id
  amount: number;
  currency: Currency;
}

export interface SplitwiseData {
  current_user: SplitwiseUser;
  contacts: SplitwiseUser[];
  groups: SplitwiseGroup[];
  debts: SplitwiseDebt[];
  expenses: SplitwiseExpense[];
}

export const splitwiseData: SplitwiseData = {
  current_user: { id: 1, name: "Marco Rossi" },

  contacts: [
    { id: 2, name: "Luca Ferrari" },
    { id: 3, name: "Sara Bianchi" },
    { id: 4, name: "Giulia Conti" },
    { id: 5, name: "Tom Mueller" },
  ],

  groups: [
    {
      id: 101,
      name: "Casa Milano",
      description: "Shared apartment expenses",
      members: [
        { id: 1, name: "Marco Rossi" },
        { id: 2, name: "Luca Ferrari" },
        { id: 3, name: "Sara Bianchi" },
      ],
    },
    {
      id: 102,
      name: "Amsterdam Trip",
      description: "May 2025 trip to Amsterdam",
      members: [
        { id: 1, name: "Marco Rossi" },
        { id: 4, name: "Giulia Conti" },
        { id: 5, name: "Tom Mueller" },
      ],
    },
  ],

  debts: [
    { from: 2, to: 1, amount: 45.00, currency: "EUR" }, // Luca owes Marco
    { from: 1, to: 3, amount: 23.50, currency: "EUR" }, // Marco owes Sara
    { from: 4, to: 1, amount: 12.00, currency: "EUR" }, // Giulia owes Marco
    // Tom Mueller: settled up — no debt entry
  ],

  expenses: [
    // ── Casa Milano ──────────────────────────────────────────
    {
      id: "sw_001",
      description: "Utilities — March (ENEL + acqua)",
      amount: 135.00,
      currency: "EUR",
      date: "2026-03-20",
      group: "Casa Milano",
      paid_by: 1, // Marco paid
      splits: [
        { user_id: 1, owed_share: 45.00 },
        { user_id: 2, owed_share: 45.00 },
        { user_id: 3, owed_share: 45.00 },
      ],
    },
    {
      id: "sw_002",
      description: "Cleaning supplies — Esselunga",
      amount: 27.60,
      currency: "EUR",
      date: "2026-03-14",
      group: "Casa Milano",
      paid_by: 2, // Luca paid
      splits: [
        { user_id: 1, owed_share: 9.20 },
        { user_id: 2, owed_share: 9.20 },
        { user_id: 3, owed_share: 9.20 },
      ],
    },
    {
      id: "sw_003",
      description: "Internet bill — TIM Marzo",
      amount: 29.90,
      currency: "EUR",
      date: "2026-03-10",
      group: "Casa Milano",
      paid_by: 3, // Sara paid
      splits: [
        { user_id: 1, owed_share: 9.97 },
        { user_id: 2, owed_share: 9.97 },
        { user_id: 3, owed_share: 9.96 },
      ],
    },
    // ── Amsterdam Trip (May 2025) ─────────────────────────────
    {
      id: "sw_004",
      description: "Hotel Volkshotel — 3 nights",
      amount: 345.00,
      currency: "EUR",
      date: "2025-05-15",
      group: "Amsterdam Trip",
      paid_by: 1, // Marco paid
      splits: [
        { user_id: 1, owed_share: 115.00 },
        { user_id: 4, owed_share: 115.00 },
        { user_id: 5, owed_share: 115.00 },
      ],
    },
    {
      id: "sw_005",
      description: "Dinner — Restaurant De Kas",
      amount: 96.00,
      currency: "EUR",
      date: "2025-05-16",
      group: "Amsterdam Trip",
      paid_by: 4, // Giulia paid
      splits: [
        { user_id: 1, owed_share: 32.00 },
        { user_id: 4, owed_share: 32.00 },
        { user_id: 5, owed_share: 32.00 },
      ],
    },
    {
      id: "sw_006",
      description: "Rijksmuseum tickets",
      amount: 57.00,
      currency: "EUR",
      date: "2025-05-17",
      group: "Amsterdam Trip",
      paid_by: 5, // Tom paid
      splits: [
        { user_id: 1, owed_share: 19.00 },
        { user_id: 4, owed_share: 19.00 },
        { user_id: 5, owed_share: 19.00 },
      ],
    },
    {
      id: "sw_007",
      description: "Thalys train tickets — Milan ↔ Amsterdam",
      amount: 219.00,
      currency: "EUR",
      date: "2025-05-14",
      group: "Amsterdam Trip",
      paid_by: 1, // Marco paid
      splits: [
        { user_id: 1, owed_share: 73.00 },
        { user_id: 4, owed_share: 73.00 },
        { user_id: 5, owed_share: 73.00 },
      ],
    },
    // ── Non-group / direct split ──────────────────────────────
    {
      id: "sw_008",
      description: "Pizza dinner — Pizzeria Gino Sorbillo",
      amount: 47.00,
      currency: "EUR",
      date: "2026-03-22",
      group: "Non-group",
      paid_by: 1, // Marco paid
      splits: [
        { user_id: 1, owed_share: 23.50 },
        { user_id: 3, owed_share: 23.50 }, // Sara owes Marco
      ],
    },
  ],
};

// ─── Mutable in-memory store ──────────────────────────────────────────────────
// All handlers read/write through `store` so mutations persist across tool calls.

export const store = {
  revolut: revolutData,
  paypal: paypalData,
  unicredit: unicreditData,
  intesa: intesaData,
  splitwise: splitwiseData,
};
