import { Settings } from "@/bindings"
import { BaseDirectory, readTextFile } from "@tauri-apps/plugin-fs"
import { createContext, useContext } from "react"

/**
 * Loads the `settings.json` file and can be accessed from components
 * through {@link useSettingsManager} context hook.
 */
export class SettingsManager {
  //@ts-expect-error it's assigned in the constructor but typescript cannot detect it
  settings: Settings

  constructor() {
    // TODO: export this as a constant from the backend.
    readTextFile("settings.json", {
      baseDir: BaseDirectory.AppConfig
    }).then((settings) => (this.settings = JSON.parse(settings)))
  }
}

export const SettingsContext = createContext(new SettingsManager())

/**
 * A react context hook to access the {@link SettingsManager} from anywhere in the application.
 */
export const useSettingsManager = () => {
  const settingsManager = useContext(SettingsContext)
  return { settings: settingsManager.settings }
}
