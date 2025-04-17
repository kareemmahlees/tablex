import type { ColumnInfo } from "@/bindings"
import { DateInput } from "@/components/custom/date-input"
import JsonEditor from "@/components/custom/json-editor"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/text-area"
import type { ControllerRenderProps, FieldValues } from "react-hook-form"
import { DateTimePicker } from "../../../components/custom/date-time-picker"

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
  column: ColumnInfo
  field: ControllerRenderProps<T>
  defaultValue?: string
}

const DynamicFormInput = <T extends FieldValues>({
  column,
  field,
  defaultValue
}: DynamicInputProps<T>) => {
  const disabled = false // TODO: fixme

  switch (column.type) {
    // TODO: use a proper <TimePicker/> component instead.
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
    case "date":
      return (
        <DateInput
          value={field.value}
          disabled={disabled}
          onChange={(v) => {
            console.log("changed", v)
            field.onChange(v)
          }}
        />
        // <DateTimePicker
        //   displayFormat={{ hour24: "yyyy/MM/dd" }}
        //   granularity="day"
        //   value={defaultValue ? new Date(defaultValue) : field.value}
        //   disabled={disabled}
        //   onChange={(date) => {
        //     if (date) {
        //       field.onChange(normalizeTimezoneOffset(date))
        //     }
        //   }}
        // />
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
    case "json":
      return <JsonEditor field={field} defaultValue={defaultValue} />
    case "boolean":
      return (
        <Switch
          checked={field.value || Boolean(defaultValue)}
          onCheckedChange={field.onChange}
        />
      )
    case "text":
      return <Textarea value={field.value} onChange={field.onChange} />
    default:
      return (
        <Input
          {...field}
          disabled={disabled}
          defaultValue={defaultValue}
          // placeholder={column.isAutoIncrement ? "Auto Increment" : ""}
        />
      )
  }
}

export default DynamicFormInput
