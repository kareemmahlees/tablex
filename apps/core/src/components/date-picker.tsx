import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { cn } from "@tablex/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { ControllerRenderProps, FieldValues } from "react-hook-form"
import { Button } from "./ui/button"
import { FormControl } from "./ui/form"

type DatePickerTypes<T extends FieldValues> = {
  field: ControllerRenderProps<T>
  disabled: boolean
  defaultValue?: string
}

const DatePicker = <T extends FieldValues>({
  field,
  disabled = false,
  defaultValue
}: DatePickerTypes<T>) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl defaultValue={defaultValue}>
          <Button
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-[240px] pl-3 text-left font-normal",
              !field.value && "text-muted-foreground"
            )}
          >
            {field.value ? (
              format(field.value, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={field.value}
          onSelect={(date) => {
            if (date) {
              const newDate = new Date(
                date.getTime() - date.getTimezoneOffset() * 60 * 1000
              )
              field.onChange(newDate)
            }
          }}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker
