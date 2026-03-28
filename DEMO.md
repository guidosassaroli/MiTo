# MiTo — Demo Script

## Scenario: "Back from Amsterdam"

Marco Rossi just returned from a group trip to Amsterdam. He wants a quick health check on his finances, settle what he owes to a friend from the trip, and confirm his balance updated correctly.

---

## Prompt Sequence

### 1 — Full Financial Overview
> **"Give me a full overview of my finances"**

**Widget:** `get_summary`

Shows the main MiTo dashboard:
- Hero total balance across all 4 accounts (Revolut, PayPal, UniCredit, Intesa SanPaolo)
- Per-account balances with color-coded avatars
- 3 most recent expenses across all accounts
- Interactive spending donut chart (Groceries / Dining / Subscriptions / Transport / Rent)
- 3 actionable insight cards: INVEST idle cash → ETF, CANCEL unused Adobe CC, SAVE into emergency fund

---

### 2 — Splitwise Situation
> **"What's my Splitwise situation after the Amsterdam trip?"**

**Widget:** `get_splitwise_data`

Shows the social debt tracker:
- Net balance header (Marco is owed €33.50 overall)
- Amsterdam Trip group with members: Marco, Luca, Sara, Tom
- Outstanding debts: Luca owes Marco €45 · Marco owes Sara €23.50 · Giulia owes Marco €12
- Full shared expense list with each person's share highlighted

---

### 3 — Settle the Debt
> **"Pay Sara €23.50 to settle my debt from the trip"**

**Widget:** `send_payment`

Shows the payment confirmation receipt:
- Green checkmark + hero debit amount: −€23.50
- Sent to Sara Bianchi · From Revolut · Today's date
- New Revolut balance: €1,428.80
- Green banner: ✓ Splitwise debt of €23.50 settled

---

### 4 — Confirm Updated Balance
> **"Show me my updated balance"**

**Widget:** `get_summary`

Re-opens the full dashboard with the post-payment state:
- Revolut balance updated to €1,428.80 (was €1,452.30)
- Sara no longer appears in outstanding debts
- Everything else unchanged — confirms the payment landed correctly
