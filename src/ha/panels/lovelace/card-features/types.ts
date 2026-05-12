import { HassEntity } from "home-assistant-js-websocket";
import {
  LovelaceCardFeatureConfig,
  LovelaceCardFeatureContext,
  LovelaceCardFeaturePosition,
} from "../../../data/lovelace/config/card_features";
import { HomeAssistant } from "../../../types";
import { LovelaceGenericElementEditor } from "../types";

export interface LovelaceCardFeature extends HTMLElement {
  hass?: HomeAssistant;
  /** @deprecated Use `context` instead */
  stateObj?: HassEntity;
  context?: LovelaceCardFeatureContext;
  color?: string;
  position?: LovelaceCardFeaturePosition;
  setConfig(config: LovelaceCardFeatureConfig): void;
}

export interface LovelaceCardFeatureEditor extends LovelaceGenericElementEditor {
  setConfig(config: LovelaceCardFeatureConfig): void;
}

export interface LovelaceCardFeatureConstructor {
  new (...args: any[]): LovelaceCardFeature;
  getStubConfig?: (
    hass: HomeAssistant,
    context?: LovelaceCardFeatureContext
  ) => LovelaceCardFeatureConfig;
  getConfigElement?: () => LovelaceCardFeatureEditor;
  isSupported?: (stateObj?: HassEntity) => boolean;
}
