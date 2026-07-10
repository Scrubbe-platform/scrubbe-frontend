import { ACTIONS, FIELDS } from "./rule-config";

export interface ActionGroup {
    sec: string;
    keys: ActionKey[];
}

export type ActionKey = keyof typeof ACTIONS;

export interface CondGroup {
    sec: string;
    fields: FieldKey[];
}


export type FieldKey = keyof typeof FIELDS;


export interface FieldDef {
    label: string;
    ops: string[];
    val: FieldVal;
    hint?: string;
}

export type FieldVal =
    | { type: "select"; options: string[]; unit?: string; placeholder?: string }
    | { type: "num"; unit?: string; placeholder?: string }
    | { type: "priority" }
    | { type: "days" }
    | { type: "timerange" }
    | { type: "duration" }
    | { type: "bool"; fixed?: boolean }
    | { type: "text"; placeholder?: string };
