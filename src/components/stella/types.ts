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
};

export type StellaSlides5_0Payload = {
  version: string;
  study_id: string;
  canvas: { width: number; height: number };
  slides: StellaSlide5_0[];
};

export type StellaQAReport = {
  slide_id: string;
  overlap_violations: Array<{ a: string; b: string }>;
  text_violations: string[];
  whitespace_compliant: boolean;
  whitespace_ratio: number;
};