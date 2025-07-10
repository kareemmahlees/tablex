import type { PropsWithChildren } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

type CustomTooltipProps = {
  className?: string
  side: "right" | "top" | "bottom" | "left"
  content: string
  asChild?: boolean
} & PropsWithChildren

const CustomTooltip = ({
  children,
  className,
  side = "top",
  asChild = false,
  content
}: CustomTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger className={className} asChild={asChild}>
        {children}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="mr-1 p-1 text-xs lg:mr-2 lg:px-2 lg:py-1 lg:text-sm"
      >
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export default CustomTooltip
