import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { open } from "@tauri-apps/plugin-dialog"
import { useFormContext } from "react-hook-form"
import type { z } from "zod"
import type { newConnectionFormSchema } from "../schema"

export const SQLiteConnectionForm = () => {
  const form = useFormContext<z.infer<typeof newConnectionFormSchema>>()

  return (
    <FormField
      control={form.control}
      name="connectionOpts.filePath"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>File Path</FormLabel>
          <FormControl>
            <InputGroup>
              <InputGroupInput {...field} placeholder="./test/dev.db" />
              <InputGroupAddon align={"inline-end"}>
                <InputGroupButton
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
                  Pick
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
