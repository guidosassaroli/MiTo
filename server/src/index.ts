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
        "Send a payment to someone. Deducts from the specified account, appends a transaction, and settles any matching Splitwise debt. Use this when the user wants to pay someone (e.g. 'pay the debt to Luca', 'send €23.50 to Sara via Revolut').",
      inputSchema: {
        to: z.string().describe("Recipient name, e.g. 'Luca' or 'Sara Bianchi'"),
        amount: z.number().positive().describe("Amount in EUR to send"),
        from_account: z
          .enum(["revolut", "unicredit", "paypal"])
          .describe("Source account: 'revolut', 'unicredit', or 'paypal'"),
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
        // Case B: Marco owes recipient (from === marcoId, to === recipient.id)
        const debtIdx = store.splitwise.debts.findIndex(
          (d) => d.from === marcoId && d.to === recipient.id,
        );
        if (debtIdx !== -1) {
          settledDebt = store.splitwise.debts[debtIdx];
          store.splitwise.debts.splice(debtIdx, 1);
        } else {
          // Case C: recipient owes Marco (from === recipient.id, to === marcoId) — mark settled
          const debtIdx2 = store.splitwise.debts.findIndex(
            (d) => d.from === recipient.id && d.to === marcoId,
          );
          if (debtIdx2 !== -1) {
            settledDebt = store.splitwise.debts[debtIdx2];
          }
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
  );

server.run();

export type AppType = typeof server;
