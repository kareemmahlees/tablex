import { invoke } from "@tauri-apps/api/tauri"

export const closeSplashScreen = async () => {
  return await invoke("close_splashscreen")
}
