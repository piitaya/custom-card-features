import { HassEntity } from "home-assistant-js-websocket";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCardEditor } from "../ha";
import { ThreeDPrinterActionsTileFeatureConfig } from "./three-d-printer-actions-config";

@customElement("three-d-printer-actions-tile-feature")
export class ThreeDPrinterActionsTileFeature extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @property({ attribute: false }) public stateObj?: HassEntity;

    @state() public config!: ThreeDPrinterActionsTileFeatureConfig;

    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./three-d-printer-actions-editor");
        return document.createElement(
            "three-d-printer-actions-tile-feature-editor"
        ) as LovelaceCardEditor;
    }

    static getStubConfig(): ThreeDPrinterActionsTileFeatureConfig {
        return {
            type: "custom:three-d-printer-actions-tile-feature",
        };
    }

    setConfig(config) {
        if (!config) {
            throw new Error("Invalid configuration");
        }
        this.config = config;
    }

    private _resume() {
        this.hass?.callService("button", "press", {
            entity_id: this.config.resume,
        });
    }

    private _pause() {
        this.hass?.callService("button", "press", {
            entity_id: this.config.pause,
        });
    }

    private _cancel() {
        this.hass?.callService("button", "press", {
            entity_id: this.config.cancel,
        });
    }

    render() {
        if (!this.config || !this.hass || !this.stateObj) {
            return null;
        }

        const resumeStateObj = this.config.resume
            ? this.hass.states[this.config.resume]
            : undefined;
        const pauseStateObj = this.config.pause ? this.hass.states[this.config.pause] : undefined;
        const cancelStateObj = this.config.cancel
            ? this.hass.states[this.config.cancel]
            : undefined;

        return html`
            <ha-control-button-group>
                ${resumeStateObj
                    ? html`
                          <ha-control-button
                              .label=${resumeStateObj.attributes.friendly_name}
                              @click=${this._resume}
                              .disabled=${resumeStateObj.state === "unavailable"}
                          >
                              <ha-icon icon="mdi:play"></ha-icon>
                          </ha-control-button>
                      `
                    : nothing}
                ${pauseStateObj
                    ? html`
                          <ha-control-button
                              .label=${pauseStateObj.attributes.friendly_name}
                              @click=${this._pause}
                              .disabled=${!pauseStateObj || pauseStateObj.state === "unavailable"}
                          >
                              <ha-icon icon="mdi:pause"></ha-icon>
                          </ha-control-button>
                      `
                    : nothing}
                ${cancelStateObj
                    ? html`
                          <ha-control-button
                              .label=${cancelStateObj.attributes.friendly_name}
                              @click=${this._cancel}
                              .disabled=${!cancelStateObj || cancelStateObj.state === "unavailable"}
                          >
                              <ha-icon icon="mdi:cancel"></ha-icon>
                          </ha-control-button>
                      `
                    : nothing}
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
    type: "three-d-printer-actions-tile-feature",
    name: "3D Printer actions 🍄",
    configurable: true,
});
