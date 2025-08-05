import { Filters } from "@/bindings"
import { KeysOfUnion } from "@/lib/utils"

export type DataTableConfig = typeof dataTableConfig

type Operator = {
  label: string
  value: KeysOfUnion<Filters>
}

export const dataTableConfig = {
  textOperators: [
    { label: "Like", value: "like" as const },
    { label: "Not like", value: "notLike" as const },
    { label: "Equals", value: "eq" as const },
    { label: "Not Equals", value: "ne" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const }
  ] satisfies Operator[],
  numericOperators: [
    { label: "Equals", value: "eq" as const },
    { label: "Not equals", value: "ne" as const },
    { label: "Is less than", value: "lt" as const },
    { label: "Is less than or equal to", value: "lte" as const },
    { label: "Is greater than", value: "gt" as const },
    { label: "Is greater than or equal to", value: "gte" as const },
    { label: "Is between", value: "between" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const }
  ] satisfies Operator[],
  dateOperators: [
    { label: "Equals", value: "eq" as const },
    { label: "Not equals", value: "ne" as const },
    { label: "Is before", value: "lt" as const },
    { label: "Is after", value: "gt" as const },
    { label: "Is on or before", value: "lte" as const },
    { label: "Is on or after", value: "gte" as const },
    { label: "Is between", value: "between" as const },
    // { label: "Is relative to today", value: "isRelativeToToday" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const }
  ] satisfies Operator[],
  // selectOperators: [
  //   { label: "Is", value: "eq" as const },
  //   { label: "Is not", value: "ne" as const },
  //   { label: "Is empty", value: "isEmpty" as const },
  //   { label: "Is not empty", value: "isNotEmpty" as const }
  // ],
  // multiSelectOperators: [
  //   { label: "Has any of", value: "inArray" as const },
  //   { label: "Has none of", value: "notInArray" as const },
  //   { label: "Is empty", value: "isEmpty" as const },
  //   { label: "Is not empty", value: "isNotEmpty" as const }
  // ],
  booleanOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const }
  ] satisfies Operator[],
  sortOrders: [
    { label: "Asc", value: "asc" as const },
    { label: "Desc", value: "desc" as const }
  ],
  filterVariants: [
    "string",
    "text",
    "uuid",
    "float",
    "positiveInteger",
    "boolean",
    "integer",
    "date",
    "dateTime",
    "time",
    "year",
    "json",
    "binary",
    "custom",
    "unSupported"

    // "text",
    // "number",
    // "range",
    // "date",
    // "dateRange",
    // "boolean"
    // "select",
    // "multiSelect"
  ] as const,
  // operators: [
  //   "iLike",
  //   "notILike",
  //   "eq",
  //   "ne",
  //   "inArray",
  //   "notInArray",
  //   "isEmpty",
  //   "isNotEmpty",
  //   "lt",
  //   "lte",
  //   "gt",
  //   "gte",
  //   "isBetween",
  //   "isRelativeToToday"
  // ] as const,
  operators: [
    "gt",
    "gte",
    "lt",
    "lte",
    "between",
    "eq",
    "ne",
    "like",
    "notLike",
    "isEmpty",
    "isNotEmpty"
  ] as const,
  joinOperators: ["and", "or"] as const
}
