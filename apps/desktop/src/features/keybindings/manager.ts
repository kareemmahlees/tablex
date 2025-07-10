import {
  Keybinding,
  KeybindingCommand,
  KEYBINDINGS_FILE_NAME
} from "@/bindings"
import { BaseDirectory, readFile } from "@tauri-apps/plugin-fs"
import { debug } from "@tauri-apps/plugin-log"
import hotkeys from "hotkeys-js"
import { createContext, useContext } from "react"

export type RegisteredBinding = {
  command: KeybindingCommand
  handler: () => void
}

export type EditedBinding = {
  command: KeybindingCommand
  shortcuts: string[]
}

/**
 * Class responsible for loading the keybindings from the keybindings file,
 * and register handlers for those keybindings on your desire.
 *
 * It can be used anywhere in the application through the {@link useKeybindings} context hook.
 */
export class KeybindingsManager {
  bindings: Keybinding[] = []
  registeredKeybindings: RegisteredBinding[] = []

  constructor() {
    // HACK: idk what's wrong but `readTextFile` from tauri seems to always
    // return an `ArrayBuffer` instead of string for some reason for some reason.
    readFile(KEYBINDINGS_FILE_NAME, {
      baseDir: BaseDirectory.AppConfig
    }).then((bindings) => {
      const decodedBindings = new TextDecoder("utf-8").decode(bindings)
      this.bindings = JSON.parse(decodedBindings)
    })
  }

  /**
   * Register handlers keybindings' commands.
   * Handlers will be called once the shortcut is triggered by the user.
   * @param keybindings keybindings to be registered.
   */
  registerKeybindings(keybindings: RegisteredBinding[]) {
    keybindings.forEach((keybinding) => {
      const binding = this.bindings.find(
        (binding) => binding.command == keybinding.command
      )
      if (binding) {
        this.registeredKeybindings.push(keybinding)
        hotkeys(binding.shortcuts.join(","), (_, event) => {
          debug(
            `Keybinding activated: { shortcut: ${event.shortcut}, command: ${keybinding.command} }`
          )
          keybinding.handler()
        })
      }
    })
  }

  /**
   * ReRegister edited keybindings.
   * @param keybindings edited keybindings
   */
  reRegister(keybindings: EditedBinding[]) {
    keybindings.forEach((keybinding) => {
      const toBeReRegistered = this.registeredKeybindings.find(
        (registered) => registered.command === keybinding.command
      )
      if (toBeReRegistered) {
        hotkeys(keybinding.shortcuts.join(","), toBeReRegistered.handler)
      }
    })
  }
}

export const KeybindingsContext = createContext(new KeybindingsManager())

/**
 * A react context hook to access the {@link KeybindingsManager} from anywhere in the application.
 */
export const useKeybindings = () => {
  return useContext(KeybindingsContext)
}
