import type { ColumnInfo } from "@/bindings"
import { DateTimeInput } from "@/components/custom/date-input"
import MonacoEditor from "@/components/custom/monaco-editor"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/text-area"
import type { ControllerRenderProps, FieldValues } from "react-hook-form"

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

  if (typeof column.type === "object") {
    return (
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Variant" />
        </SelectTrigger>
        <SelectContent>
          {column.type["enum"].map((variant) => (
            <SelectItem value={variant}>{variant}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  switch (column.type) {
    // TODO: use a proper <TimePicker/> component instead.
    case "time":
      return <DateTimeInput {...field} disabled={disabled} type="time" />
    case "date":
      return (
        <DateTimeInput
          {...field}
          value={field.value}
          disabled={disabled}
          onChange={(v) => field.onChange(v)}
          type="date"
        />
      )
    case "dateTime":
      return (
        <DateTimeInput
          value={defaultValue ? new Date(defaultValue) : field.value}
          disabled={disabled}
          onChange={(date) => {
            if (date) {
              field.onChange(normalizeTimezoneOffset(date))
            }
          }}
          type="datetime"
        />
      )
    case "json":
      return (
        <MonacoEditor
          value={field.value}
          onChange={field.onChange}
          defaultValue={defaultValue}
        />
      )
    case "boolean":
      return (
        <Switch
          checked={field.value}
          defaultChecked={true}
          onCheckedChange={field.onChange}
        />
      )
    case "text":
      return <Textarea value={field.value} onChange={field.onChange} />
    case "binary":
    case "unSupported":
      return null
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
