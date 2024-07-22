import { HassEntity } from "home-assistant-js-websocket";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { repeat } from "lit/directives/repeat.js";
import { HomeAssistant, LovelaceCardEditor } from "../ha";
import { atLeastHaVersion } from "../utils/utils";
import { ButtonsCardFeatureConfig } from "./buttons-config";

@customElement("buttons-card-feature")
export class ButtonsCardFeature extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public stateObj?: HassEntity;

  @state() public config!: ButtonsCardFeatureConfig;

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./buttons-editor");
    return document.createElement(
      "buttons-card-feature-editor"
    ) as LovelaceCardEditor;
  }

  static getStubConfig(): ButtonsCardFeatureConfig {
    return {
      type: "custom:buttons-card-feature",
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this.config = config;
  }

  private _click(ev) {
    const entityId = ev.target.entityId;
    this.hass?.callService("button", "press", {
      entity_id: entityId,
    });
  }

  render() {
    if (!this.config || !this.hass || !this.stateObj) {
      return nothing;
    }

    const buttonsStateObj = this.config.buttons
      ?.map((entityId) => this.hass!.states[entityId])
      .filter(Boolean);

    if (!buttonsStateObj) return nothing;

    const padding = !atLeastHaVersion(this.hass.config.version, 2024, 8);

    return html`
      <ha-control-button-group class=${classMap({ padding })}>
        ${repeat(
          buttonsStateObj!,
          (stateObj) => stateObj.entity_id,
          (stateObj) =>
            html`
              <ha-control-button
                .entityId=${stateObj.entity_id}
                .label=${stateObj.attributes.friendly_name}
                @click=${this._click}
                .disabled=${stateObj.state === "unavailable"}
              >
                <ha-icon .icon=${stateObj.attributes.icon}></ha-icon>
              </ha-control-button>
            `
        )}
      </ha-control-button-group>
    `;
  }

  static get styles() {
    return css`
      ha-control-button-group {
        --control-button-group-spacing: var(--feature-button-spacing, 12px);
        --control-button-group-thickness: var(--feature-height, 40px);
      }
      ha-control-button-group.padding {
        margin: 0 12px 12px 12px;
      }
    `;
  }
}

const windowWithCards = window as unknown as Window & {
  customCardFeatures: unknown[];
};
windowWithCards.customCardFeatures = windowWithCards.customCardFeatures || [];
windowWithCards.customCardFeatures.push({
  type: "buttons-card-feature",
  name: "Buttons 🍄",
  configurable: true,
});
