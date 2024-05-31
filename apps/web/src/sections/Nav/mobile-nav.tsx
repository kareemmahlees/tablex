import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Menu } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "../../components/ui/dialog"

const MobileNav = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button size={"sm"} className="px-2 py-1 md:hidden" variant={"ghost"}>
            <Menu className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="flex items-center justify-center">
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
            <Button
              variant={"ghost"}
              size={"sm"}
              onClick={() => {
                setIsDrawerOpen(false)
                setIsDialogOpen(true)
              }}
            >
              Pricing
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
      <DialogContent className="w-2/3 rounded-md md:w-full">
        <DialogHeader>
          <DialogTitle>100% Free 🥳</DialogTitle>
          <DialogDescription>
            Tablex is absolutely free to download and use, if you would like to
            support the project, consider giving us a Star ⭐ on{" "}
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
  )
}

export default MobileNav
