import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import {
  Condition,
  fireEvent,
  HomeAssistant,
  LovelaceCardFeatureEditor,
} from "../ha";
import { HaFormSchema } from "../utils/form/ha-form";
import { loadHaComponents } from "../utils/loader";
import {
  ProgressBarCardFeatureConfig,
  progressBarCardFeatureConfigSchema,
  progressBarCardFeatureConfigStruct,
} from "./progress-bar-config";

@customElement("progress-bar-card-feature-editor")
export class ProgressBarCardFeatureEditor
  extends LitElement
  implements LovelaceCardFeatureEditor
{
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: ProgressBarCardFeatureConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: ProgressBarCardFeatureConfig): void {
    assert(config, progressBarCardFeatureConfigStruct);
    this._config = {
      min: 0,
      max: 100,
      animation: "stripes",
      animation_mode: "always",
      ...config,
    };
  }

  private _computeLabel = (schema: HaFormSchema) => {
    if (schema.name === "min") return "Min";
    if (schema.name === "max") return "Max";
    if (schema.name === "animation") return "Animation";
    if (schema.name === "animation_mode") return "Animation mode";
    return schema.name;
  };

  protected render() {
    if (!this._config) {
      return nothing;
    }

    const mode = this._config.animation_mode ?? "always";

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${progressBarCardFeatureConfigSchema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._formChanged}
      ></ha-form>
      ${mode === "condition"
        ? html`
            <h3>Conditions</h3>
            <ha-card-conditions-editor
              .hass=${this.hass}
              .conditions=${this._config.conditions ?? []}
              @value-changed=${this._conditionsChanged}
            ></ha-card-conditions-editor>
          `
        : nothing}
    `;
  }

  private _formChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config) return;
    fireEvent(this, "config-changed", {
      config: { ...this._config, ...ev.detail.value },
    });
  }

  private _conditionsChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config) return;
    const conditions = ev.detail.value as Condition[];
    fireEvent(this, "config-changed", {
      config: { ...this._config, conditions },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "progress-bar-card-feature-editor": ProgressBarCardFeatureEditor;
  }
}
