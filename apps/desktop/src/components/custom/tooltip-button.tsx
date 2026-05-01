import { PropsWithChildren, ReactNode } from "react"
import { Button, type ButtonProps } from "@tablex/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@tablex/ui/components/tooltip"

type TooltipButtonProps = {
  tooltipContent: ReactNode
} & ButtonProps

export const TooltipButton = ({
  tooltipContent,
  children,
  ...props
}: PropsWithChildren<TooltipButtonProps>) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button {...props}>{children}</Button>
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
