import React from "react";
import type { StellaSlide5_0 as StellaSlide5_0Type, StellaSlideChild, StellaSlideObject } from "./types";

const FALLBACK = "Donnée non disponible (TBD)";

const STYLE_KEY_MAP: Record<string, keyof React.CSSProperties> = {
  font_size: "fontSize",
  font_weight: "fontWeight",
  font_family: "fontFamily",
  font_style: "fontStyle",
  color: "color",
  background: "background",
  background_color: "backgroundColor",
  border: "border",
  border_radius: "borderRadius",
  padding: "padding",
  margin: "margin",
  opacity: "opacity",
  letter_spacing: "letterSpacing",
  line_height: "lineHeight",
  text_transform: "textTransform",
  text_align: "textAlign",
  box_shadow: "boxShadow",
  display: "display",
  align_items: "alignItems",
  justify_content: "justifyContent",
  flex_direction: "flexDirection",
  gap: "gap",
  z_index: "zIndex",
};

const PX_KEYS = new Set(["fontSize", "borderRadius", "padding", "margin", "gap"]);

function styleFromObject(style?: Record<string, unknown>): React.CSSProperties {
  if (!style) return {};
  const out: React.CSSProperties = {};
  for (const [key, value] of Object.entries(style)) {
    const mapped = STYLE_KEY_MAP[key];
    if (!mapped) continue;
    if (value == null) continue;
    if (PX_KEYS.has(mapped) && typeof value === "number") {
      (out as Record<string, unknown>)[mapped] = `${value}px`;
    } else {
      (out as Record<string, unknown>)[mapped] = value;
    }
  }
  return out;
}

// ─── ChildRenderer ────────────────────────────────────────────────────────────

