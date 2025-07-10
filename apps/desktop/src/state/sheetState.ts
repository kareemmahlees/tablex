import { create } from "zustand"

type SheetState = {
  isOpen: boolean
  toggleSheet: (open: boolean) => void
}

/**
 * Because all sheets' states are basically the same, this helper
 * creates a default state logic for all sheets.
 */
const createSheetState = () =>
  create<SheetState>((set) => ({
    isOpen: false,
    toggleSheet: (open: boolean) => set(() => ({ isOpen: open }))
  }))

export const useCreateRowSheetState = createSheetState()
export const useEditRowSheetState = createSheetState()
