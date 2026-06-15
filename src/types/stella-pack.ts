export type StellaCssVariables = Record<string, string>;

export interface StellaMetric {
  key?: string;
  id?: string;
  label?: string;
  name?: string;
  value?: string | number | null;
  unit?: string;
  optional?: boolean;
}

export interface StellaPack {
  brand_slug?: string;
  css?: {
    variables?: StellaCssVariables;
  };
  lovable_config?: {
    payload?: {
      metrics?: StellaMetric[];
    };
  };
  data_endpoints?: {
    preview_html?: string;
  };
}