import { commands, Settings } from "@/bindings"
import { unwrapResult } from "@/lib/utils"
import { createContext, useContext } from "react"

/**
 * Loads the `settings.json` file and can be accessed from components
 * through {@link useSettingsManager} context hook.
 */
export class SettingsManager {
  //@ts-expect-error it's assigned in the constructor but typescript cannot detect it
  settings: Settings

  constructor() {
    commands.loadSettingsFile().then((result) => {
      const settings = unwrapResult(result)
      this.settings = settings
      console.log(this.settings)
    })
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
