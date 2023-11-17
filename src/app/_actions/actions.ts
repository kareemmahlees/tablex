import { invoke } from "@tauri-apps/api";

export const check_cons_exist = async () => {
  return await invoke<boolean>("connections_exist");
};
