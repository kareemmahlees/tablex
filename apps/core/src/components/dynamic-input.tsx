import type { ColumnProps } from "@/bindings"
import type { ControllerRenderProps, FieldValues } from "react-hook-form"
import DatePicker from "./date-picker"
import { FormControl } from "./ui/form"
import { Input } from "./ui/input"

type DynamicInputProps<T extends FieldValues> = {
  colDataType?: ColumnProps["type"]
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
    case "date":
    case "dateTime":
      return (
        <DatePicker
          field={field}
          disabled={disabled}
          defaultValue={defaultValue}
        />
      )
    default:
      return (
        <FormControl defaultValue={defaultValue}>
          <Input {...field} disabled={disabled} />
        </FormControl>
      )
  }
}

export default DynamicFormInput
