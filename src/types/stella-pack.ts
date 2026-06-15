export type StellaCssVariables = Record<string, string>;

export type StellaJson =
  | string
  | number
  | boolean
  | null
  | StellaJson[]
  | { [k: string]: StellaJson };

export interface StellaMetric {
  key?: string;
  id?: string;
  label?: string;
  name?: string;
  value?: string | number | null;
  unit?: string;
  optional?: boolean;
  [k: string]: StellaJson | undefined;
}

export interface StellaPack {
  css?: {
    variables?: StellaCssVariables;
    [k: string]: StellaJson | undefined;
  };
  lovable_config?: {
    payload?: {
      metrics?: StellaMetric[];
      [k: string]: StellaJson | undefined;
    };
    [k: string]: StellaJson | undefined;
  };
  data_endpoints?: {
    preview_html?: string;
    [k: string]: StellaJson | undefined;
  };
  [k: string]: StellaJson | undefined;
}