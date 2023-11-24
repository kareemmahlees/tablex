import { Button } from "@/components/ui/button";
import { open } from "@tauri-apps/api/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { connectSqlite, testSQLiteConnection } from "../actions";

const SqliteConnectionDetails = () => {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState("");

  return (
    <>
      <Button
        className="bg-blue-500 hover:bg-blue-700"
        onClick={async () => {
          const selected = await open({
            multiple: false,
            filters: [
              {
                name: "DB File",
                extensions: ["db"],
              },
            ],
          });
          setSelectedPath((selected as string) ?? "");
        }}
      >
        Select DB file
      </Button>
      <pre>{selectedPath}</pre>
      {selectedPath !== "" ? (
        <div className="col-span-full flex justify-center items-center gap-x-4">
          <Button
            variant={"secondary"}
            className="w-[100px]"
            onClick={() => {
              connectSqlite(selectedPath);
              router.push("/connections");
            }}
          >
            Connect
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-700 w-[100px]"
            onClick={() => testSQLiteConnection(selectedPath)}
          >
            Test
          </Button>
        </div>
      ) : null}
    </>
  );
};

export default SqliteConnectionDetails;
