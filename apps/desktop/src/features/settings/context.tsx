import { commands, Settings, SETTINGS_FILE_PATH } from "@/bindings"
import { BaseDirectory, watchImmediate } from "@tauri-apps/plugin-fs"
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState
} from "react"

const SettingsContext = createContext<Settings | undefined>(undefined)

export const SettingsProvider = ({
  children,
  value
}: PropsWithChildren<{ value: Settings }>) => {
  const [settings, setSettings] = useState<Settings>(value)

  useEffect(() => {
    const unwatch = watchImmediate(
      SETTINGS_FILE_PATH,
      async () => {
        const newSettings = await commands.loadSettingsFile()
        setSettings(newSettings)
      },
      {
        baseDir: BaseDirectory.AppConfig,
        recursive: true
      }
    )

    return () => {
      unwatch.then((fn) => fn())
    }
  }, [])

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const settings = useContext(SettingsContext)

  if (!settings)
    throw new Error("useSettings should be used within SettingsProvider")

  return settings
}
