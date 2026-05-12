import {
  any,
  array,
  assign,
  enums,
  number,
  object,
  optional,
} from "superstruct";
import { Condition, LovelaceCardFeatureConfig } from "../ha";
import { HaFormSchema } from "../utils/form/ha-form";
import { customType } from "../utils/structs/is-custom-type";

export const PROGRESS_BAR_ANIMATIONS = [
  "stripes",
  "shimmer",
  "wave",
  "pulse",
  "breathe",
  "charging",
] as const;
export type ProgressBarAnimation = (typeof PROGRESS_BAR_ANIMATIONS)[number];

export const PROGRESS_BAR_ANIMATION_MODES = [
  "always",
  "condition",
  "never",
] as const;
export type ProgressBarAnimationMode =
  (typeof PROGRESS_BAR_ANIMATION_MODES)[number];

export type ProgressBarCardFeatureConfig = LovelaceCardFeatureConfig & {
  type: "custom:progress-bar-card-feature";
  min?: number;
  max?: number;
  animation?: ProgressBarAnimation;
  animation_mode?: ProgressBarAnimationMode;
  conditions?: Condition[];
};

export const progressBarCardFeatureConfigSchema: HaFormSchema[] = [
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "min",
        default: 0,
        selector: { number: { mode: "box" } },
      },
      {
        name: "max",
        default: 100,
        selector: { number: { mode: "box" } },
      },
    ],
  },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "animation",
        required: true,
        default: "stripes",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "stripes", label: "Stripes" },
              { value: "shimmer", label: "Shimmer" },
              { value: "wave", label: "Wave" },
              { value: "pulse", label: "Pulse" },
              { value: "breathe", label: "Breathe" },
              { value: "charging", label: "Charging" },
            ],
          },
        },
      },
      {
        name: "animation_mode",
        required: true,
        default: "always",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "always", label: "Always" },
              { value: "condition", label: "Condition" },
              { value: "never", label: "Never" },
            ],
          },
        },
      },
    ],
  },
];

export const progressBarCardFeatureConfigStruct = assign(
  object({
    type: customType(),
  }),
  object({
    min: optional(number()),
    max: optional(number()),
    animation: optional(enums(PROGRESS_BAR_ANIMATIONS)),
    animation_mode: optional(enums(PROGRESS_BAR_ANIMATION_MODES)),
    conditions: optional(array(any())),
  })
);
