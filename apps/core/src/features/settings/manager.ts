import { commands, Settings, SETTINGS_FILE_PATH } from "@/bindings"
import { BaseDirectory, watchImmediate } from "@tauri-apps/plugin-fs"
import { createContext, useContext, useEffect, useState } from "react"

/**
 * Loads the `settings.json` file and can be accessed from components
 * through {@link useSettings} context hook.
 */
export class SettingsManager {
  settings!: Settings

  constructor() {
    commands.loadSettingsFile().then((result) => {
      this.settings = result
    })
  }
}

export const SettingsContext = createContext(new SettingsManager())

/**
 * A react context hook to access the {@link SettingsManager} from anywhere in the application.
 * This hook is reactive, meaning that it will listen for changes in the settings file and will
 * update the UI accordingly, no need to refresh or invalidate anything.
 */
export const useSettings = () => {
  const settingsManager = useContext(SettingsContext)
  const [settings, setSettings] = useState(settingsManager.settings)

  useEffect(() => {
    void watchImmediate(
      SETTINGS_FILE_PATH,
      async () => {
        const newSettings = await commands.loadSettingsFile()
        settingsManager.settings = newSettings
        setSettings(newSettings)
      },
      {
        baseDir: BaseDirectory.AppConfig
      }
    )
  }, [])

  return settings
}
