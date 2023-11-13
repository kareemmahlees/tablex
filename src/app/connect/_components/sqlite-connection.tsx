import { Button } from "@/components/ui/button";
import { open } from "@tauri-apps/api/dialog";
const SqliteConnectionDetails = () => {
  return (
    <Button
      className="bg-blue-500 hover:bg-blue-700"
      onClick={async () => {
        await open({
          filters: [
            {
              name: "DB File",
              extensions: ["db"],
            },
          ],
        });
      }}
    >
      Select DB file
    </Button>
  );
};

export default SqliteConnectionDetails;
