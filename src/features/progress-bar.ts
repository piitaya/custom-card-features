import { HassEntity } from "home-assistant-js-websocket";
import { css, html, LitElement, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  checkConditionsMet,
  HomeAssistant,
  isNumericFromAttributes,
  LovelaceCardFeature,
  LovelaceCardFeatureContext,
  LovelaceCardFeatureEditor,
  LovelaceCardFeaturePosition,
} from "../ha";
import {
  ProgressBarAnimation,
  ProgressBarCardFeatureConfig,
} from "./progress-bar-config";

interface ChargingBubble {
  y: string;
  size: string;
  delay: string;
  duration: string;
}

// Particules qui dérivent de gauche à droite dans le sens du remplissage.
// y = position verticale (% du bar), size = diamètre, delay/duration désynchronisés
// pour un rendu non-périodique. Le wobble vertical est dans la keyframe.
const CHARGING_BUBBLES: ChargingBubble[] = [
  { y: "30%", size: "4px", delay: "0s", duration: "3.6s" },
  { y: "65%", size: "3px", delay: "-0.9s", duration: "4.2s" },
  { y: "20%", size: "5px", delay: "-1.8s", duration: "3.4s" },
  { y: "50%", size: "3px", delay: "-2.7s", duration: "3.9s" },
  { y: "75%", size: "4px", delay: "-0.4s", duration: "3.7s" },
  { y: "40%", size: "3px", delay: "-3.1s", duration: "3.5s" },
  { y: "60%", size: "4px", delay: "-1.5s", duration: "4.0s" },
  { y: "35%", size: "3px", delay: "-2.3s", duration: "3.6s" },
];

const supportsProgressBarCardFeature = (
  hass: HomeAssistant,
  context: LovelaceCardFeatureContext
) => {
  const stateObj = context.entity_id
    ? hass.states[context.entity_id]
    : undefined;
  if (!stateObj) return false;
  const domain = stateObj.entity_id.split(".")[0];
  return domain === "sensor" && isNumericFromAttributes(stateObj.attributes);
};

