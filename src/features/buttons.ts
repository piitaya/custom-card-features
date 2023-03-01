import { HassEntity } from "home-assistant-js-websocket";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { HomeAssistant, LovelaceCardEditor } from "../ha";
import { ButtonsTileFeatureConfig } from "./buttons-config";

@customElement("buttons-tile-feature")
export class ButtonsTileFeature extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @property({ attribute: false }) public stateObj?: HassEntity;

    @state() public config!: ButtonsTileFeatureConfig;

    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./buttons-editor");
        return document.createElement("buttons-tile-feature-editor") as LovelaceCardEditor;
    }

    static getStubConfig(): ButtonsTileFeatureConfig {
        return {
            type: "custom:buttons-tile-feature",
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

        return html`
            <ha-control-button-group>
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
                margin: 0 12px 12px 12px;
                --control-button-group-spacing: 12px;
            }
        `;
    }
}

const windowWithCards = window as unknown as Window & {
    customTileFeatures: unknown[];
};
windowWithCards.customTileFeatures = windowWithCards.customTileFeatures || [];
windowWithCards.customTileFeatures.push({
    type: "buttons-tile-feature",
    name: "Buttons 🍄",
    configurable: true,
});
