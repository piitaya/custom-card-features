import { HassEntity } from "home-assistant-js-websocket";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { HomeAssistant } from "../ha";

const supportProgressTileFeature = (stateObj) => {
    const domain = stateObj.entity_id.split(".")[0];
    return domain === "sensor";
};

@customElement("progress-tile-feature")
export class ProgressTileFeature extends LitElement {
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
            !supportProgressTileFeature(this.stateObj)
        ) {
            return null;
        }

        const state = Number(this.stateObj.state);
        const value = isNaN(state) ? 0 : state;

        return html`
            <div class="container">
                <div class="progress-container">
                    <div class="progress-bar-background"></div>
                    <div
                        class="progress-bar"
                        style=${styleMap({
                            "--value": value.toString(),
                        })}
                    ></div>
                </div>
            </div>
        `;
    }

    static get styles() {
        return css`
            .container {
                display: flex;
                padding: 0 12px 12px 12px;
                width: auto;
            }
            .progress-container {
                position: relative;
                display: block;
                width: 100%;
                height: 40px;
                border-radius: 10px;
                overflow: hidden;
            }
            .progress-bar-background {
                position: absolute;
                top: 0;
                left: 0;
                background-color: var(--tile-color);
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
                background-color: var(--tile-color);
            }
        `;
    }
}

const windowWithCards = window as unknown as Window & {
    customTileFeatures: unknown[];
};
windowWithCards.customTileFeatures = windowWithCards.customTileFeatures || [];
windowWithCards.customTileFeatures.push({
    type: "progress-tile-feature",
    name: "Progress Bar 🍄",
    supported: supportProgressTileFeature, // Optional
    configurable: false, // Optional - defaults to false
});
