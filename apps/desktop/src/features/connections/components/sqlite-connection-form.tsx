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
          <FormItem className="mt-4 flex w-full flex-col items-center">
            <FormControl>
              <Button
                type="button"
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
                className="w-1/2"
              >
                Select DB file
              </Button>
            </FormControl>
            <code>{field.value}</code>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
