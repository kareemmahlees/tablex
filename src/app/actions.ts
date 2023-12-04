import { invoke } from "@tauri-apps/api/tauri";

export const checkConsExist = async () => {
  return await invoke<boolean>("connections_exist");
};
