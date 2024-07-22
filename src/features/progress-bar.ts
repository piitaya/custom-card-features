import { HassEntity } from "home-assistant-js-websocket";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { HomeAssistant } from "../ha";
import { atLeastHaVersion } from "../utils/utils";

const supportProgressCardFeature = (stateObj: HassEntity) => {
  const domain = stateObj.entity_id.split(".")[0];
  return domain === "sensor";
};

@customElement("progress-bar-card-feature")
export class ProgressCardFeature extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public stateObj?: HassEntity;

  @state() public config!: any;

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this.config = config;
  }

  render() {
    if (
      !this.config ||
      !this.hass ||
      !this.stateObj ||
      !supportProgressCardFeature(this.stateObj)
    ) {
      return nothing;
    }

    const state = Number(this.stateObj.state);
    const value = isNaN(state) ? 0 : state;

    const padding = !atLeastHaVersion(this.hass.config.version, 2024, 8);

    return html`
      <div class="progress-container ${classMap({ padding })}">
        <div class="progress-bar-background"></div>
        <div
          class="progress-bar"
          style=${styleMap({
            "--value": value.toString(),
          })}
        ></div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .progress-container {
        position: relative;
        display: block;
        height: var(--feature-height, 40px);
        border-radius: var(--feature-border-radius, 10px);
        overflow: hidden;
      }
      .progress-container.padding {
        margin: 0 12px 12px 12px;
      }
      .progress-bar-background {
        position: absolute;
        top: 0;
        left: 0;
        background-color: var(--feature-color);
        width: 100%;
        height: 100%;
        opacity: 0.2;
      }
      .progress-bar {
        height: 100%;
        width: 100%;
        transition: transform 180ms ease-in-out;
        transform: scaleX(calc(var(--value) / 100));
        transform-origin: 0 0;
        background-color: var(--feature-color);
      }
    `;
  }
}

const windowWithCards = window as unknown as Window & {
  customCardFeatures: unknown[];
};
windowWithCards.customCardFeatures = windowWithCards.customCardFeatures || [];
windowWithCards.customCardFeatures.push({
  type: "progress-bar-card-feature",
  name: "Progress Bar 🍄",
  supported: supportProgressCardFeature, // Optional
  configurable: false, // Optional - defaults to false
});
