export interface LovelaceCardFeatureConfig {
  type: string;
  [key: string]: any;
}

export interface LovelaceCardFeatureContext {
  entity_id?: string;
  area_id?: string;
}

export type LovelaceCardFeaturePosition = "bottom" | "inline";
