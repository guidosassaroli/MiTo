import { mountWidget } from "skybridge/web";
import { useToolInfo } from "../helpers.js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentOutput {
  status: "success";
  payment: {
    to: string;
    amount: number;
    currency: string;
    from_account: string;
    note: string | null;
    date: string;
  };
  balance: {
    previous: number;
    new: number;
    account: string;
  };
  splitwise_settled: {
    settled: boolean;
    debt_amount?: number;
    currency?: string;
  };
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const c = {
  bg: "oklch(97% 0.005 60)",
  bgAlt: "oklch(94% 0.008 60)",
  ink: "oklch(18% 0.01 60)",
  inkMid: "oklch(42% 0.01 60)",
  inkSub: "oklch(58% 0.01 60)",
  rule: "oklch(88% 0.008 60)",
  posNum: "oklch(38% 0.14 155)",
  negNum: "oklch(42% 0.18 25)",
  accent: "oklch(48% 0.12 260)",
};

const FONT_LINK = `https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

function formatDate(iso: string): string {
  const d = new Date(iso);
  const MONTH = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${MONTH[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FontLoader() {
  return <link rel="stylesheet" href={FONT_LINK} crossOrigin="anonymous" />;
}

function Skeleton() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: c.bg, width: "100%", aspectRatio: "21 / 9", padding: "28px 20px", boxSizing: "border-box", overflowY: "auto" }}>
      <style>{`@keyframes shimmer { 0%{opacity:1} 50%{opacity:.45} 100%{opacity:1} } .sk{background:${c.bgAlt};border-radius:3px;animation:shimmer 1.6s ease-in-out infinite}`}</style>
      <div className="sk" style={{ width: 80, height: 11, marginBottom: 32 }} />
      <div style={{ display:"flex", justifyContent:"center", marginBottom: 16 }}>
        <div className="sk" style={{ width: 48, height: 48, borderRadius:"50%" }} />
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap: 8, marginBottom: 32 }}>
        <div className="sk" style={{ width: "50%", height: 52 }} />
        <div className="sk" style={{ width: "30%", height: 13 }} />
      </div>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"11px 0", borderTop:`1px solid ${c.rule}` }}>
          <div className="sk" style={{ width: 40, height: 12 }} />
          <div className="sk" style={{ width: 80, height: 12 }} />
        </div>
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="23" stroke={c.posNum} strokeWidth="2" fill={`color-mix(in oklch, ${c.posNum} 8%, white)`} />
      <path d="M14 24.5L21 31.5L34 17" stroke={c.posNum} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: "11px 0",
      borderTop: `1px solid ${c.rule}`,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <span style={{ fontSize: 12, color: c.inkSub }}>{label}</span>
      <span style={{ textAlign: "right" }}>{children}</span>
    </div>
  );
}

// ─── Root Widget ──────────────────────────────────────────────────────────────

function SendPaymentWidget() {
  const { output } = useToolInfo<"send_payment">();
  const data = output as unknown as PaymentOutput | undefined;

  return (
    <>
      <FontLoader />
      <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { background: ${c.bg}; }`}</style>

      {!data ? (
        <Skeleton />
      ) : (
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: c.bg,
          width: "100%",
          aspectRatio: "21 / 9",
          padding: "28px 20px 40px",
          color: c.ink,
          overflowY: "auto",
        }}>
          {/* Wordmark */}
          <div style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 13,
            color: c.inkSub,
            letterSpacing: "0.05em",
            marginBottom: 28,
          }}>
            Payment
          </div>

          {/* Success confirmation */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 8 }}>
            <div style={{ marginBottom: 16 }}>
              <CheckIcon />
            </div>
            <div style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(44px, 12vw, 64px)",
              lineHeight: 1,
              color: c.negNum,
              letterSpacing: "-0.02em",
              fontVariantNumeric: "tabular-nums",
              marginBottom: 6,
            }}>
              −{fmt(data.payment.amount)}
            </div>
            <div style={{
              fontSize: 13,
              color: c.inkSub,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 400,
              marginBottom: data.payment.note ? 4 : 0,
            }}>
              sent to {data.payment.to}
            </div>
            {data.payment.note && (
              <div style={{
                fontSize: 12,
                color: c.inkSub,
                fontStyle: "italic",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                "{data.payment.note}"
              </div>
            )}
          </div>

          {/* Details section */}
          <div style={{ marginTop: 28 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: c.inkSub,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginBottom: 14,
            }}>
              Details
            </div>

            <DetailRow label="To">
              <span style={{ fontSize: 13, fontWeight: 600, color: c.ink }}>{data.payment.to}</span>
            </DetailRow>

            <DetailRow label="From">
              <span style={{ fontSize: 13, fontWeight: 600, color: c.ink }}>{data.payment.from_account}</span>
            </DetailRow>

            <DetailRow label="Date">
              <span style={{ fontSize: 13, color: c.ink }}>{formatDate(data.payment.date)}</span>
            </DetailRow>

            <DetailRow label="New balance">
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.ink, fontVariantNumeric: "tabular-nums" }}>
                  {fmt(data.balance.new)}
                </div>
                <div style={{ fontSize: 11, color: c.inkSub, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
                  was {fmt(data.balance.previous)}
                </div>
              </div>
            </DetailRow>
            {/* bottom border for last row */}
            <div style={{ borderTop: `1px solid ${c.rule}` }} />
          </div>

          {/* Splitwise settled banner */}
          {data.splitwise_settled.settled && (
            <div style={{
              marginTop: 16,
              padding: "12px 14px",
              background: "oklch(95% 0.03 155)",
              borderRadius: 8,
              border: "1px solid oklch(85% 0.06 155)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              <span style={{ fontSize: 14, color: c.posNum, fontWeight: 700, lineHeight: 1 }}>✓</span>
              <span style={{ fontSize: 13, color: c.posNum, fontWeight: 600 }}>
                Splitwise debt of {fmt(data.splitwise_settled.debt_amount ?? 0)} settled
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default SendPaymentWidget;

mountWidget(<SendPaymentWidget />);
