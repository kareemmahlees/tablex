import { FormControl } from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import type { SelectProps } from "@radix-ui/react-select"

type EnumSelectInputProps = {
  onChange: SelectProps["onValueChange"]
  value?: string
  values: Record<string, string>
}

export const EnumSelectInput = ({
  onChange,
  value,
  values
}: EnumSelectInputProps) => {
  return (
    <Select onValueChange={onChange} value={value}>
      <FormControl>
        <SelectTrigger className="max-w-28">
          <SelectValue />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {Object.entries(values).map(([value, label]) => (
          <SelectItem value={value} key={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
