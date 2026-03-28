import { useState } from "react";
import { mountWidget } from "skybridge/web";
import { useToolInfo } from "../helpers.js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
  currency: string;
}

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  source: string;
  category: string;
}

interface CategorySpend {
  id: string;
  label: string;
  amount: number;
  color: string;
}

interface Insight {
  id: string;
  badge: string;
  body: string;
}

interface SummaryData {
  person: string;
  accounts: Account[];
  total_balance: number;
  recent_expenses: Expense[];
  spending_by_category: CategorySpend[];
  insights: Insight[];
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const FONT_LINK = `https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap`;

const c = {
  bg:      "oklch(97% 0.005 60)",
  bgAlt:   "oklch(94% 0.008 60)",
  surface: "oklch(99% 0.003 60)",
  ink:     "oklch(18% 0.01 60)",
  inkMid:  "oklch(42% 0.01 60)",
  inkSub:  "oklch(58% 0.01 60)",
  rule:    "oklch(88% 0.008 60)",
  border:  "oklch(84% 0.01 60)",
  posNum:  "oklch(38% 0.14 155)",
  negNum:  "oklch(42% 0.18 25)",
};

// Account type → accent hue
const ACCOUNT_HUE: Record<string, string> = {
  revolut:  "oklch(52% 0.15 260)",
  paypal:   "oklch(50% 0.14 230)",
  unicredit: "oklch(50% 0.16 25)",
  intesa:   "oklch(50% 0.15 155)",
};

const BADGE_PALETTE: Record<string, { bg: string; fg: string }> = {
  INVEST: { bg: "oklch(94% 0.05 155)", fg: "oklch(34% 0.14 155)" },
  CANCEL: { bg: "oklch(95% 0.04 25)",  fg: "oklch(38% 0.18 25)"  },
  SAVE:   { bg: "oklch(94% 0.04 260)", fg: "oklch(40% 0.14 260)" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

const MONTH = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Font loader ──────────────────────────────────────────────────────────────

function FontLoader() {
  return <link rel="stylesheet" href={FONT_LINK} crossOrigin="anonymous" />;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: c.bg, width: "100%", padding: "28px 24px", boxSizing: "border-box" }}>
      <style>{`@keyframes shimmer{0%{opacity:1}50%{opacity:.4}100%{opacity:1}}.sk{background:${c.bgAlt};border-radius:4px;animation:shimmer 1.6s ease-in-out infinite}`}</style>
      <div className="sk" style={{ width: 100, height: 10, marginBottom: 28 }} />
      <div className="sk" style={{ width: "45%", height: 56, marginBottom: 10 }} />
      <div className="sk" style={{ width: "30%", height: 12, marginBottom: 40 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 40 }}>
        {[1,2,3,4].map(i => <div key={i} className="sk" style={{ height: 56 }} />)}
      </div>
      <div className="sk" style={{ width: "100%", height: 160, marginBottom: 32 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[1,2,3].map(i => <div key={i} className="sk" style={{ height: 40 }} />)}
      </div>
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
      color: c.inkSub,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

// ─── 1. Accounts Overview ─────────────────────────────────────────────────────

function AccountsSection({ data }: { data: SummaryData }) {
  return (
    <div style={{ marginBottom: 32 }}>
      {/* Total */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: c.inkSub, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 4 }}>
          Total across all accounts
        </div>
        <div style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: "clamp(36px, 9vw, 52px)",
          lineHeight: 1,
          color: c.ink,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
        }}>
          {fmt(data.total_balance)}
        </div>
      </div>

      {/* Account rows */}
      <div style={{ borderTop: `1px solid ${c.rule}` }}>
        {data.accounts.map((acc) => {
          const accent = ACCOUNT_HUE[acc.id] ?? c.inkSub;
          return (
            <div
              key={acc.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: `1px solid ${c.rule}`,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: `color-mix(in oklch, ${accent} 12%, ${c.bg})`,
                border: `1px solid color-mix(in oklch, ${accent} 28%, transparent)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: accent,
                letterSpacing: "0.04em",
                flexShrink: 0,
              }}>
                {initials(acc.name)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.ink }}>{acc.name}</div>
                <div style={{ fontSize: 11, color: c.inkSub, textTransform: "capitalize" as const }}>{acc.type}</div>
              </div>

              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: c.ink,
                fontVariantNumeric: "tabular-nums",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {fmt(acc.balance)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 2. Recent Expenses ───────────────────────────────────────────────────────

function ExpensesSection({ data }: { data: SummaryData }) {
  const SOURCE_HUE: Record<string, string> = {
    Revolut:  ACCOUNT_HUE.revolut,
    PayPal:   ACCOUNT_HUE.paypal,
    UniCredit: ACCOUNT_HUE.unicredit,
    Intesa:   ACCOUNT_HUE.intesa,
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <SectionLabel>Recent expenses</SectionLabel>
      <div style={{ borderTop: `1px solid ${c.rule}` }}>
        {data.recent_expenses.map((tx) => {
          const accentHue = SOURCE_HUE[tx.source] ?? c.inkSub;
          return (
            <div
              key={tx.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: `1px solid ${c.rule}`,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {/* Date */}
              <div style={{ flexShrink: 0, width: 30, textAlign: "center" as const }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.ink, lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  {new Date(tx.date).getDate()}
                </div>
                <div style={{ fontSize: 9, fontWeight: 600, color: c.inkSub, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginTop: 2 }}>
                  {MONTH[new Date(tx.date).getMonth()]}
                </div>
              </div>

              {/* Description + source */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.ink, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {tx.description}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: accentHue,
                    background: `color-mix(in oklch, ${accentHue} 10%, ${c.bg})`,
                    padding: "1px 6px",
                    borderRadius: 3,
                  }}>
                    {tx.source}
                  </span>
                  <span style={{ fontSize: 11, color: c.inkSub }}>{tx.category}</span>
                </div>
              </div>

              {/* Amount */}
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: c.negNum,
                fontVariantNumeric: "tabular-nums",
                flexShrink: 0,
              }}>
                −{fmt(Math.abs(tx.amount))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 3. Donut Chart ───────────────────────────────────────────────────────────

function DonutChart({ data }: { data: SummaryData }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const cats = data.spending_by_category;
  const total = cats.reduce((s, c) => s + c.amount, 0);

  // Build SVG arcs
  const R = 70;       // outer radius
  const r = 42;       // inner radius (donut hole)
  const CX = 90;
  const CY = 90;
  const POP = 7;      // how many px a slice pops out on hover

  function polar(cx: number, cy: number, radius: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function describeArc(startDeg: number, endDeg: number, pop: boolean, midAngle: number) {
    const gap = 1.2; // degrees gap between slices
    const s = startDeg + gap / 2;
    const e = endDeg - gap / 2;

    let dx = 0, dy = 0;
    if (pop) {
      const rad = ((midAngle - 90) * Math.PI) / 180;
      dx = POP * Math.cos(rad);
      dy = POP * Math.sin(rad);
    }

    const start = polar(CX + dx, CY + dy, R, s);
    const end   = polar(CX + dx, CY + dy, R, e);
    const inner1 = polar(CX + dx, CY + dy, r, e);
    const inner2 = polar(CX + dx, CY + dy, r, s);
    const large = e - s > 180 ? 1 : 0;

    return `M ${start.x} ${start.y} A ${R} ${R} 0 ${large} 1 ${end.x} ${end.y} L ${inner1.x} ${inner1.y} A ${r} ${r} 0 ${large} 0 ${inner2.x} ${inner2.y} Z`;
  }

  // Build slices
  let cursor = 0;
  const slices = cats.map((cat) => {
    const frac = total > 0 ? cat.amount / total : 0;
    const sweep = frac * 360;
    const mid = cursor + sweep / 2;
    const path = describeArc(cursor, cursor + sweep, hovered === cat.id, mid);
    cursor += sweep;
    return { ...cat, frac, mid, path };
  });

  const hoveredCat = slices.find((s) => s.id === hovered);

  return (
    <div style={{ marginBottom: 32 }}>
      <SectionLabel>Spending by category</SectionLabel>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* SVG Donut */}
        <div style={{ flexShrink: 0, position: "relative" as const }}>
          <svg
            width={180}
            height={180}
            viewBox="0 0 180 180"
            style={{ display: "block", overflow: "visible" }}
          >
            {slices.map((s) => (
              <path
                key={s.id}
                d={s.path}
                fill={s.color}
                opacity={hovered && hovered !== s.id ? 0.35 : 1}
                style={{
                  cursor: "pointer",
                  transition: "opacity 150ms ease, d 150ms ease",
                }}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}

            {/* Center label */}
            <text
              x={CX}
              y={CY - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 15,
                fill: c.ink,
                fontVariantNumeric: "tabular-nums",
                transition: "all 100ms ease",
                pointerEvents: "none",
              }}
            >
              {hoveredCat ? fmt(hoveredCat.amount) : fmt(total)}
            </text>
            <text
              x={CX}
              y={CY + 10}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 8.5,
                fill: c.inkSub,
                transition: "all 100ms ease",
                pointerEvents: "none",
              }}
            >
              {hoveredCat ? hoveredCat.label : "total spending"}
            </text>
            {hoveredCat && (
              <text
                x={CX}
                y={CY + 22}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 8,
                  fill: hoveredCat.color,
                  fontWeight: 700,
                  pointerEvents: "none",
                }}
              >
                {Math.round(hoveredCat.frac * 100)}%
              </text>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, gap: 0 }}>
          {slices.map((s) => {
            const isHov = hovered === s.id;
            const dimmed = hovered !== null && !isHov;
            return (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 0",
                  borderBottom: `1px solid ${c.rule}`,
                  opacity: dimmed ? 0.4 : 1,
                  transition: "opacity 150ms ease",
                  cursor: "default",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Color swatch */}
                <span style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: s.color,
                  flexShrink: 0,
                  transition: "transform 150ms ease",
                  transform: isHov ? "scale(1.4)" : "scale(1)",
                }} />
                <span style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: isHov ? 700 : 500,
                  color: isHov ? c.ink : c.inkMid,
                  transition: "font-weight 100ms ease, color 100ms ease",
                }}>
                  {s.label}
                </span>
                <span style={{
                  fontSize: 11,
                  color: c.inkSub,
                  fontVariantNumeric: "tabular-nums",
                  marginRight: 6,
                }}>
                  {Math.round(s.frac * 100)}%
                </span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isHov ? s.color : c.ink,
                  fontVariantNumeric: "tabular-nums",
                  transition: "color 100ms ease",
                  minWidth: 60,
                  textAlign: "right" as const,
                }}>
                  {fmt(s.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 4. Insights ──────────────────────────────────────────────────────────────

function InsightsSection({ data }: { data: SummaryData }) {
  return (
    <div>
      <SectionLabel>Insights &amp; tips</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0, borderTop: `1px solid ${c.rule}` }}>
        {data.insights.map((card) => {
          const palette = BADGE_PALETTE[card.badge] ?? { bg: c.bgAlt, fg: c.inkMid };
          return (
            <div
              key={card.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "11px 0",
                borderBottom: `1px solid ${c.rule}`,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {/* Badge */}
              <span style={{
                flexShrink: 0,
                marginTop: 1,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "3px 7px",
                borderRadius: 4,
                background: palette.bg,
                color: palette.fg,
                border: `1px solid color-mix(in oklch, ${palette.fg} 20%, transparent)`,
              }}>
                {card.badge}
              </span>
              {/* Body */}
              <span style={{ fontSize: 12, color: c.inkMid, lineHeight: 1.5 }}>
                {card.body}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Root Widget ──────────────────────────────────────────────────────────────

function SummaryWidget() {
  const { output } = useToolInfo<"get_summary">();
  const data = output as unknown as SummaryData | undefined;

  return (
    <>
      <FontLoader />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${c.bg}; }
        svg path { will-change: opacity; }
      `}</style>

      {!data ? (
        <Skeleton />
      ) : (
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            background: c.bg,
            width: "100%",
            padding: "28px 24px 44px",
            color: c.ink,
          }}
        >
          {/* Wordmark */}
          <div style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 13,
            color: c.inkSub,
            letterSpacing: "0.05em",
            marginBottom: 28,
          }}>
            MiTo
          </div>

          <AccountsSection data={data} />
          <ExpensesSection data={data} />
          <DonutChart data={data} />
          <InsightsSection data={data} />
        </div>
      )}
    </>
  );
}

export default SummaryWidget;

mountWidget(<SummaryWidget />);
