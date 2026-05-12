import { HassEntity } from "home-assistant-js-websocket";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import {
  HomeAssistant,
  LovelaceCardFeature,
  LovelaceCardFeatureContext,
  LovelaceCardFeatureEditor,
  LovelaceCardFeaturePosition,
} from "../ha";
import { ButtonsCardFeatureConfig } from "./buttons-config";

@customElement("buttons-card-feature")
export class ButtonsCardFeature
  extends LitElement
  implements LovelaceCardFeature
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public context?: LovelaceCardFeatureContext;

  @property() public color?: string;

  @property() public position?: LovelaceCardFeaturePosition;

  @state() private _config?: ButtonsCardFeatureConfig;

  public static async getConfigElement(): Promise<LovelaceCardFeatureEditor> {
    await import("./buttons-editor");
    return document.createElement(
      "buttons-card-feature-editor"
    ) as LovelaceCardFeatureEditor;
  }

  static getStubConfig(): ButtonsCardFeatureConfig {
    return {
      type: "custom:buttons-card-feature",
    };
  }

  public setConfig(config: ButtonsCardFeatureConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = config;
  }

  private _click(ev: Event & { target: HTMLElement & { entityId: string } }) {
    const entityId = ev.target.entityId;
    const domain = entityId.split(".")[0];
    if (domain === "button") {
      this.hass?.callService("button", "press", { entity_id: entityId });
      return;
    }
    if (domain === "script") {
      this.hass?.callService("script", "turn_on", { entity_id: entityId });
      return;
    }
  }

  protected render() {
    if (!this._config || !this.hass) {
      return nothing;
    }

    const buttonsStateObj = this._config.buttons
      ?.map((entityId) => this.hass!.states[entityId])
      .filter((stateObj): stateObj is HassEntity => Boolean(stateObj));

    if (!buttonsStateObj?.length) return nothing;

    return html`
      <ha-control-button-group>
        ${repeat(
          buttonsStateObj,
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
