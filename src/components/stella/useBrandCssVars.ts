/**
 * Injecte les CSS vars de marque Stella dans le <head> depuis la réponse slides_5_0.
 *
 * Le backend inclut `css_vars.variables` dans chaque réponse slides,
 * fusionnant le registre statique avec l'override Supabase (company_branding).
 * Ce hook les injecte dans un <style> tag dédié pour que les slides
 * utilisent les bonnes couleurs `var(--stella-primary)` etc.
 *
 * Rétrocompatible : si `css_vars` est absent (anciens clients), le hook
 * charge `/integration/css-vars.css?brand_slug=...` comme avant.
 */

import { useEffect } from "react";
import type { StellaCssVars } from "./types";

const STYLE_ID = "stella-brand-css-vars";

export function useBrandCssVars(
  cssVars: StellaCssVars | undefined,
  brandSlug: string | null | undefined,
  baseUrl: string,
) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (cssVars?.variables && Object.keys(cssVars.variables).length > 0) {
      // Injection directe depuis la réponse slides (priorité)
      const lines = Object.entries(cssVars.variables)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join("\n");
      const css = `:root {\n${lines}\n}`;

      let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ID;
        document.head.appendChild(style);
      }
      style.textContent = css;
      return;
    }

    // Fallback : chargement depuis l'endpoint /css-vars.css (comportement d'origine)
    if (brandSlug) {
      const href = `${baseUrl}/integration/css-vars.css?brand_slug=${encodeURIComponent(brandSlug)}`;
      const LINK_ID = "stella-theme";
      let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.id = LINK_ID;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      if (link.href !== href) link.href = href;
    }
  }, [cssVars, brandSlug, baseUrl]);
}
