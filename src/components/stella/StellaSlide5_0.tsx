import React from "react";
import type { StellaSlide5_0 as StellaSlide5_0Type, StellaSlideChild, StellaSlideObject } from "./types";

const FALLBACK = "Donnée non disponible (TBD)";

function styleFromObject(style?: Record<string, unknown>): React.CSSProperties {
  if (!style) return {};
  const out: React.CSSProperties = {};
  for (const [key, value] of Object.entries(style)) {
    switch (key) {
      case "font_size":
        out.fontSize = typeof value === "number" ? `${value}px` : (value as string);
        break;
      case "font_weight":
        out.fontWeight = value as number;
        break;
      case "color":
        out.color = value as string;
        break;
      case "background":
        out.background = value as string;
        break;
      case "border":
        out.border = value as string;
        break;
      case "border_radius":
        out.borderRadius = typeof value === "number" ? `${value}px` : (value as string);
        break;
      case "padding":
        out.padding = typeof value === "number" ? `${value}px` : (value as string);
        break;
      case "opacity":
        out.opacity = value as number;
        break;
      case "letter_spacing":
        out.letterSpacing = value as string;
        break;
      case "text_transform":
        out.textTransform = value as React.CSSProperties["textTransform"];
        break;
      default:
        break;
    }
  }
  return out;
}

function ChildRenderer({ child }: { child: StellaSlideChild }) {
  const style: React.CSSProperties = {
    display: "block",
    marginTop: 10,
    ...styleFromObject(child.style),
  };
  return <span style={style}>{child.text || FALLBACK}</span>;
}

function ObjectRenderer({ obj }: { obj: StellaSlideObject }) {
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${obj.left}px`,
    top: `${obj.top}px`,
    width: `${obj.width}px`,
    height: `${obj.height}px`,
    boxSizing: "border-box",
    ...styleFromObject(obj.style),
  };

  if (obj.data_object_type === "shape" && (obj.children?.length || 0) === 0 && !obj.text) {
    return (
      <div
        className="stella-5-0-object"
        data-object-type={obj.data_object_type}
        data-object-id={obj.id}
        style={baseStyle}
      />
    );
  }

  return (
    <div
      className="stella-5-0-object"
      data-object-type={obj.data_object_type}
      data-object-id={obj.id}
      style={baseStyle}
    >
      {obj.text ? <span>{obj.text}</span> : null}
      {(obj.children || []).map((child, idx) => (
        <ChildRenderer key={idx} child={child} />
      ))}
    </div>
  );
}

export default function StellaSlide5_0({ slide }: { slide: StellaSlide5_0Type }) {
  return (
    <div
      className="stella-5-0-slide-container"
      data-background={slide.background}
      data-slide-id={slide.slide_id}
    >
      {slide.objects.map((obj) => (
        <ObjectRenderer key={obj.id} obj={obj} />
      ))}
    </div>
  );
}