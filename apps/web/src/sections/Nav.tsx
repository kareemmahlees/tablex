import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Menu } from "lucide-react"
import { useState } from "react"
import { Button, buttonVariants } from "../components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "../components/ui/drawer"

const Nav = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  return (
    <nav className="bg-background/40 fixed -top-0 z-[999] flex w-full items-center justify-between scroll-smooth p-2 backdrop-blur-md md:p-3 lg:p-4">
      <Button
        size={"sm"}
        variant={"ghost"}
        className="hover:bg-transparent"
        onClick={() =>
          window.scrollTo({
            top: 0
          })
        }
      >
        <img
          src="/icon.svg"
          alt="icon"
          className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 "
        />
      </Button>
      <ul className="hidden items-end gap-x-2 text-sm md:flex md:gap-x-4 lg:gap-x-5 ">
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
        <Dialog>
          <DialogTrigger>
            <Button
              variant={"ghost"}
              size={"sm"}
              className="text-muted-foreground"
            >
              Pricing
            </Button>
          </DialogTrigger>
          <DialogContent>
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
        </Dialog>
      </ul>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button size={"sm"} className="px-2 py-1 md:hidden" variant={"ghost"}>
            <Menu className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 " />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="flex items-center justify-center ">
          <div className="grid h-full w-full grid-cols-3 p-5">
            <Button
              variant={"ghost"}
              size={"sm"}
              onClick={() => {
                setIsDrawerOpen(false)
                setTimeout(() => {
                  document
                    .getElementById("tools")
                    ?.scrollIntoView({ block: "center", inline: "center" })
                }, 500)
              }}
            >
              Features
            </Button>
            <Button
              variant={"ghost"}
              size={"sm"}
              onClick={() => {
                setIsDrawerOpen(false)
                setTimeout(() => {
                  document
                    .getElementById("download")
                    ?.scrollIntoView({ block: "center", inline: "center" })
                }, 500)
              }}
            >
              Download
            </Button>
            <a
              className={buttonVariants({
                size: "sm",
                variant: "ghost"
              })}
            >
              Pricing
            </a>
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  )
}

export default Nav
