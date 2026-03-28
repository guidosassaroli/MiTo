import { McpServer } from "skybridge/server";
import { z } from "zod";
import {
  revolutData,
  paypalData,
  unicreditData,
  intesaData,
  splitwiseData,
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
  );

server.run();

export type AppType = typeof server;
