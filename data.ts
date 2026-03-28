/** Hardcoded mock data for Mito — personal finance co-pilot (EU / €). */

export const MOCK_ACCOUNTS = [
  {
    id: "unicredit-checking",
    name: "UniCredit Checking",
    balance: 1240.5,
    type: "checking" as const,
    note: "Main account",
  },
  {
    id: "paypal",
    name: "PayPal Balance",
    balance: 384.2,
    type: "wallet" as const,
    note: "Digital wallet",
  },
  {
    id: "intesa-savings",
    name: "Intesa Sanpaolo Savings",
    balance: 3200.0,
    type: "savings" as const,
    note: "Savings",
  },
];

export const MOCK_TRANSACTIONS_LAST_30_DAYS = [
  { id: "t1", merchant: "Netflix", amount: -15.99, category: "subscriptions" as const },
  { id: "t2", merchant: "Spotify", amount: -9.99, category: "subscriptions" as const },
  { id: "t3", merchant: "Adobe", amount: -14.99, category: "subscriptions" as const },
  { id: "t4", merchant: "Esselunga", amount: -67.4, category: "groceries" as const },
  { id: "t5", merchant: "Carrefour", amount: -43.2, category: "groceries" as const },
  { id: "t6", merchant: "Bar Torino", amount: -8.5, category: "eating_out" as const },
  { id: "t7", merchant: "Pizzeria Roma", amount: -24.0, category: "eating_out" as const },
  { id: "t8", merchant: "McDonald's", amount: -11.2, category: "eating_out" as const },
  { id: "t9", merchant: "GTT Abbonamento", amount: -38.0, category: "transport" as const },
  { id: "t10", merchant: "Affitto", amount: -650.0, category: "rent" as const },
  { id: "t11", merchant: "Stipendio", amount: 1400.0, category: "income" as const },
];

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export function totalBalance(): number {
  return sum(MOCK_ACCOUNTS.map((a) => a.balance));
}

/** Net cash flow this month from mock ledger (income minus expenses). */
export function monthNetFromMock(): number {
  const income = sum(
    MOCK_TRANSACTIONS_LAST_30_DAYS.filter((t) => t.amount > 0).map((t) => t.amount),
  );
  const expenses = sum(
    MOCK_TRANSACTIONS_LAST_30_DAYS.filter((t) => t.amount < 0).map((t) => -t.amount),
  );
  return income - expenses;
}

export const BUFFER_EUR = 500;
export const IDLE_ABOVE_BUFFER_EUR = 3324.7;

export const SPENDING_BY_CATEGORY = [
  { id: "groceries", label: "Groceries", amount: 110.6 },
  { id: "eating_out", label: "Eating out", amount: 43.7 },
  { id: "subscriptions", label: "Subscriptions", amount: 40.97 },
  { id: "transport", label: "Transport", amount: 38.0 },
  { id: "rent", label: "Rent", amount: 650.0 },
] as const;

export const MOCK_SUBSCRIPTIONS = [
  { id: "netflix", name: "Netflix", amount: 15.99 },
  { id: "spotify", name: "Spotify", amount: 9.99 },
  { id: "adobe", name: "Adobe", amount: 14.99 },
] as const;

export const ACTION_CARDS = [
  {
    id: "invest",
    badge: "INVEST",
    body:
      "You have €3,324.70 idle above your buffer. Start a €200/month ETF investment?",
  },
  {
    id: "cancel-adobe",
    badge: "CANCEL",
    body:
      "Adobe Creative Cloud costs €14.99/month. You haven't used it in 6 weeks. Cancel?",
  },
  {
    id: "save-n26",
    badge: "SAVE",
    body:
      "Move €500 from UniCredit to N26 Savings to hit your 3-month emergency fund goal?",
  },
] as const;
