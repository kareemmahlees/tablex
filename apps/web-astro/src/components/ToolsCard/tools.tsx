import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ToolsTooltipProps {
    tools : {
        src :string
        alt:string
        content:string
    }[]
}

const Tools = ({tools}:ToolsTooltipProps) => {
    return ( <TooltipProvider>
      <div className="mx-auto mt-7  grid w-full grid-cols-3 gap-5 md:gap-y-8">
        {tools.map(({ src, alt, content }, idx) => {
          return (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <img
                  src={src}
                  alt={alt}
                  className="h-10 w-10 justify-self-center"
                />
              </TooltipTrigger>
              <TooltipContent>{content}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
 );
}
 
export default Tools;