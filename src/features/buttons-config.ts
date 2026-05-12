import { array, assign, object, optional, string } from "superstruct";
import { LovelaceCardFeatureConfig } from "../ha";
import { HaFormSchema } from "../utils/form/ha-form";
import { customType } from "../utils/structs/is-custom-type";

export type ButtonsCardFeatureConfig = LovelaceCardFeatureConfig & {
  type: "custom:buttons-card-feature";
  buttons?: string[];
};

export const buttonsCardFeatureConfigSchema: HaFormSchema[] = [
  {
    name: "buttons",
    selector: { entity: { domain: ["button", "script"], multiple: true } },
  },
];

export const buttonsCardFeatureConfigStruct = assign(
  object({
    type: customType(),
  }),
  object({
    buttons: optional(array(string())),
  })
);