@customElement("progress-bar-card-feature")
export class ProgressBarCardFeature
  extends LitElement
  implements LovelaceCardFeature
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public context?: LovelaceCardFeatureContext;

  @property() public color?: string;

  @property() public position?: LovelaceCardFeaturePosition;

  @state() private _config?: ProgressBarCardFeatureConfig;

  public static async getConfigElement(): Promise<LovelaceCardFeatureEditor> {
    await import("./progress-bar-editor");
    return document.createElement(
      "progress-bar-card-feature-editor"
    ) as LovelaceCardFeatureEditor;
  }

  static getStubConfig(): ProgressBarCardFeatureConfig {
    return { type: "custom:progress-bar-card-feature" };
  }

  public setConfig(config: ProgressBarCardFeatureConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = config;
  }

  private get _stateObj(): HassEntity | undefined {
    if (!this.hass || !this.context?.entity_id) return undefined;
    return this.hass.states[this.context.entity_id];
  }

  private get _active(): boolean {
    if (!this.hass || !this._config) return false;
    const mode = this._config.animation_mode ?? "always";
    if (mode === "never") return false;
    if (mode === "always") return true;
    const conditions = this._config.conditions;
    if (!conditions?.length) return false;
    return checkConditionsMet(conditions, this.hass);
  }

  protected render() {
    const stateObj = this._stateObj;
    if (!this._config || !this.hass || !stateObj) {
      return nothing;
    }

    const min = this._config.min ?? 0;
    const max = this._config.max ?? 100;
    const numeric = parseFloat(stateObj.state);
    if (Number.isNaN(numeric) || min >= max) {
      return nothing;
    }
    const value = Math.max(0, Math.min(100, ((numeric - min) / (max - min)) * 100));
    const animation: ProgressBarAnimation =
      this._config.animation ?? "stripes";
    const active = this._active;

    return html`
      <div class="container">
        <div class="background"></div>
        <div
          class=${classMap({ bar: true, active, [animation]: true })}
          style=${styleMap({ "--value": value.toString() })}
        >
          ${active && animation === "wave"
            ? svg`
                <svg
                  class="wave"
                  viewBox="0 0 240 40"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0,18 Q30,6 60,18 T120,18 T180,18 T240,18 V40 H0 Z"
                    fill="rgba(255,255,255,0.35)"
                  />
                  <path
                    d="M0,22 Q30,34 60,22 T120,22 T180,22 T240,22 V40 H0 Z"
                    fill="rgba(255,255,255,0.18)"
                  />
                </svg>
              `
            : nothing}
          ${active && animation === "charging"
            ? CHARGING_BUBBLES.map(
                (b) =>
                  html`<span
                    class="bubble"
                    style=${styleMap({
                      "--y": b.y,
                      "--size": b.size,
                      "--delay": b.delay,
                      "--duration": b.duration,
                    })}
                  ></span>`
              )
            : nothing}
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        pointer-events: none !important;
      }
      .container {
        container-type: inline-size;
        position: relative;
        display: block;
        height: var(--feature-height, 40px);
        border-radius: var(--feature-border-radius, 10px);
        overflow: hidden;
      }
      .background {
        position: absolute;
        inset: 0;
        background-color: var(--feature-color);
        opacity: 0.2;
      }
      .bar {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: calc(var(--value, 0) * 1%);
        background-color: var(--feature-color);
        transition: width 180ms ease-in-out;
        overflow: hidden;
      }

      /* stripes — Bootstrap-style: gradient répété, scroll horizontal */
      .bar.active.stripes {
        background-image: linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.25) 25%,
          transparent 25%,
          transparent 50%,
          rgba(255, 255, 255, 0.25) 50%,
          rgba(255, 255, 255, 0.25) 75%,
          transparent 75%,
          transparent
        );
        background-size: 20px 20px;
        animation: progress-bar-stripes 0.8s linear infinite;
      }
      @keyframes progress-bar-stripes {
        from {
          background-position: 20px 0;
        }
        to {
          background-position: 0 0;
        }
      }

      /*
       * shimmer — pattern HA ha-progress-bar (loading state):
       * 50% width, translateX(-200% to 200%), sinusoidal ease, 2.5s.
       * https://github.com/home-assistant/frontend src/components/progress/ha-progress-bar.ts
       */
      .bar.active.shimmer::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 50%;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--feature-color) 85% c h) 50%,
          transparent 100%
        );
        opacity: 0.5;
        animation: progress-bar-shimmer 2.5s
          cubic-bezier(0.37, 0, 0.63, 1) infinite;
      }
      @keyframes progress-bar-shimmer {
        from {
          transform: translateX(-200%);
        }
        to {
          transform: translateX(200%);
        }
      }

      /*
       * wave — SVG sine wave qui défile horizontalement.
       * Pattern: 200% width SVG translated by 50% pour un loop seamless.
       * https://www.cssscript.com/animated-waves-svg/
       */
      .bar.active.wave .wave {
        position: absolute;
        top: 0;
        left: 0;
        width: 200%;
        height: 100%;
        animation: progress-bar-wave 3.2s linear infinite;
      }
      @keyframes progress-bar-wave {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(-50%);
        }
      }

      /*
       * pulse — Ant Design "active" wave: l'overlay grandit en scaleX
       * tout en s'effaçant. Pause au début pour rythme délibéré.
       * https://github.com/ant-design/ant-design components/progress/style/index.ts
       */
      .bar.active.pulse::after {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.5);
        transform-origin: left center;
        animation: progress-bar-pulse 2.4s
          cubic-bezier(0.23, 1, 0.32, 1) infinite;
      }
      @keyframes progress-bar-pulse {
        0% {
          transform: scaleX(0);
          opacity: 0.1;
        }
        20% {
          transform: scaleX(0);
          opacity: 0.5;
        }
        100% {
          transform: scaleX(1);
          opacity: 0;
        }
      }

      /* breathe — la barre entière respire */
      .bar.active.breathe {
        animation: progress-bar-breathe 2.2s ease-in-out infinite;
      }
      @keyframes progress-bar-breathe {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      /*
       * charging — particules qui dérivent dans le sens du remplissage (gauche →
       * droite). Chaque bulle a sa propre ligne y, taille, vitesse et delay.
       * Le wobble vertical (translateY pendant la course) donne un rendu organique.
       */
      .bar.active.charging .bubble {
        position: absolute;
        top: var(--y);
        left: 0;
        width: var(--size);
        height: var(--size);
        margin-top: calc(var(--size) / -2);
        margin-left: calc(var(--size) / -2);
        border-radius: 50%;
        background: oklch(from var(--feature-color) 90% c h);
        box-shadow: 0 0 6px oklch(from var(--feature-color) 90% c h / 0.6);
        pointer-events: none;
        animation:
          progress-bar-bubble-flow var(--duration) linear infinite,
          progress-bar-bubble-wobble var(--duration) ease-in-out infinite,
          progress-bar-bubble-fade var(--duration) linear infinite;
        animation-delay: var(--delay), var(--delay), var(--delay);
      }
      /* Déplacement horizontal: container-relative pour vitesse constante */
      @keyframes progress-bar-bubble-flow {
        from {
          left: 0;
        }
        to {
          left: 100cqw;
        }
      }
      /* Wobble vertical + scale: easing organique */
      @keyframes progress-bar-bubble-wobble {
        0% {
          transform: translateY(0) scale(0.4);
        }
        15% {
          transform: translateY(-3px) scale(1);
        }
        35% {
          transform: translateY(2px) scale(1);
        }
        55% {
          transform: translateY(-2px) scale(1);
        }
        75% {
          transform: translateY(3px) scale(1);
        }
        100% {
          transform: translateY(0) scale(0.4);
        }
      }
      /* Fade in/out aux extrémités */
      @keyframes progress-bar-bubble-fade {
        0%,
        100% {
          opacity: 0;
        }
        15%,
        90% {
          opacity: 1;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .bar.active::after,
        .bar.active.breathe,
        .bar.active.stripes,
        .bar.active.wave .wave,
        .bar.active.charging .bubble {
          animation: none !important;
        }
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
  isSupported: supportsProgressBarCardFeature,
  configurable: true,
});
