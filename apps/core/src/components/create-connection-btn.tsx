import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"
import { LinkIcon } from "lucide-react"
import { buttonVariants } from "./ui/button"

const CreateConnectionBtn = () => {
  return (
    <Link
      to={"/connect"}
      className={cn(buttonVariants({ size: "sm" }), "space-x-2")}
    >
      <LinkIcon className="text-muted-foreground" size={20} />
      <p>Start a connection</p>
    </Link>
  )
}

export default CreateConnectionBtn
