import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import { fireEvent, HomeAssistant, LovelaceCardEditor } from "../ha";
import { HaFormSchema } from "../utils/form/ha-form";
import { loadHaComponents } from "../utils/loader";
import {
    ThreeDPrinterActionsTileFeatureConfig,
    threeDPrinterActionsTileFeatureConfigSchema,
    threeDPrinterActionsTileFeatureConfigStruct,
} from "./three-d-printer-actions-config";

@customElement("three-d-printer-actions-tile-feature-editor")
export class ThreeDPrinterActionsTileFeatureEditor
    extends LitElement
    implements LovelaceCardEditor
{
    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: ThreeDPrinterActionsTileFeatureConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: ThreeDPrinterActionsTileFeatureConfig): void {
        assert(config, threeDPrinterActionsTileFeatureConfigStruct);
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        if (schema.name === "resume") {
            return "Resume button entity";
        }
        if (schema.name === "pause") {
            return "Pause button entity";
        }
        if (schema.name === "cancel") {
            return "Cancel button entity";
        }
        return schema.name;
    };

    protected render() {
        if (!this._config) {
            return nothing;
        }

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${threeDPrinterActionsTileFeatureConfigSchema}
                .computeLabel=${this._computeLabel}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }
}

declare global {
    interface HASSDomEvents {
        "config-changed": {
            config: unknown;
        };
        change: undefined;
    }
}
