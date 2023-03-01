import { assign, object, optional, string } from "superstruct";
import { LovelaceCardConfig } from "../ha/data/lovelace";
import { HaFormSchema } from "../utils/form/ha-form";
import { lovelaceCardConfigStruct } from "../utils/structs/lovelace-card-config";

export type ThreeDPrinterActionsTileFeatureConfig = LovelaceCardConfig & {
    resume?: string;
    pause?: string;
    cancel?: string;
};

export const threeDPrinterActionsTileFeatureConfigSchema: HaFormSchema[] = [
    { name: "resume", selector: { entity: { domain: "button" } } },
    { name: "pause", selector: { entity: { domain: "button" } } },
    { name: "cancel", selector: { entity: { domain: "button" } } },
];

export const threeDPrinterActionsTileFeatureConfigStruct = assign(
    lovelaceCardConfigStruct,
    object({
        resume: optional(string()),
        pause: optional(string()),
        cancel: optional(string()),
    })
);
