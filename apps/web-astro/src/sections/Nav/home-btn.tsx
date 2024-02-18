import { Button } from "@/components/ui/button"

const HomeBtn = () => {
  return (
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
  )
}

export default HomeBtn
