import { useEffect } from "react";
import type { StellaCssVariables } from "@/types/stella-pack";

interface Props {
  vars?: StellaCssVariables;
  scope?: string;
}

function escapeCssValue(v: string) {
  return v.replace(/[<>]/g, "");
}

export function BrandStyleInjector({ vars, scope = ":root" }: Props) {
  useEffect(() => {
    if (!vars || Object.keys(vars).length === 0) return;
    const style = document.createElement("style");
    style.setAttribute("data-stella-brand", "");
    const body = Object.entries(vars)
      .map(([k, v]) => `  ${k.startsWith("--") ? k : `--${k}`}: ${escapeCssValue(String(v))};`)
      .join("\n");
    style.textContent = `${scope} {\n${body}\n}`;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, [vars, scope]);
  return null;
}