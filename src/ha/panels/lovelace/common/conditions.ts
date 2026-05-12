import type { HomeAssistant } from "../../../types";

interface BaseCondition {
  condition: string;
}

export interface NumericStateCondition extends BaseCondition {
  condition: "numeric_state";
  entity?: string;
  attribute?: string;
  below?: string | number;
  above?: string | number;
}

export interface StateCondition extends BaseCondition {
  condition: "state";
  entity?: string;
  attribute?: string;
  state?: string | string[];
  state_not?: string | string[];
}

export interface OrCondition extends BaseCondition {
  condition: "or";
  conditions?: Condition[];
}

export interface AndCondition extends BaseCondition {
  condition: "and";
  conditions?: Condition[];
}

export interface NotCondition extends BaseCondition {
  condition: "not";
  conditions?: Condition[];
}

export type Condition =
  | StateCondition
  | NumericStateCondition
  | OrCondition
  | AndCondition
  | NotCondition;

const UNKNOWN = "unknown";
const VALID_ENTITY_ID = /^(\w+)\.(\w+)$/;

const isValidEntityId = (value: string) => VALID_ENTITY_ID.test(value);

const ensureArray = <T>(value: T | T[] | undefined): T[] =>
  value == null ? [] : Array.isArray(value) ? value : [value];

const getValueFromEntityId = (
  hass: HomeAssistant,
  value: string
): string | undefined => {
  if (isValidEntityId(value) && hass.states[value]) {
    return hass.states[value]?.state;
  }
  return undefined;
};

const checkStateCondition = (
  condition: StateCondition,
  hass: HomeAssistant
): boolean => {
  const entityId = condition.entity;
  const stateObj = entityId ? hass.states[entityId] : undefined;
  const attribute = condition.attribute;
  let state: string;
  if (!stateObj) {
    state = UNKNOWN;
  } else if (attribute) {
    const attrValue = stateObj.attributes[attribute];
    state = attrValue == null ? UNKNOWN : String(attrValue);
  } else {
    state = stateObj.state;
  }
  let value = condition.state ?? condition.state_not;
  if (value === undefined) return false;

  if (Array.isArray(value)) {
    const entityValues = value
      .map((v) => getValueFromEntityId(hass, v))
      .filter((v): v is string => v !== undefined);
    value = [...value, ...entityValues];
  } else if (typeof value === "string") {
    const entityValue = getValueFromEntityId(hass, value);
    value = [value];
    if (entityValue) value.push(entityValue);
  }

  return condition.state != null
    ? ensureArray(value).includes(state)
    : !ensureArray(value).includes(state);
};

const checkNumericStateCondition = (
  condition: NumericStateCondition,
  hass: HomeAssistant
): boolean => {
  const entityId = condition.entity;
  const stateObj = entityId ? hass.states[entityId] : undefined;
  const rawState = condition.attribute
    ? stateObj?.attributes[condition.attribute]
    : stateObj?.state;
  let above = condition.above;
  let below = condition.below;

  if (typeof above === "string") {
    above = getValueFromEntityId(hass, above) ?? above;
  }
  if (typeof below === "string") {
    below = getValueFromEntityId(hass, below) ?? below;
  }

  const numericState = Number(rawState);
  const numericAbove = Number(above);
  const numericBelow = Number(below);

  if (Number.isNaN(numericState)) return false;

  return (
    (condition.above == null ||
      Number.isNaN(numericAbove) ||
      numericAbove < numericState) &&
    (condition.below == null ||
      Number.isNaN(numericBelow) ||
      numericBelow > numericState)
  );
};

export const checkConditionsMet = (
  conditions: Condition[],
  hass: HomeAssistant
): boolean =>
  conditions.every((c) => {
    switch (c.condition) {
      case "numeric_state":
        return checkNumericStateCondition(c, hass);
      case "state":
        return checkStateCondition(c, hass);
      case "and":
        return c.conditions ? checkConditionsMet(c.conditions, hass) : true;
      case "not":
        return c.conditions ? !checkConditionsMet(c.conditions, hass) : true;
      case "or":
        return c.conditions
          ? c.conditions.some((sub) => checkConditionsMet([sub], hass))
          : true;
      default:
        return false;
    }
  });
