import { create } from "zustand"

type DialogState = {
  isOpen: boolean
  toggleDialog: (open?: boolean) => void
}

/**
 * Because all dialogs' states are basically the same, this helper
 * creates a default state logic for all dialogs.
 */
export const createDialogState = () =>
  create<DialogState>((set) => ({
    isOpen: false,
    toggleDialog: (open?: boolean) =>
      set((state) => ({ isOpen: open || !state.isOpen }))
  }))

export const useMetaXState = createDialogState()
