import { commands, Settings } from "@/bindings"
import { unwrapResult } from "@/lib/utils"
import { createContext, useContext } from "react"

/**
 * Loads the `settings.json` file and can be accessed from components
 * through {@link useSettings} context hook.
 */
export class SettingsManager {
  //@ts-expect-error it's assigned in the constructor but typescript cannot detect it
  settings: Settings

  constructor() {
    commands.loadSettingsFile().then((result) => {
      const settings = unwrapResult(result)
      if (!settings) return
      this.settings = settings
    })
  }
}

export const SettingsContext = createContext(new SettingsManager())

/**
 * A react context hook to access the {@link SettingsManager} from anywhere in the application.
 */
export const useSettings = () => {
  const settingsManager = useContext(SettingsContext)
  return settingsManager.settings
}
