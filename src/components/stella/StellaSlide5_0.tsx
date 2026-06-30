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
          <div style={{ fontSize: "14px", fontWeight: 700, color: acce