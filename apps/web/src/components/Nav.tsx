import { Menu } from "lucide-react"
import { Button } from "./ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer"

const Nav = () => {
  return (
    <nav className="w-full fixed -top-0 backdrop-blur-md z-[999] flex justify-between p-2 md:p-3 lg:p-4 items-center">
      <Button
        size={"sm"}
        variant={"ghost"}
        className="hover:bg-transparent"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          })
        }
      >
        <img
          src="/icon.svg"
          alt="icon"
          className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 "
        />
      </Button>
      <ul className="items-end gap-x-2 md:gap-x-4 lg:gap-x-5 text-sm hidden md:flex ">
        <Button variant={"ghost"} size={"sm"} className="text-muted-foreground">
          Features
        </Button>
        <Button variant={"ghost"} size={"sm"} className="text-muted-foreground">
          Download
        </Button>
        <Button variant={"ghost"} size={"sm"} className="text-muted-foreground">
          Pricing
        </Button>
      </ul>
      <Drawer>
        <DrawerTrigger asChild>
          <Button size={"sm"} className="px-2 py-1 md:hidden" variant={"ghost"}>
            <Menu className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 " />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="flex items-center justify-center ">
          <div className="grid grid-cols-3 w-full h-full p-5">
            <Button size={"sm"} variant={"ghost"}>
              Features
            </Button>
            <Button size={"sm"} variant={"ghost"}>
              Download
            </Button>
            <Button size={"sm"} variant={"ghost"}>
              Pricing
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  )
}

export default Nav
