import { cn } from "@tablex/lib/utils"
import { ComponentProps } from "react"
import { useTimescape } from "timescape/react"

type DateInputProps = {
  value?: Date
  onChange: (v?: Date) => void
  disabled?: boolean
  type?: "date" | "time" | "datetime"
  dateSectionClassName?: string
  timeSectionClassName?: string
}

export const DateTimeInput = ({
  value,
  onChange,
  disabled = false,
  type = "datetime",
  className,
  dateSectionClassName,
  timeSectionClassName,
  ...props
}: ComponentProps<"div"> & DateInputProps) => {
  const { getRootProps, getInputProps } = useTimescape({
    date: value,
    onChangeDate: onChange
  })

  return (
    <div
      {...getRootProps()}
      {...props}
      className={cn(
        "border-input flex h-10 w-full select-none items-center rounded-md border px-3 py-2 text-sm",
        className
      )}
    >
      {(type === "date" || type === "datetime") && (
        <div
          className={cn(
            "inline-flex h-full w-full select-none items-center gap-x-1",
            dateSectionClassName
          )}
        >
          <input
            {...getInputProps("days")}
            disabled={disabled}
            className="focus-within:bg-muted-foreground/40 box-content h-fit cursor-pointer select-none border-none bg-transparent px-1 tabular-nums outline-none focus-within:rounded-sm"
            placeholder="DD"
          />
          <span>/</span>
          <input
            {...getInputProps("months")}
            disabled={disabled}
            className="focus-within:bg-muted-foreground/40 box-content h-fit cursor-pointer select-none border-none bg-transparent px-1 tabular-nums outline-none focus-within:rounded-sm"
            placeholder="MM"
          />
          <span>/</span>
          <input
            {...getInputProps("years")}
            disabled={disabled}
            className="focus-within:bg-muted-foreground/40 box-content h-fit cursor-pointer select-none border-none bg-transparent px-1 tabular-nums outline-none focus-within:rounded-sm"
            placeholder="YYYY"
          />
        </div>
      )}

      {(type === "time" || type === "datetime") && (
        <div
          className={cn(
            "flex h-full w-full select-none items-center gap-x-1",
            timeSectionClassName
          )}
        >
          <input
            {...getInputProps("hours")}
            disabled={disabled}
            className="focus-within:bg-muted-foreground/40 box-content h-fit cursor-pointer select-none border-none bg-transparent px-1 tabular-nums outline-none focus-within:rounded-sm"
            placeholder="HH"
          />
          <span>:</span>
          <input
            {...getInputProps("minutes")}
            disabled={disabled}
            className="focus-within:bg-muted-foreground/40 box-content h-fit cursor-pointer select-none border-none bg-transparent px-1 tabular-nums outline-none focus-within:rounded-sm"
            placeholder="MM"
          />
          <span>:</span>
          <input
            {...getInputProps("seconds")}
            disabled={disabled}
            className="focus-within:bg-muted-foreground/40 box-content h-fit cursor-pointer select-none border-none bg-transparent px-1 tabular-nums outline-none focus-within:rounded-sm"
            placeholder="SS"
          />
        </div>
      )}
    </div>
  )
}
