import { cn } from "@tablex/lib/utils"
import { ComponentProps, PropsWithChildren } from "react"

const Kbd = (props: ComponentProps<"kbd"> & PropsWithChildren) => {
  return (
    <kbd
      {...props}
      className={cn(
        props.className,
        "bg-background rounded-md border-b border-white/55 px-2 py-1"
      )}
    >
      {props.children}
    </kbd>
  )
}

export default Kbd
