import { LinkIcon } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "./ui/button"

const CreateConnectionBtn = () => {
  return (
    <Link href={"/connect"} className={buttonVariants({ size: "sm" })}>
      <LinkIcon className="text-muted-foreground mr-3" size={20} />
      Start a connection
    </Link>
  )
}

export default CreateConnectionBtn
