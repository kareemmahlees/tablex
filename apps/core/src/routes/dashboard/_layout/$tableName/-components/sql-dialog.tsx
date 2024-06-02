import { events } from "@/bindings"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useState } from "react"

const SQLDialog = () => {
  const [open, setOpen] = useState(false)

  events.sqlDialogOpen.listen(() => setOpen(true))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="h-3/4 w-2/3 bg-red-500">
        {/* <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader> */}
        <div className=""></div>
      </DialogContent>
    </Dialog>
  )
}

export default SQLDialog
