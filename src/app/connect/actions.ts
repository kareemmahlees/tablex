import { invoke } from "@tauri-apps/api";
import toast from "react-hot-toast";

export const testSQLiteConnection = async (selectedPath: string) => {
  const command = invoke<string>("test_sqlite_conn", {
    connString: `sqlite://${selectedPath}`,
  });
  toast.promise(command, {
    loading: "Loading",
    success: (s) => s,
    error: (e: string) => e,
  });
};

export const connectSqlite = async (selectedPath: string) => {
  await invoke("create_sqlite_connection", {
    connString: `sqlite://${selectedPath}`,
  });
};
