import {} from "@tauri-apps/api/"
import {
  isRegistered,
  register,
  unregister
} from "@tauri-apps/plugin-global-shortcut"
import {
  copyRowsIntoClipboard,
  deleteRowsHandler,
  selectAllRowsHandler
} from "./row"

const focusSearchBarHandler = () => {
  const inputElem = document.getElementById("search_input")
  if (inputElem) {
    inputElem.focus()
  }
}

const availableShortcuts = {
  "CommandOrControl+S": focusSearchBarHandler,
  Delete: deleteRowsHandler,
  "CommandOrControl+A": selectAllRowsHandler,
  "CommandOrControl+C": copyRowsIntoClipboard
} as const

type Shortcuts = {
  [k in keyof typeof availableShortcuts]?: Parameters<
    (typeof availableShortcuts)[k]
  >
}

export const registerShortcuts = async (shortcuts: Shortcuts) => {
  Object.entries(shortcuts).forEach(async ([shortcut, params]) => {
    if (await isRegistered(shortcut)) {
      await unregister(shortcut)
    }

    await register(shortcut, () => availableShortcuts[shortcut](...params))
  })
}
