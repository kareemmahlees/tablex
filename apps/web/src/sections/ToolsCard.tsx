import Card from "../components/Card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../components/ui/tooltip"

const ToolsCard = () => {
  return (
    <Card
      id="tools"
      header="Built with the tools you love"
      content={
        <p>
          <span className="text-foreground font-semibold">TableX</span> utilizes
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
      <div className="mx-auto mt-7  grid w-full grid-cols-3 gap-5 md:gap-y-8">
        <Tooltip>
          <TooltipTrigger asChild>
            <img
              src="/icons/next.svg"
              alt="nextjs"
              className="h-10 w-10 justify-self-center invert"
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
                  className="h-10 w-10 justify-self-center"
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
              className="h-8 w-8 justify-self-center"
            />
          </TooltipTrigger>
          <TooltipContent>Nextjs</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
