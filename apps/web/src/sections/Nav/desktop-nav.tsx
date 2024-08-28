import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { cn } from "@tablex/lib/utils"

const DesktopNav = () => {
  return (
    <Dialog>
      <ul className="hidden items-end text-sm md:flex md:gap-x-4 lg:gap-x-5">
        <a
          className={cn(
            "text-muted-foreground",
            buttonVariants({ variant: "ghost", size: "sm" })
          )}
          href="/overview"
        >
          Docs
        </a>
        <Button
          variant={"ghost"}
          size={"sm"}
          className="text-muted-foreground"
          onClick={() =>
            document
              .getElementById("tools")
              ?.scrollIntoView({ block: "center" })
          }
        >
          Features
        </Button>
        <Button
          variant={"ghost"}
          size={"sm"}
          className="text-muted-foreground"
          onClick={() =>
            document
              .getElementById("download")
              ?.scrollIntoView({ block: "center" })
          }
        >
          Download
        </Button>
        <DialogTrigger>
          <Button
            variant={"ghost"}
            size={"sm"}
            className="text-muted-foreground"
          >
            Pricing
          </Button>
        </DialogTrigger>
        <DialogContent className="w-2/3 rounded-md md:w-full">
          <DialogHeader>
            <DialogTitle>100% Free 🥳</DialogTitle>
            <DialogDescription>
              Tablex is absolutely free to download and use, if you would like
              to support the project, consider giving us a Star ⭐ on{" "}
              <a
                className="text-foreground underline"
                href="https://github.com/kareemmahlees/tablex"
                target="_blank"
                rel="noreferrer"
              >
                Github
              </a>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </ul>
    </Dialog>
  )
}

export default DesktopNav