function ChildRenderer({ child }: { child: StellaSlideChild }) {
  if (child.role === "badge") {
    return (
      <div
        style={{
          display: "inline-block",
          marginTop: "4px",
          padding: "2px 7px",
          fontSize: "10px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--stella-warn, #FF9900)",
          border: "1px solid currentColor",
          borderRadius: "3px",
          lineHeight: 1.6,
          alignSelf: "flex-start",
        }}
      >
        {child.text ?? "estimation"}
      </div>
    );
  }

  const style: React.CSSProperties = {
    display: "block",
    width: "100%",
    overflowWrap: "break-word",
    wordBreak: "break-word",
    lineHeight: 1.25,
    ...styleFromObject(child.style),
  };
  return <div style={style}>{child.text ?? FALLBACK}</div>;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCardRenderer({ obj, baseStyle }: { obj: StellaSlideObject; baseStyle: React.CSSProperties }) {
  const children = obj.children || [];
  const label = children.find(c => c.role === "label");
  const value = children.find(c => c.role === "value");
  const trend = children.find(c => c.role === "trend");
  const badge = children.find(c => c.role === "badge");

  return (
    <div
      className="stella-5-0-object"
      data-object-type="kpi_card"
      data-object-id={obj.id}
      style={{
        ...baseStyle,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "4px",
        padding: "20px 24px",
        ...styleFromObject(obj.style),
      }}
    >
      {label && (
        <div style={{
          fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em",
          textTransform: "uppercase", color: "var(--text-muted, #64748B)", lineHeight: 1.2,
          ...styleFromObject(label.style),
        }}>
          {label.text}
        </div>
      )}
      {value && (
        <div style={{
          fontSize: "42px", fontWeight: 800, lineHeight: 1.1,
          color: "var(--primary-color, #1A5BA0)",
          ...styleFromObject(value.style),
        }}>
          {value.text}
        </div>
      )}
      {trend && (
        <div style={{
          fontSize: "13px", fontWeight: 500, color: "var(--text-muted, #64748B)",
          lineHeight: 1.3,
          ...styleFromObject(trend.style),
        }}>
          {trend.text}
        </div>
      )}
      {badge && (
        <div style={{
          display: "inline-block", fontSize: "10px", fontWeight: 600,
          color: "var(--stella-warn, #FF9900)", border: "1px solid var(--stella-warn, #FF9900)",
          borderRadius: "3px", padding: "1px 5px", marginTop: "4px",
          alignSelf: "flex-start",
        }}>
          {badge.text || "estimation"}
        </div>
      )}
    </div>
  );
}

// ─── SWOT Quadrant ────────────────────────────────────────────────────────────

function SwotQuadrantRenderer({ obj, baseStyle }: { obj: StellaSlideObject; baseStyle: React.CSSProperties }) {
  const children = obj.children || [];
  const labelEl = children.find(c => c.role === "label");
  const scoreEl = children.find(c => c.role === "score");
  const bullets = children.filter(c => c.role === "bullet");

  const isPositive = labelEl?.text && ["Forces", "Opportunités"].includes(labelEl.text);
  const accent = isPositive ? "var(--primary-color, #1A5BA0)" : "var(--stella-warn, #CC6600)";

  return (
    <div
      className="stella-5-0-object"
      data-object-type="swot_quadrant"
      data-object-id={obj.id}
      style={{
        ...baseStyle,
        background: isPositive ? "#f0f7ff" : "#fff8f0",
        borderRadius: "8px",
        border: `2px solid ${isPositive ? "rgba(26,91,160,0.15)" : "rgba(255,153,0,0.2)"}`,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        ...styleFromObject(obj.style),
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {labelEl && (
          <div style={{ fontSize: "14px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {labelEl.text}
          </div>
        )}
        {scoreEl && (
          <div style={{ fontSize: "22px", fontWeight: 800, color: accent }}>
            {scoreEl.text}
          </div>
        )}
      </div>
      <div style={{ width: "100%", height: "1px", background: "rgba(0,0,0,0.08)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, overflow: "hidden" }}>
        {bullets.map((b, i) => (
          <div key={i} style={{ fontSize: "13px", lineHeight: 1.5, color: "#333", ...styleFromObject(b.style) }}>
            {b.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Bullet List ──────────────────────────────────────────────────────────────

function BulletListRenderer({ obj, baseStyle }: { obj: StellaSlideObject; baseStyle: React.CSSProperties }) {
  const bullets = obj.children || [];
  return (
    <div
      className="stella-5-0-object"
      data-object-type="bullet_list"
      data-object-id={obj.id}
      style={{ ...baseStyle, display: "flex", flexDirection: "column", gap: "10px", ...styleFromObject(obj.style) }}
    >
      {bullets.map((b, i) => (
        <div key={i} style={{ fontSize: "15px", lineHeight: 1.6, color: "#222", ...styleFromObject(b.style) }}>
          {b.text}
        </div>
      ))}
    </div>
  );
}

// ─── Score Badge / Verdict Badge ──────────────────────────────────────────────

function ScoreBadgeRenderer({ obj, baseStyle }: { obj: StellaSlideObject; baseStyle: React.CSSProperties }) {
  const isVerdict = obj.data_object_type === "verdict_badge";
  return (
    <div
      className="stella-5-0-object"
      data-object-type={obj.data_object_type}
      data-object-id={obj.id}
      style={{
        ...baseStyle,
        background: isVerdict ? "var(--primary-color, #1A5BA0)" : "transparent",
        borderRadius: isVerdict ? "8px" : "0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...styleFromObject(obj.style),
      }}
    >
      <span style={{
        fontSize: isVerdict ? "28px" : "56px",
        fontWeight: 900,
        color: isVerdict ? "white" : "var(--primary-color, #1A5BA0)",
        letterSpacing: isVerdict ? "0.04em" : "0",
      }}>
        {obj.text || "—"}
      </span>
    </div>
  );
}

// ─── Score Bars ───────────────────────────────────────────────────────────────

function ScoreBarsRenderer({ obj, baseStyle }: { obj: StellaSlideObject; baseStyle: React.CSSProperties }) {
  const items = obj.children || [];
  return (
    <div
      className="stella-5-0-object"
      data-object-type="score_bars"
      data-object-id={obj.id}
      style={{ ...baseStyle, display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "16px 20px", ...styleFromObject(obj.style) }}
    >
      {items.map((item, i) => {
        const parts = (item.text || "").split(":");
        const label = parts[0]?.trim() || "";
        const scorePart = parts[1]?.trim() || "";
        const score = parseInt(scorePart) || 0;
        const barColor = score >= 70 ? "#00CC66" : score >= 50 ? "#FF9900" : "#FF3333";
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, color: "#444" }}>
              <span>{label}</span>
              <span style={{ color: "var(--primary-color, #1A5BA0)", fontWeight: 700 }}>{scorePart}</span>
            </div>
            <div style={{ height: "6px", background: "#eee", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${score}%`, background: barColor, borderRadius: "3px" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Competitor Card ──────────────────────────────────────────────────────────

function CompetitorCardRenderer({ obj, baseStyle }: { obj: StellaSlideObject; baseStyle: React.CSSProperties }) {
  const children = obj.children || [];
  const title = children.find(c => c.role === "title");
  const items = children.filter(c => c.role === "item");
  const note = children.find(c => c.role === "note");

  return (
    <div
      className="stella-5-0-object"
      data-object-type="competitor_card"
      data-object-id={obj.id}
      style={{ ...baseStyle, display: "flex", flexDirection: "column", gap: "12px", padding: "20px 24px", ...styleFromObject(obj.style) }}
    >
      {title && (
        <div style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#666" }}>
          {title.text}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        {items.map((item, i) => (
          <div key={i} style={{ fontSize: "14px", color: "#222", lineHeight: 1.4 }}>{item.text}</div>
        ))}
      </div>
      {note && (
        <div style={{ fontSize: "12px", color: "#888", fontStyle: "italic", borderTop: "1px solid #eee", paddingTop: "8px" }}>
          {note.text}
        </div>
      )}
    </div>
  );
}

// ─── Highlight Box ────────────────────────────────────────────────────────────

function HighlightBoxRenderer({ obj, baseStyle }: { obj: StellaSlideObject; baseStyle: React.CSSProperties }) {
  return (
    <div
      className="stella-5-0-object"
      data-object-type="highlight_box"
      data-object-id={obj.id}
      style={{
        ...baseStyle,
        background: "rgba(26, 91, 160, 0.08)",
        borderRadius: "8px",
        borderLeft: "4px solid var(--primary-color, #1A5BA0)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        ...styleFromObject(obj.style),
      }}
    >
      <span style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a", lineHeight: 1.5 }}>
        {obj.text || (obj.children || []).map(c => c.text).join(" ")}
      </span>
    </div>
  );
}

// ─── KPI List ────────────────────────────────────────────────────────────────

function KpiListRenderer({ obj, baseStyle }: { obj: StellaSlideObject; baseStyle: React.CSSProperties }) {
  const items: Array<{ label: string; value: string; fallback_used?: boolean }> =
    (obj as any).items || obj.children || [];
  return (
    <div
      className="stella-5-0-object"
      data-object-type="kpi_list"
      data-object-id={obj.id}
      style={{ ...baseStyle, background: "#f8f9fa", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px", ...styleFromObject(obj.style) }}
    >
      {items.map((item: any, i: number) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 12px", background: "white", borderRadius: "6px",
          borderLeft: `3px solid ${item.fallback_used ? "#FF9900" : "var(--primary-color, #1A5BA0)"}`,
        }}>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "#444", flex: 1 }}>
            {item.label || item.text}
          </span>
          <span style={{ fontSize: "15px", fontWeight: 700, marginLeft: "12px", color: item.fallback_used ? "#FF9900" : "var(--primary-color, #1A5BA0)" }}>
            {item.value}
          </span>
          {item.fallback_used && (
            <span style={{ fontSize: "10px", color: "#FF9900", border: "1px solid #FF9900", borderRadius: "3px", padding: "1px 4px", marginLeft: "6px" }}>
              est.
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Shape pure ou Shape avec enfants ────────────────────────────────────────

function ShapeWithChildrenRenderer({ obj, baseStyle }: { obj: StellaSlideObject; baseStyle: React.CSSProperties }) {
  return (
    <div
      className="stella-5-0-object"
      data-object-type="shape"
      data-object-id={obj.id}
      style={{
        ...baseStyle,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "6px",
        padding: "20px 24px",
        ...styleFromObject(obj.style),
      }}
    >
      {obj.text && <div style={{ fontSize: "16px", color: "#222" }}>{obj.text}</div>}
      {(obj.children || []).map((child, i) => (
        <ChildRenderer key={i} child={child} />
      ))}
    </div>
  );
}

// ─── Chart placeholder ────────────────────────────────────────────────────────

function ChartRenderer({ obj, baseStyle }: { obj: StellaSlideObject; baseStyle: React.CSSProperties }) {
  return (
    <div
      className="stella-5-0-object stella-5-0-chart-placeholder"
      data-object-type="chart"
      data-object-id={obj.id}
      data-chart-id={obj.chart_id || ""}
      style={{
        ...baseStyle,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "12px",
        background: "var(--bg-light, #F8FAFC)",
        border: "2px dashed rgba(26, 91, 160, 0.18)",
        borderRadius: "8px",
        color: "var(--text-muted, #64748B)",
        fontFamily: "var(--stella-font, Inter, Arial, sans-serif)",
        fontSize: "14px",
      }}
    >
      <span style={{ fontSize: "32px", opacity: 0.4 }}>📊</span>
      <span style={{ opacity: 0.5 }}>{obj.chart_id || "chart"}</span>
    </div>
  );
}

// ─── Textbox ──────────────────────────────────────────────────────────────────

function TextboxRenderer({ obj, baseStyle }: { obj: StellaSlideObject; baseStyle: React.CSSProperties }) {
  return (
    <div
      className="stella-5-0-object"
      data-object-type="textbox"
      data-object-id={obj.id}
      style={{ ...baseStyle, overflowWrap: "break-word", wordBreak: "break-word", ...styleFromObject(obj.style) }}
    >
      {obj.text}
    </div>
  );
}

// ─── ObjectRenderer (switch sur le type) ─────────────────────────────────────

function ObjectRenderer({ obj }: { obj: StellaSlideObject }) {
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${obj.left}px`,
    top: `${obj.top}px`,
    width: `${obj.width}px`,
    height: `${obj.height}px`,
    boxSizing: "border-box",
    overflow: "hidden",
  };

  switch (obj.data_object_type) {
    case "kpi_card":
      return <KpiCardRenderer obj={obj} baseStyle={baseStyle} />;

    case "swot_quadrant":
      return <SwotQuadrantRenderer obj={obj} baseStyle={baseStyle} />;

    case "bullet_list":
      return <BulletListRenderer obj={obj} baseStyle={baseStyle} />;

    case "score_badge":
    case "verdict_badge":
      return <ScoreBadgeRenderer obj={obj} baseStyle={baseStyle} />;

    case "score_bars":
      return <ScoreBarsRenderer obj={obj} baseStyle={baseStyle} />;

    case "competitor_card":
      return <CompetitorCardRenderer obj={obj} baseStyle={baseStyle} />;

    case "highlight_box":
      return <HighlightBoxRenderer obj={obj} baseStyle={baseStyle} />;

    case "kpi_list":
      return <KpiListRenderer obj={obj} baseStyle={baseStyle} />;

    case "chart":
    case "image":
    case "icon":
      return <ChartRenderer obj={obj} baseStyle={baseStyle} />;

    case "shape": {
      const isShapeOnly = !obj.children?.length && !obj.text;
      if (isShapeOnly) {
        return (
          <div
            className="stella-5-0-object"
            data-object-type="shape"
            data-object-id={obj.id}
            style={{ ...baseStyle, padding: 0, ...styleFromObject(obj.style) }}
          />
        );
      }
      return <ShapeWithChildrenRenderer obj={obj} baseStyle={baseStyle} />;
    }

    case "textbox":
    default:
      return <TextboxRenderer obj={obj} baseStyle={baseStyle} />;
  }
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function StellaSlide5_0({
  slide,
  debug = false,
}: {
  slide: StellaSlide5_0Type;
  debug?: boolean;
}) {
  const bgStyle: React.CSSProperties =
    slide.background === "dark"
      ? { background: "var(--bg-dark, #0F172A)", color: "#FFFFFF" }
      : { background: "white" };

  return (
    <div
      className={`stella-5-0-slide-container${debug ? " stella-5-0-debug-on" : ""}`}
      data-background={slide.background}
      data-slide-id={slide.slide_id}
      data-brand={((slide as any).brand_slug) || ""}
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",
        overflow: "hidden",
        ...bgStyle,
      }}
    >
      {slide.objects.map((obj) => (
        <ObjectRenderer key={obj.id} obj={obj} />
      ))}
    </div>
  );
}
