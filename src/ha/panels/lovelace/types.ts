import { HomeAssistant } from "../../types";
import { LovelaceCardConfig, LovelaceConfig } from "../../data/lovelace";

export interface LovelaceCardEditor extends LovelaceGenericElementEditor {
  setConfig(config: LovelaceCardConfig): void;
}

export interface LovelaceGenericElementEditor extends HTMLElement {
  hass?: HomeAssistant;
  lovelace?: LovelaceConfig;
  setConfig(config: any): void;
  focusYamlEditor?: () => void;
}
