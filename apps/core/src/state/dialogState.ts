import { create } from "zustand"

type DialogState = {
  isOpen: boolean
  toggleDialog: () => void
}

const createDialogState = create<DialogState>((set) => ({
  isOpen: false,
  toggleDialog: () => set((state) => ({ isOpen: !state.isOpen }))
}))

const useCommandPaletteState = createDialogState

export { useCommandPaletteState }
