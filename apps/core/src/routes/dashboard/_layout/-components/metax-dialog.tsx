import { events } from "@/bindings"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { open as openInBrowser } from "@tauri-apps/plugin-shell"
import { Globe, PlayCircle } from "lucide-react"
import { useState } from "react"

const MetaXDialog = () => {
  const [open, setOpen] = useState(false)

  events.metaXDialogOpen.listen(() => setOpen(true))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Navigate to your liking</DialogTitle>
        </DialogHeader>
        <TooltipProvider>
          <section className="mt-4 flex items-center justify-between p-4">
            <Tooltip>
              <TooltipTrigger>
                <div
                  className="group/globe brightness-50 transition-all hover:brightness-100"
                  role="button"
                  onClick={() => openInBrowser("http://localhost:5522")}
                >
                  <Globe className="h-12 w-12" strokeWidth={1.2} />
                  <Globe
                    className="absolute left-1/2 top-1/2 hidden h-12 w-12 -translate-x-[50%] -translate-y-[50%] blur-lg group-hover/globe:block"
                    strokeWidth={1}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>REST</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className="group/swagger relative h-12 w-12 opacity-50 invert hover:opacity-100"
                  role="button"
                  onClick={() => openInBrowser("http://localhost:5522/swagger")}
                >
                  <img src={"/icons/swagger.svg"} alt="swagger" />
                  <img
                    src={"/icons/swagger.svg"}
                    alt="swagger"
                    className="absolute left-1/2 top-1/2 hidden blur-lg group-hover/swagger:block"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>Swagger</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className="group/graphql relative h-12 w-12 opacity-50 invert hover:opacity-100"
                  role="button"
                  onClick={() => openInBrowser("http://localhost:5522/graphql")}
                >
                  <img src={"/icons/graphql.svg"} alt="graphql" />
                  <img
                    src={"/icons/graphql.svg"}
                    alt="graphql"
                    className="absolute left-1/2 top-1/2 hidden blur-lg group-hover/graphql:block"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>GraphQL</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className="group/play brightness-50 hover:brightness-100"
                  role="button"
                  onClick={() =>
                    openInBrowser("http://localhost:5522/playground")
                  }
                >
                  <PlayCircle className="h-12 w-12" strokeWidth={1.2} />
                  <PlayCircle
                    className="absolute left-1/2 top-1/2 hidden h-12 w-12 -translate-x-[50%] -translate-y-[50%] blur-lg group-hover/play:block"
                    strokeWidth={1.2}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>Playground</TooltipContent>
            </Tooltip>
          </section>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  )
}

export default MetaXDialog
