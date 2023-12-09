import { invoke } from "@tauri-apps/api/tauri";
import { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";

export const getRows = async (tableName: string) => {
  return await invoke<Record<string, any>[]>("get_rows", { tableName });
};

export const getColumns = async (tableName: string) => {
  return await invoke<string[]>("get_columns", { tableName });
};

export const deleteRows = async (
  col: string,
  pkRowValues: any[] | any,
  tableName: string
) => {
  return await invoke<number>("delete_row", {
    col,
    pkRowValues: typeof pkRowValues === "object" ? pkRowValues : [pkRowValues],
    tableName,
  });
};

export const updateRow = async (
  tableName: string,
  pkValue: any,
  data: Record<string, any>,
  setOpenSheet: Dispatch<SetStateAction<boolean>>
) => {
  const command = invoke("update_row", { tableName, pkValue, data });
  toast.promise(command, {
    loading: "Updating...",
    success: (s) => {
      setOpenSheet(false);
      return `Successfully updated rows`;
    },
    error: (e: string) => e,
  });
};
