import { cn } from "@/lib/utils"
import { LinkIcon } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "./ui/button"

const CreateConnectionBtn = () => {
  return (
    <Link
      href={"/connect"}
      className={cn(
        buttonVariants({ variant: "secondary", size: "sm" }),
        "font-semibold"
      )}
    >
      <LinkIcon className="text-muted-foreground mr-3" size={20} />
      Start a connection
    </Link>
  )
}

export default CreateConnectionBtn
