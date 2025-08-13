import type { ColumnInfo } from "@/bindings"
import { DateTimeInput } from "@/components/custom/date-input"
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
import { json } from "@codemirror/lang-json"
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night"
import CodeMirror from "@uiw/react-codemirror"

/**
 * Remove the effect of timezone differences and return a new date
 * identical to what the user original selected.
 * @param date old date
 * @returns normalized date
 */
const normalizeTimezoneOffset = (date: Date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
}

type DynamicInputProps = {
  column: ColumnInfo
  onChange: (v: any) => void
  value: any
}

const DynamicFormInput = ({ column, ...props }: DynamicInputProps) => {
  const disabled = false // TODO: fixme

  if (typeof column.type === "object") {
    return (
      <Select defaultValue={props.value} onValueChange={props.onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Variant" />
        </SelectTrigger>
        <SelectContent>
          {column.type.enum.variants.map((variant) => (
            <SelectItem value={variant}>{variant}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  switch (column.type) {
    // TODO: use a proper <TimePicker/> component instead.
    case "time":
      return <DateTimeInput {...props} disabled={disabled} type="time" />
    case "date":
      return <DateTimeInput {...props} disabled={disabled} type="date" />
    case "dateTime":
      return (
        <DateTimeInput
          value={props.value ? new Date(props.value) : undefined}
          disabled={disabled}
          onChange={(date) => {
            if (date) {
              props.onChange(normalizeTimezoneOffset(date))
            }
          }}
          type="datetime"
        />
      )
    case "json":
      return (
        <CodeMirror
          value={JSON.stringify(props.value, undefined, 2)}
          onChange={props.onChange}
          theme={tokyoNight}
          extensions={[json()]}
        />
      )
    case "boolean":
      return (
        <Switch
          checked={props.value}
          defaultChecked={true}
          onCheckedChange={props.onChange}
        />
      )
    case "text":
      return <Textarea value={props.value ?? ""} onChange={props.onChange} />
    case "binary":
    case "unSupported":
      return null
    default:
      return <Input {...props} disabled={disabled} />
  }
}

export default DynamicFormInput
