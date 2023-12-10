import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { open } from "@tauri-apps/api/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { connectSQLite, testSQLiteConnection } from "../actions";

const formSchema = z.object({
  connName: z.string().min(1, { message: "Connection name is required" })
});

const SqliteConnectionDetails = () => {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState("");
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    connectSQLite(values.connName, selectedPath);
    router.push("/connections");
  };

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
                extensions: ["db"]
              }
            ]
          });
          setSelectedPath((selected as string) ?? "");
        }}
      >
        Select DB file
      </Button>
      {selectedPath !== "" && (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-10">
          <div className="space-y-2">
            <Label htmlFor="connName">Connection Name</Label>
            <Input
              className={cn("placeholder:text-muted-foreground text-black ", {
                "focus-visible:ring-red-500": errors.connName
              })}
              {...register("connName")}
              placeholder="e.g awesome project dev"
            />
            {errors.connName && (
              <p className="text-sm text-red-500">{errors.connName.message}</p>
            )}
          </div>
          <pre>{selectedPath}</pre>
          <div className="col-span-full flex justify-center items-center gap-x-4">
            <Button variant={"secondary"} className="w-[100px]" type="submit">
              Connect
            </Button>
            <Button
              type="button"
              className="bg-green-500 hover:bg-green-700 w-[100px]"
              onClick={() => testSQLiteConnection(selectedPath)}
            >
              Test
            </Button>
          </div>
        </form>
      )}
    </>
  );
};

export default SqliteConnectionDetails;
