import type { ColumnProps } from "@/bindings"
import type { ControllerRenderProps, FieldValues } from "react-hook-form"
import { Input } from "../../ui/input"
import { DateTimePicker } from "./date-time-picker"

/**
 * Remove the effect of timezone differences and return a new date
 * identical to what the user original selected.
 * @param date old date
 * @returns normalized date
 */
const normalizeTimezoneOffset = (date: Date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
}

type DynamicInputProps<T extends FieldValues> = {
  colDataType: ColumnProps["type"]
  field: ControllerRenderProps<T>
  disabled: boolean
  defaultValue?: string
}

const DynamicFormInput = <T extends FieldValues>({
  colDataType,
  field,
  disabled = false,
  defaultValue
}: DynamicInputProps<T>) => {
  switch (colDataType) {
    case "time":
      return (
        <Input
          {...field}
          disabled={disabled}
          className="w-[280px]"
          placeholder="HH:MM:SS"
          defaultValue={defaultValue}
        />
      )
      {
        /**
         * TODO: use a proper <TimePicker/> component instead.
         */
      }
    case "date":
      return (
        <DateTimePicker
          displayFormat={{ hour24: "yyyy/MM/dd" }}
          granularity="day"
          value={defaultValue ? new Date(defaultValue) : field.value}
          disabled={disabled}
          onChange={(date) => {
            if (date) {
              field.onChange(normalizeTimezoneOffset(date))
            }
          }}
        />
      )
    case "dateTime":
      return (
        <DateTimePicker
          value={defaultValue ? new Date(defaultValue) : field.value}
          disabled={disabled}
          onChange={(date) => {
            if (date) {
              field.onChange(normalizeTimezoneOffset(date))
            }
          }}
        />
      )
    default:
      return <Input {...field} disabled={disabled} />
  }
}

export default DynamicFormInput
