import { McpServer } from "skybridge/server";
import { z } from "zod";
import {
  revolutData,
  paypalData,
  unicreditData,
  intesaData,
  splitwiseData,
  store,
  type SplitwiseDebt,
} from "./mockData.js";

const server = new McpServer(
  {
    name: "mito",
    version: "0.0.1",
  },
  { capabilities: {} },
)
  .registerWidget(
    "placeholder",
    {
      description: "Placeholder widget — replace with real implementation.",
    },
    {
      description: "Renders the placeholder widget. Pass any input message.",
      inputSchema: {
        message: z.string().optional().describe("An optional message to display."),
      },
    },
    async ({ message }) => {
      return {
        structuredContent: { message: message ?? "Widget ready." },
        content: [{ type: "text", text: message ?? "Widget ready." }],
      };
    },
  )
  .registerWidget(
    "get_accounts_summary",
    {
      description: "Returns a summary of all financial accounts and balances for Marco Rossi",
    },
    {
      description: "Returns a summary of all financial accounts and balances for Marco Rossi",
      inputSchema: {},
    },
    async () => {
      const revolutEurPocket = revolutData.pockets.find(
        (p: { currency: string }) => p.currency === "EUR",
      );
      const revolutBalance = revolutEurPocket?.balance ?? 0;
      const paypalBalance = paypalData.balance;
      const unicreditBalance = unicreditData.current_balance;
      const intesaBalance = intesaData.balance;

      const marcoId = splitwiseData.current_user.id;
      const splitwiseOwedToMarco = splitwiseData.debts
        .filter((d: { to: number }) => d.to === marcoId)
        .reduce((sum: number, d: { amount: number }) => sum + d.amount, 0);
      const splitwiseMarcoOwes = splitwiseData.debts
        .filter((d: { from: number }) => d.from === marcoId)
        .reduce((sum: number, d: { amount: number }) => sum + d.amount, 0);
      const splitwiseNetBalance = splitwiseOwedToMarco - splitwiseMarcoOwes;

      const totalLiquidEur =
        revolutBalance + paypalBalance + unicreditBalance + intesaBalance;

      const structuredContent = {
        person: "Marco Rossi",
        accounts: [
          {
            source: "Revolut",
            currency: "EUR",
            balance: revolutBalance,
            pockets: revolutData.pockets,
          },
          {
            source: "PayPal",
            currency: "EUR",
            balance: paypalBalance,
          },
          {
            source: "UniCredit",
            currency: "EUR",
            balance: unicreditBalance,
          },
          {
            source: "Intesa SanPaolo",
            currency: "EUR",
            balance: intesaBalance,
          },
        ],
        splitwise: {
          net_balance: splitwiseNetBalance,
          currency: "EUR",
        },
        total_liquid_eur: totalLiquidEur,
      };

      const text =
        `Marco Rossi — Accounts Summary\n` +
        `Revolut: €${revolutBalance.toFixed(2)} | PayPal: €${paypalBalance.toFixed(2)} | UniCredit: €${unicreditBalance.toFixed(2)} | Intesa SanPaolo: €${intesaBalance.toFixed(2)}\n` +
        `Splitwise net balance: €${splitwiseNetBalance.toFixed(2)} (positive = others owe Marco)\n` +
        `Total liquid (EUR): €${totalLiquidEur.toFixed(2)}`;

      return {
        structuredContent,
        content: [{ type: "text", text }],
      };
    },
  )
  .registerWidget(
    "get_revolut_transactions",
    {
      description: "Returns Revolut transaction history, pockets, and vaults for Marco Rossi",
    },
    {
      description: "Returns Revolut transaction history, pockets, and vaults for Marco Rossi",
      inputSchema: {},
    },
    async () => {
      const structuredContent = {
        name: revolutData.name,
        username: revolutData.username,
        pockets: revolutData.pockets,
        vaults: revolutData.vaults,
        transactions: revolutData.transactions,
      };

      const txCount = revolutData.transactions?.length ?? 0;
      const pocketSummary = revolutData.pockets
        .map((p: { currency: string; balance: number }) => `${p.currency}: ${p.balance}`)
        .join(", ");

      const text =
        `Revolut — ${revolutData.name}\n` +
        `Pockets: ${pocketSummary}\n` +
        `Vaults: ${revolutData.vaults?.length ?? 0} | Transactions: ${txCount}`;

      return {
        structuredContent,
        content: [{ type: "text", text }],
      };
    },
  )
  .registerWidget(
    "get_paypal_transactions",
    {
      description: "Returns PayPal transaction history and balance for Marco Rossi",
    },
    {
      description: "Returns PayPal transaction history and balance for Marco Rossi",
      inputSchema: {},
    },
    async () => {
      const txCount = paypalData.transactions?.length ?? 0;

      const text =
        `PayPal — ${paypalData.email ?? "Marco Rossi"}\n` +
        `Balance: €${(paypalData.balance ?? 0).toFixed(2)}\n` +
        `Transactions: ${txCount}`;

      return {
        structuredContent: paypalData,
        content: [{ type: "text", text }],
      };
    },
  )
  .registerWidget(
    "get_unicredit_transactions",
    {
      description: "Returns UniCredit bank account transactions and credit card info for Marco Rossi",
    },
    {
      description:
        "Returns UniCredit bank account transactions and credit card info for Marco Rossi",
      inputSchema: {},
    },
    async () => {
      const txCount = unicreditData.transactions?.length ?? 0;
      const balance = unicreditData.current_balance;

      const text =
        `UniCredit — Marco Rossi\n` +
        `Current account balance: €${balance.toFixed(2)}\n` +
        `Transactions: ${txCount} | Credit card included: ${unicreditData.credit_card ? "yes" : "no"}`;

      return {
        structuredContent: unicreditData,
        content: [{ type: "text", text }],
      };
    },
  )
  .registerWidget(
    "get_intesa_transactions",
    {
      description: "Returns Intesa SanPaolo savings account transactions for Marco Rossi",
    },
    {
      description: "Returns Intesa SanPaolo savings account transactions for Marco Rossi",
      inputSchema: {},
    },
    async () => {
      const txCount = intesaData.transactions?.length ?? 0;
      const balance = intesaData.balance;

      const text =
        `Intesa SanPaolo — Marco Rossi\n` +
        `Savings account balance: €${balance.toFixed(2)}\n` +
        `Transactions: ${txCount}`;

      return {
        structuredContent: intesaData,
        content: [{ type: "text", text }],
      };
    },
  )
  .registerWidget(
    "get_splitwise_data",
    {
      description: "Returns Splitwise contacts, expense groups, debts and recent expenses for Marco Rossi",
    },
    {
      description:
        "Returns Splitwise contacts, expense groups, debts and recent expenses for Marco Rossi",
      inputSchema: {},
    },
    async () => {
      const allUsers = [splitwiseData.current_user, ...splitwiseData.contacts];
      const userName = (id: number) => allUsers.find((u) => u.id === id)?.name ?? `User ${id}`;
      const debtLines = (splitwiseData.debts ?? [])
        .map((d: SplitwiseDebt) =>
          `${userName(d.from)} owes ${userName(d.to)} ${d.currency}${d.amount.toFixed(2)}`,
        )
        .join("\n");

      const text =
        `Splitwise — Marco Rossi\n` +
        `Groups: ${splitwiseData.groups?.length ?? 0} | Contacts: ${splitwiseData.contacts?.length ?? 0}\n` +
        `Recent expenses: ${splitwiseData.expenses?.length ?? 0}\n` +
        (debtLines ? `Debts:\n${debtLines}` : "No outstanding debts.");

      return {
        structuredContent: splitwiseData,
        content: [{ type: "text", text }],
      };
    },
  )
  .registerWidget(
    "send_payment",
    {
      description: "Simulates sending a payment to a person, optionally settling a Splitwise debt. Updates balances and transaction history in real time.",
    },
    {
      description:
        "Send a payment to someone, settle a debt, or pay what Marco owes. Deducts from the specified account, appends a transaction, and clears any matching Splitwise debt. Use this when the user wants to: pay someone, send money, settle a debt, pay what I owe, pay my debt to X, transfer funds to a contact. If no account is specified, default to 'revolut'.",
      inputSchema: {
        to: z.string().describe("Recipient name, e.g. 'Luca' or 'Sara Bianchi'"),
        amount: z.number().positive().describe("Amount in EUR to send"),
        from_account: z
          .enum(["revolut", "unicredit", "paypal"])
          .optional()
          .default("revolut")
          .describe("Source account: 'revolut' (default), 'unicredit', or 'paypal'. Use 'revolut' if the user does not specify an account."),
        note: z.string().optional().describe("Optional payment note"),
      },
    },
    async ({ to, amount, from_account, note }) => {
      const today = new Date().toISOString().split("T")[0];

      // ── 1. Resolve recipient (fuzzy match on first name or full name) ──────
      const allUsers = [store.splitwise.current_user, ...store.splitwise.contacts];
      const recipient = allUsers.find(
        (u) =>
          u.name.toLowerCase().includes(to.toLowerCase()) ||
          to.toLowerCase().includes(u.name.split(" ")[0].toLowerCase()),
      );
      const recipientName = recipient?.name ?? to;

      // ── 2. Deduct from account & append transaction ────────────────────────
      let previousBalance = 0;
      let newBalance = 0;

      if (from_account === "revolut") {
        const eurPocket = store.revolut.pockets.find((p) => p.currency === "EUR");
        if (eurPocket) {
          previousBalance = eurPocket.balance;
          eurPocket.balance = Math.round((eurPocket.balance - amount) * 100) / 100;
          newBalance = eurPocket.balance;
        }
        const newTx = {
          id: `rev_pay_${Date.now()}`,
          date: today,
          description: `Payment to ${recipientName}${note ? ` — ${note}` : ""}`,
          amount: -amount,
          currency: "EUR" as const,
          category: "Transfer",
          type: "debit" as const,
          counterparty: recipientName,
        };
        store.revolut.transactions.unshift(newTx);
      } else if (from_account === "unicredit") {
        previousBalance = store.unicredit.current_balance;
        store.unicredit.current_balance =
          Math.round((store.unicredit.current_balance - amount) * 100) / 100;
        store.unicredit.available_balance =
          Math.round((store.unicredit.available_balance - amount) * 100) / 100;
        newBalance = store.unicredit.current_balance;
        const newTx = {
          id: `uni_pay_${Date.now()}`,
          date: today,
          description: `BONIFICO A ${recipientName.toUpperCase()}${note ? ` - ${note.toUpperCase()}` : ""}`,
          amount: -amount,
          type: "debit" as const,
          category: "Transfer",
          balance_after: newBalance,
        };
        store.unicredit.transactions.unshift(newTx);
      } else if (from_account === "paypal") {
        previousBalance = store.paypal.balance;
        store.paypal.balance = Math.round((store.paypal.balance - amount) * 100) / 100;
        newBalance = store.paypal.balance;
        const newTx = {
          id: `pp_pay_${Date.now()}`,
          date: today,
          description: `Payment to ${recipientName}${note ? ` — ${note}` : ""}`,
          amount: -amount,
          currency: "EUR" as const,
          type: "sent" as const,
          status: "completed" as const,
          counterparty: recipientName,
        };
        store.paypal.transactions.unshift(newTx);
      }

      // ── 3. Settle Splitwise debt if applicable ─────────────────────────────
      const marcoId = store.splitwise.current_user.id;
      let settledDebt: { from: number; to: number; amount: number; currency: string } | null = null;

      if (recipient) {
        // Only settle debts where Marco owes the recipient (from === marcoId, to === recipient.id)
        const debtIdx = store.splitwise.debts.findIndex(
          (d) => d.from === marcoId && d.to === recipient.id,
        );
        if (debtIdx !== -1) {
          settledDebt = store.splitwise.debts[debtIdx];
          store.splitwise.debts.splice(debtIdx, 1);
        }
      }

      // ── 4. Build response ──────────────────────────────────────────────────
      const accountLabel =
        from_account === "revolut"
          ? "Revolut"
          : from_account === "unicredit"
          ? "UniCredit"
          : "PayPal";

      const structuredContent = {
        status: "success",
        payment: {
          to: recipientName,
          amount,
          currency: "EUR",
          from_account: accountLabel,
          note: note ?? null,
          date: today,
        },
        balance: {
          previous: previousBalance,
          new: newBalance,
          account: accountLabel,
        },
        splitwise_settled: settledDebt
          ? {
              settled: true,
              debt_amount: settledDebt.amount,
              currency: settledDebt.currency,
            }
          : { settled: false },
      };

      const debtNote = settledDebt
        ? ` Splitwise debt of €${settledDebt.amount.toFixed(2)} marked as settled.`
        : "";

      const text =
        `Payment sent: €${amount.toFixed(2)} to ${recipientName} via ${accountLabel}.\n` +
        `New ${accountLabel} balance: €${newBalance.toFixed(2)} (was €${previousBalance.toFixed(2)}).` +
        debtNote;

      return {
        structuredContent,
        content: [{ type: "text", text }],
      };
    },
  )
  .registerWidget(
    "get_summary",
  {
    description:
      "Returns a full financial dashboard summary for Marco Rossi: all account balances, last 3 expenses across all accounts, spending by 5 categories, and insight/anomaly cards.",
  },
  {
    description:
      "Show a complete financial dashboard: balances across all accounts, recent expenses, spending breakdown by category, and actionable insights. Use this as the default overview when the user asks for a summary, overview, or dashboard.",
    inputSchema: {},
  },
  async () => {
    // ── Accounts ──────────────────────────────────────────────────────────
    const revolutEur = store.revolut.pockets.find((p) => p.currency === "EUR");
    const accounts = [
      { id: "revolut", name: "Revolut", balance: revolutEur?.balance ?? 0, type: "wallet", currency: "EUR" },
      { id: "paypal", name: "PayPal", balance: store.paypal.balance, type: "wallet", currency: "EUR" },
      { id: "unicredit", name: "UniCredit", balance: store.unicredit.current_balance, type: "checking", currency: "EUR" },
      { id: "intesa", name: "Intesa SanPaolo", balance: store.intesa.balance, type: "savings", currency: "EUR" },
    ];
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

    // ── Last 3 expenses across all accounts (debits only, merged) ─────────
    type AnyTx = { id: string; date: string; description: string; amount: number; source: string; category: string };

    const revolutExpenses: AnyTx[] = store.revolut.transactions
      .filter((t) => t.amount < 0)
      .map((t) => ({ id: t.id, date: t.date, description: t.description, amount: t.amount, source: "Revolut", category: t.category }));

    const paypalExpenses: AnyTx[] = store.paypal.transactions
      .filter((t) => t.amount < 0)
      .map((t) => ({ id: t.id, date: t.date, description: t.description, amount: t.amount, source: "PayPal", category: "Shopping" }));

    const unicreditExpenses: AnyTx[] = store.unicredit.transactions
      .filter((t) => t.amount < 0)
      .map((t) => ({ id: t.id, date: t.date, description: t.description, amount: t.amount, source: "UniCredit", category: t.category }));

    const intesaExpenses: AnyTx[] = store.intesa.transactions
      .filter((t) => t.amount < 0)
      .map((t) => ({ id: t.id, date: t.date, description: t.description, amount: t.amount, source: "Intesa", category: t.category }));

    const allExpenses = [...revolutExpenses, ...paypalExpenses, ...unicreditExpenses, ...intesaExpenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    // ── Spending by category (5 buckets) ─────────────────────────────────
    const catMap: Record<string, { label: string; amount: number; color: string }> = {
      groceries: { label: "Groceries", amount: 0, color: "oklch(55% 0.16 155)" },
      dining: { label: "Dining", amount: 0, color: "oklch(58% 0.18 55)" },
      subscriptions: { label: "Subscriptions", amount: 0, color: "oklch(52% 0.15 260)" },
      transport: { label: "Transport", amount: 0, color: "oklch(54% 0.15 320)" },
      rent_utilities: { label: "Rent & Utilities", amount: 0, color: "oklch(50% 0.12 25)" },
    };

    const categorizeTx = (cat: string, amount: number) => {
      const normalized = cat.toLowerCase();
      const abs = Math.abs(amount);
      if (normalized.includes("groceri") || normalized === "groceries") catMap.groceries.amount += abs;
      else if (normalized.includes("dining") || normalized.includes("food") || normalized.includes("restaurant") || normalized.includes("bar")) catMap.dining.amount += abs;
      else if (normalized.includes("entertainment") || normalized.includes("subscription")) catMap.subscriptions.amount += abs;
      else if (normalized.includes("transport")) catMap.transport.amount += abs;
      else if (normalized.includes("rent") || normalized.includes("utilities") || normalized.includes("telecom")) catMap.rent_utilities.amount += abs;
    };

    [...revolutExpenses, ...paypalExpenses, ...unicreditExpenses, ...intesaExpenses].forEach((t) =>
      categorizeTx(t.category, t.amount),
    );

    const spendingByCategory = Object.entries(catMap).map(([id, v]) => ({
      id,
      label: v.label,
      amount: Math.round(v.amount * 100) / 100,
      color: v.color,
    }));

    // ── Insights ─────────────────────────────────────────────────────────
    const insights = [
      { id: "invest", badge: "INVEST", body: "You have €3,324.70 idle above your €500 buffer. Consider a €200/month ETF." },
      { id: "cancel", badge: "CANCEL", body: "Adobe Creative Cloud costs €14.99/month. No usage in 6 weeks. Cancel?" },
      { id: "save", badge: "SAVE", body: "Move €500 from UniCredit to Intesa savings to hit your 3-month emergency fund." },
    ];

    const structuredContent = {
      person: "Marco Rossi",
      accounts,
      total_balance: Math.round(totalBalance * 100) / 100,
      recent_expenses: allExpenses,
      spending_by_category: spendingByCategory,
      insights,
    };

    const text =
      `MiTo Summary — Marco Rossi\n` +
      `Total balance: €${totalBalance.toFixed(2)}\n` +
      accounts.map((a) => `  ${a.name}: €${a.balance.toFixed(2)}`).join("\n") +
      `\n\nLast 3 expenses:\n` +
      allExpenses.map((t) => `  ${t.date} ${t.description} (${t.source}): €${Math.abs(t.amount).toFixed(2)}`).join("\n") +
      `\n\nSpending by category:\n` +
      spendingByCategory.map((c) => `  ${c.label}: €${c.amount.toFixed(2)}`).join("\n");

    return {
      structuredContent,
      content: [{ type: "text", text }],
    };
  },
);

server.run();

export type AppType = typeof server;
