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

const PX_KEYS = new Set([
  "fontSize",
  "borderRadius",
  "padding",
  "margin",
  "gap",
]);

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
          color: "var(--text-muted)",
          border: "1px solid currentColor",
          borderRadius: "4px",
          opacity: 0.6,
          lineHeight: 1.6,
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

function ObjectRenderer({ obj }: { obj: StellaSlideObject }) {
  const userStyle = styleFromObject(obj.style);
  const isShapeOnly =
    obj.data_object_type === "shape" && (obj.children?.length || 0) === 0 && !obj.text;

  if (obj.data_object_type === "chart") {
    return (
      <div
        className="stella-5-0-object stella-5-0-chart-placeholder"
        data-object="true"
        data-object-type="chart"
        data-object-id={obj.id}
        data-chart-id={obj.chart_id || ""}
        style={{
          position: "absolute",
          left: `${obj.left}px`,
          top: `${obj.top}px`,
          width: `${obj.width}px`,
          height: `${obj.height}px`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
          background: "var(--bg-light)",
          border: "2px dashed rgba(26, 91, 160, 0.18)",
          borderRadius: "8px",
          color: "var(--text-muted)",
          fontFamily: "var(--stella-font, Inter, Arial, sans-serif)",
          fontSize: "14px",
          overflow: "hidden",
        }}
      >
        <span style={{ fontSize: "32px", opacity: 0.4 }}>📊</span>
        <span style={{ opacity: 0.5 }}>{obj.chart_id || "chart"}</span>
      </div>
    );
  }


  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${obj.left}px`,
    top: `${obj.top}px`,
    width: `${obj.width}px`,
    height: `${obj.height}px`,
    boxSizing: "border-box",
    overflow: "hidden",
    overflowWrap: "break-word",
    wordBreak: "break-word",
    lineHeight: 1.3,
    // Default flex layout so KPI cards / textboxes center their content nicely.
    display: isShapeOnly ? "block" : (userStyle.display as React.CSSProperties["display"]) || "flex",
    flexDirection:
      (userStyle.flexDirection as React.CSSProperties["flexDirection"]) || "column",
    justifyContent:
      (userStyle.justifyContent as React.CSSProperties["justifyContent"]) || "center",
    alignItems:
      (userStyle.alignItems as React.CSSProperties["alignItems"]) || "flex-start",
    gap: (userStyle.gap as React.CSSProperties["gap"]) ?? 8,
    padding: (userStyle.padding as React.CSSProperties["padding"]) ?? 16,
    ...userStyle,
  };

  if (isShapeOnly) {
    return (
      <div
        className="stella-5-0-object"
        data-object="true"
        data-object-type={obj.data_object_type}
        data-object-id={obj.id}
        style={{ ...baseStyle, padding: 0 }}
      />
    );
  }

  return (
    <div
      className="stella-5-0-object"
      data-object="true"
      data-object-type={obj.data_object_type}
      data-object-id={obj.id}
      style={baseStyle}
    >
      {obj.text ? (
        <div
          style={{
            display: "block",
            width: "100%",
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          {obj.text}
        </div>
      ) : null}
      {(obj.children ?? []).map((child, idx) => (
        <ChildRenderer key={idx} child={child} />
      ))}
    </div>
  );
}

export default function StellaSlide5_0({
  slide,
  debug,
}: {
  slide: StellaSlide5_0Type;
  debug?: boolean;
}) {
  const { canvas, objects, background } = slide;
  return (
    <div
      className={`stella-5-0-slide stella-5-0-bg-${background}`}
      data-slide-id={slide.slide_id}
      data-debug={debug ? "true" : undefined}
      style={{
        position: "relative",
        width: `${canvas.width}px`,
        height: `${canvas.height}px`,
        overflow: "hidden",
      }}
    >
      {objects.map((obj) => (
        <ObjectRenderer key={obj.id} obj={obj} />
      ))}
    </div>
  );
}