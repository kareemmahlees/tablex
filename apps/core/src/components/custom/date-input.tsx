import { cn } from "@tablex/lib/utils"
import { CalendarIcon } from "lucide-react"
import { useTimescape } from "timescape/react"
import { buttonVariants } from "../ui/button"
import { DateTimePicker } from "./date-time-picker"

type DateInputProps = {
  value: Date
  onChange: (v?: Date) => void
  disabled?: boolean
}

export const DateInput = ({
  value,
  onChange,
  disabled = false
}: DateInputProps) => {
  const { getRootProps, getInputProps } = useTimescape({
    date: value,
    onChangeDate: onChange
  })

  return (
    <div
      className={cn(
        buttonVariants({ variant: "outline" }),
        "flex hover:bg-transparent"
      )}
    >
      <div
        className="flex-1 grow select-none space-x-1 [&_input]:border-none [&_input]:bg-transparent [&_input]:outline-none"
        {...getRootProps()}
      >
        <input
          {...getInputProps("years")}
          disabled={disabled}
          className="w-16 focus:rounded-md focus:bg-slate-600"
        />
        <span>/</span>
        <input
          {...getInputProps("months")}
          disabled={disabled}
          className="focus:rounded-md focus:bg-slate-600 focus:px-[1px] focus:py-[0.5px]"
        />
        <span>/</span>
        <input
          {...getInputProps("days")}
          disabled={disabled}
          className="focus:rounded-md focus:bg-slate-600"
        />
      </div>

      <DateTimePicker
        displayFormat={{ hour24: "yyyy/MM/dd" }}
        granularity="day"
        value={value}
        disabled={disabled}
        onChange={onChange}
      >
        <CalendarIcon className="h-4 w-4 hover:cursor-pointer" />
      </DateTimePicker>
    </div>
  )
}
