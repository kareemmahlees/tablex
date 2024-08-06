import { Dialog, DialogContent } from "@/components/ui/dialog"
import { usePreferencesState } from "@/state/dialogState"

const PreferencesDialog = () => {
  const { isOpen, toggleDialog } = usePreferencesState()
  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="h-5/6 w-5/6 max-w-full bg-[#282828] p-0">
        <aside className="w-1/6 border-zinc-600 bg-[#1a1d1e]"></aside>
      </DialogContent>
    </Dialog>
  )
}

export default PreferencesDialog
