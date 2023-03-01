import { array, assign, object, optional, string } from "superstruct";
import { LovelaceCardConfig } from "../ha/data/lovelace";
import { HaFormSchema } from "../utils/form/ha-form";
import { lovelaceCardConfigStruct } from "../utils/structs/lovelace-card-config";

export type ButtonsTileFeatureConfig = LovelaceCardConfig & {
    buttons?: string[];
};

export const buttonsTileFeatureConfigSchema: HaFormSchema[] = [
    { name: "buttons", selector: { entity: { domain: "button", multiple: true } } },
];

export const buttonsTileFeatureConfigStruct = assign(
    lovelaceCardConfigStruct,
    object({
        buttons: optional(array(string())),
    })
);
