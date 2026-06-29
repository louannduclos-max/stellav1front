export type StellaSlideChild = {
  role?: string;
  text?: string;
  style?: Record<string, unknown>;
};

export type StellaSlideObject = {
  id: string;
  data_object: true;
  data_object_type:
    | "textbox" | "shape" | "chart" | "image" | "icon"
    | "kpi_card" | "swot_quadrant" | "bullet_list"
    | "score_badge" | "verdict_badge" | "score_bars"
    | "competitor_card" | "highlight_box" | "kpi_list";
  left: number;
  top: number;
  width: number;
  height: number;
  text?: string;
  style?: Record<string, unknown>;
  children?: StellaSlideChild[];
  items?: Array<{
    label: string;
    value: string;
    fallback_used?: boolean;
  }>;
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
  /** study_id créé ou retrouvé par /