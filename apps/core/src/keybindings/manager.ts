import {
  Keybinding,
  KeybindingCommand,
  KEYBINDINGS_FILE_NAME
} from "@/bindings"
import { BaseDirectory, readTextFile } from "@tauri-apps/plugin-fs"
import hotkeys from "hotkeys-js"
import { createContext, useContext } from "react"

/**
 * Class responsible for loading the keybindings from the keybindings file,
 * and register handlers for those keybindings on your desire.
 *
 * It can be used anywhere in the application through the {@link useKeybindings} context hook.
 */
export class KeybindingsManager {
  bindings: Keybinding[] = []

  constructor() {
    readTextFile(KEYBINDINGS_FILE_NAME, {
      baseDir: BaseDirectory.AppConfig
    }).then((bindings) => (this.bindings = JSON.parse(bindings)))
  }

  /**
   * Register handlers keybindings' commands.
   * Handlers will be called once the shortcut is triggered by the user.
   * @param keybindings array of commands and their respective handlers.
   */
  registerKeybindings(
    keybindings: {
      command: KeybindingCommand
      handler: () => void
    }[]
  ) {
    keybindings.forEach((keybinding) => {
      const binding = this.bindings.find(
        (binding) => binding.command == keybinding.command
      )
      if (binding) {
        hotkeys(binding.shortcuts.join(","), keybinding.handler)
      }
    })
  }
}

export const KeybindingsManagerContext = createContext(new KeybindingsManager())

/**
 * A react context hook to access the {@link KeybindingsManager} from anywhere in the application.
 */
export const useKeybindings = () => {
  return useContext(KeybindingsManagerContext)
}
