export type StellaSlideChild = {
  role?: string;
  text?: string;
  style?: Record<string, unknown>;
};

export type StellaSlideObject = {
  id: string;
  data_object: true;
  data_object_type: "textbox" | "shape" | "chart" | "image" | "icon";
  left: number;
  top: number;
  width: number;
  height: number;
  text?: string;
  style?: Record<string, unknown>;
  children?: StellaSlideChild[];
  chart_id?: string;
};

export type StellaSlide5_0 = {
  slide_index: number;
  slide_id: string;
  section_id: string;
  title: string;
  layout: string;
  background: "dark" | "light";
  canvas: { width: number; height: number };
  safe_margin: number;
  whitespace_ratio: number;
  whitespace_compliant: boolean;
  expected_kpis: string[];
  slide_data: Record<string, unknown>;
  objects: StellaSlideObject[];
  expected_strings: string[];
  /**
   * Sprint 14e — Chemin B (HTML génératif) : document HTML complet 1280×720
   * généré par le backend (skill + Gemini, validé QA). Présent uniquement si
   * USE_HTML_SLIDE_AGENT=true côté Render ET QA PASS. Null → fallback objets.
   */
  html_content?: string | null;
};

export type StellaCssVars = {
  slug: string | null;
  brand_name: string;
  variables: Record<string, string>;
};

export type StellaSlides5_0Payload = {
  version: string;
  study_id: string;
  tenant_id?: string;
  brand_slug?: string | null;
  canvas: { width: number; height: number };
  /** CSS vars résolus (registre statique fusionné avec override Supabase) — auto-injection */
  css_vars?: StellaCssVars;
  slides: StellaSlide5_0[];
  /** Sections skippées côté backend car tous les slots sont FALLBACK */
  skipped_sections?: string[];
  /** study_id créé ou retrouvé par /auto-slides-5_0 */
  auto_created_study_id?: string;
};

export type StellaQAReport = {
  slide_id: string;
  overlap_violations: Array<{ a: string; b: string }>;
  text_violations: string[];
  whitespace_compliant: boolean;
  whitespace_ratio: number;
};