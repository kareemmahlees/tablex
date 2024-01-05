import Card from "./Card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "./ui/tooltip"

const ToolsCard = () => {
  return (
    <Card
      id="tools"
      header="Built with the tools you love"
      content={
        <p>
          <span className="font-semibold text-foreground">TableX</span> utilizes
          modern tooling to provide a delightful developer experience and an
          Immersive user experience.
        </p>
      }
    >
      <Tools />
    </Card>
  )
}

export default ToolsCard

const Tools = () => {
  const tools: { src: string; alt: string; content: string }[] = [
    {
      src: "/icons/rust.svg",
      alt: "rust",
      content: "Rust"
    },
    {
      src: "/icons/tauri.svg",
      alt: "tauri",
      content: "Tauri"
    },
    {
      src: "/icons/tailwind.svg",
      alt: "tailwind",
      content: "Tailwind"
    },
    {
      src: "/icons/vercel.svg",
      alt: "vercel",
      content: "Vercel"
    }
  ]
  return (
    <TooltipProvider>
      <div className="grid grid-cols-3  mx-auto gap-5 md:gap-y-8 mt-7 w-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <img
              src="/icons/next.svg"
              alt="nextjs"
              className="w-10 h-10 invert justify-self-center"
            />
          </TooltipTrigger>
          <TooltipContent>Nextjs</TooltipContent>
        </Tooltip>
        {tools.map(({ src, alt, content }, idx) => {
          return (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <img
                  src={src}
                  alt={alt}
                  className="w-10 h-10 justify-self-center"
                />
              </TooltipTrigger>
              <TooltipContent>{content}</TooltipContent>
            </Tooltip>
          )
        })}
        <Tooltip>
          <TooltipTrigger asChild>
            <img
              src="/icons/shadcn.svg"
              alt="shadcn"
              className="w-8 h-8 justify-self-center"
            />
          </TooltipTrigger>
          <TooltipContent>Nextjs</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
