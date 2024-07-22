import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import { fireEvent, HomeAssistant, LovelaceCardEditor } from "../ha";
import { HaFormSchema } from "../utils/form/ha-form";
import { loadHaComponents } from "../utils/loader";
import {
  ButtonsCardFeatureConfig,
  buttonsCardFeatureConfigSchema,
  buttonsCardFeatureConfigStruct,
} from "./buttons-config";

@customElement("buttons-card-feature-editor")
export class ButtonsCardFeatureEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: ButtonsCardFeatureConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: ButtonsCardFeatureConfig): void {
    assert(config, buttonsCardFeatureConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    if (schema.name === "buttons") {
      return "Buttons entities";
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
        .schema=${buttonsCardFeatureConfigSchema}
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
