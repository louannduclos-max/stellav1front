export type StellaCssVariables = Record<string, string>;

export interface StellaMetric {
  key?: string;
  id?: string;
  label?: string;
  name?: string;
  value?: string | number;
  unit?: string;
  optional?: boolean;
  [k: string]: unknown;
}

export interface StellaPack {
  css?: {
    variables?: StellaCssVariables;
    [k: string]: unknown;
  };
  lovable_config?: {
    payload?: {
      metrics?: StellaMetric[];
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  data_endpoints?: {
    preview_html?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}