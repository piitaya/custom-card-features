import { array, assign, object, optional, string } from "superstruct";
import { LovelaceCardConfig } from "../ha/data/lovelace";
import { HaFormSchema } from "../utils/form/ha-form";
import { lovelaceCardConfigStruct } from "../utils/structs/lovelace-card-config";

export type ButtonsCardFeatureConfig = LovelaceCardConfig & {
  buttons?: string[];
};

export const buttonsCardFeatureConfigSchema: HaFormSchema[] = [
  {
    name: "buttons",
    selector: { entity: { domain: "button", multiple: true } },
  },
];

export const buttonsCardFeatureConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    buttons: optional(array(string())),
  })
);
