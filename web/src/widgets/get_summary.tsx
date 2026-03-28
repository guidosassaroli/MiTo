import { useState, useEffect, useRef } from "react";
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

// ─── Animated number hook ─────────────────────────────────────────────────────

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function useAnimatedValue(target: number, duration = 600): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    // Cancel any in-flight animation
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    function tick(now: number) {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      setDisplay(from + (target - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return display;
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

function AccountRow({ acc }: { acc: Account }) {
  const animated = useAnimatedValue(acc.balance);
  const prevRef = useRef(acc.balance);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const accent = ACCOUNT_HUE[acc.id] ?? c.inkSub;

  useEffect(() => {
    if (acc.balance !== prevRef.current) {
      setFlash(acc.balance > prevRef.current ? "up" : "down");
      prevRef.current = acc.balance;
      const t = setTimeout(() => setFlash(null), 900);
      return () => clearTimeout(t);
    }
  }, [acc.balance]);

  const flashColor = flash === "up" ? c.posNum : flash === "down" ? c.negNum : c.ink;

  return (
    <div
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
        color: flashColor,
        fontVariantNumeric: "tabular-nums",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: "color 300ms ease",
      }}>
        {fmt(animated)}
      </div>
    </div>
  );
}

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
        {data.accounts.map((acc) => (
          <AccountRow key={acc.id} acc={acc} />
        ))}
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

function InsightsSection({ data, saved, onSave }: { data: SummaryData; saved: boolean; onSave: () => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div>
      <SectionLabel>Insights &amp; tips</SectionLabel>
      <style>{`
        @keyframes checkPop {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes successFill {
          0%   { opacity: 0; transform: scaleX(0.96) scaleY(0.9); }
          100% { opacity: 1; transform: scaleX(1) scaleY(1); }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {data.insights.map((card) => {
          const palette = BADGE_PALETTE[card.badge] ?? { bg: c.bgAlt, fg: c.inkMid };
          const isSave = card.badge === "SAVE";
          const isHov = hoveredId === card.id;
          const showSuccess = isSave && saved;
          const isInteractive = !showSuccess;

          return (
            <div
              key={card.id}
              role="button"
              tabIndex={0}
              onClick={isSave && !saved ? onSave : undefined}
              onMouseEnter={() => setHoveredId(card.id)}
              onMouseLeave={() => setHoveredId(null)}
              onKeyDown={isSave && !saved ? (e) => { if (e.key === "Enter" || e.key === " ") onSave(); } : undefined}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 10,
                border: showSuccess
                  ? `1.5px solid color-mix(in oklch, ${palette.fg} 40%, transparent)`
                  : `1.5px solid color-mix(in oklch, ${palette.fg} ${isHov ? "28%" : "16%"}, transparent)`,
                background: showSuccess
                  ? `color-mix(in oklch, ${palette.fg} 12%, ${c.surface})`
                  : isHov
                    ? `color-mix(in oklch, ${palette.fg} 7%, ${c.surface})`
                    : c.surface,
                cursor: isInteractive ? "pointer" : "default",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: isHov && !showSuccess
                  ? `0 2px 10px color-mix(in oklch, ${palette.fg} 12%, transparent)`
                  : showSuccess
                    ? `0 2px 14px color-mix(in oklch, ${palette.fg} 18%, transparent)`
                    : "none",
                transform: isHov && !showSuccess ? "translateY(-1px)" : "translateY(0)",
                transition: "background 200ms ease, border-color 200ms ease, box-shadow 200ms ease, transform 150ms ease",
                animation: showSuccess ? "successFill 300ms ease forwards" : undefined,
                overflow: "hidden",
                position: "relative" as const,
              }}
            >
              {showSuccess ? (
                /* ── Success state ── */
                <>
                  <span style={{
                    flexShrink: 0,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: palette.fg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "checkPop 380ms cubic-bezier(0.34,1.56,0.64,1) forwards",
                    marginTop: 1,
                  }}>
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: palette.fg, marginBottom: 2 }}>
                      Transfer queued!
                    </div>
                    <div style={{ fontSize: 11, color: c.inkMid, lineHeight: 1.4 }}>
                      €500 will move to Intesa Sanpaolo Savings shortly.
                    </div>
                  </div>
                </>
              ) : (
                /* ── Default state ── */
                <>
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
                  <span style={{ fontSize: 12, color: c.inkMid, lineHeight: 1.5, flex: 1 }}>
                    {card.body}
                  </span>
                  {/* Arrow hint — all buttons */}
                  <span style={{
                    flexShrink: 0,
                    alignSelf: "center",
                    fontSize: 14,
                    color: `color-mix(in oklch, ${palette.fg} ${isHov ? "80%" : "35%"}, transparent)`,
                    transition: "color 200ms ease, transform 150ms ease",
                    transform: isHov ? "translateX(2px)" : "translateX(0)",
                  }}>
                    →
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Root Widget ──────────────────────────────────────────────────────────────

const SAVE_AMOUNT = 500;

function SummaryWidget() {
  const { output } = useToolInfo<"get_summary">();
  const data = output as unknown as SummaryData | undefined;
  const [saved, setSaved] = useState(false);

  // Derive adjusted data after SAVE transfer (€500 from UniCredit → Intesa Savings)
  const displayData: SummaryData | undefined = data && saved
    ? {
        ...data,
        accounts: data.accounts.map((acc) => {
          if (acc.id === "unicredit")  return { ...acc, balance: acc.balance - SAVE_AMOUNT };
          if (acc.id === "intesa")     return { ...acc, balance: acc.balance + SAVE_AMOUNT };
          return acc;
        }),
        total_balance: data.total_balance, // unchanged — money moved between own accounts
      }
    : data;

  return (
    <>
      <FontLoader />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${c.bg}; }
        svg path { will-change: opacity; }
      `}</style>

      {!displayData ? (
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

          <AccountsSection data={displayData} />
          <ExpensesSection data={displayData} />
          <DonutChart data={displayData} />
          <InsightsSection data={displayData} saved={saved} onSave={() => setSaved(true)} />
        </div>
      )}
    </>
  );
}

export default SummaryWidget;

mountWidget(<SummaryWidget />);
