import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form"
import { open } from "@tauri-apps/plugin-dialog"
import { useFormContext } from "react-hook-form"
import type { z } from "zod"
import type { NewConnectionFormSchema } from "../schema"

export const SQLiteConnectionForm = () => {
  const form = useFormContext<z.infer<typeof NewConnectionFormSchema>>()

  return (
    <>
      <FormField
        control={form.control}
        name="connectionOpts.filePath"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Button
                variant={"secondary"}
                onClick={async () => {
                  const file = await open({
                    multiple: false,
                    filters: [
                      {
                        name: "DB File",
                        extensions: [
                          "db",
                          "db3",
                          "s3db",
                          "sl3",
                          "sqlite",
                          "sqlite3"
                        ]
                      }
                    ]
                  })
                  field.onChange(file)
                }}
              >
                Select DB file
              </Button>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* {selectedPath && <ConnectionForm selectedPath={selectedPath} />} */}
    </>
  )
}
