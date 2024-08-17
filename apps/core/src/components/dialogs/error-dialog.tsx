import { PropsWithChildren } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"

type ErrorDialogProps = PropsWithChildren & {
  error: string
}

const ErrorDialog = ({ error, children }: ErrorDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col items-start">
        <Button variant={"link"}>Show logs</Button>
        <code className="w-full overflow-auto rounded-md border-2 p-2">
          {error}
        </code>
      </DialogContent>
    </Dialog>
  )
}

export default ErrorDialog
