import { commands } from "@/bindings"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { TabsContent } from "@/components/ui/tabs"
import { useSettings } from "@/features/settings/manager"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileJson2 } from "lucide-react"
import type { PropsWithChildren } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

const formSchema = z.object({
  checkForUpdates: z.boolean(),
  pageSize: z.coerce.number().min(1, { message: "This field is required" }),
  sqlEditor: z.object({
    minimap: z.boolean(),
    fontSize: z.coerce
      .number()
      .min(1, { message: "This field is required" })
      .max(64)
  })
})

export const PreferencesTab = () => {
  const settings = useSettings()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: settings
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const result = await commands.writeIntoSettingsFile(data)
    if (result.status === "error") {
      return toast.error("Failed to update settings.", {
        description: result.error.details
      })
    }
    return toast.success("Successfully updated settings", {
      description: "A hard refresh is required",
      action: {
        label: "Refresh",
        onClick: () => location.reload()
      }
    })
  }

  return (
    <TabsContent value="preferences" className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="checkForUpdates"
            render={({ field }) => (
              <SettingsEntry
                label="Automatic updates"
                description="TableX will regularly check for updates."
              >
                <Switch
                  className="data-[state=unchecked]:bg-zinc-700"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </SettingsEntry>
            )}
          />
          <Separator className="bg-zinc-700" />
          <FormField
            control={form.control}
            name="pageSize"
            render={({ field }) => (
              <SettingsEntry
                label="Page Size"
                description="Number of rows to be fetched per page."
              >
                <div className="flex flex-col items-end">
                  <Input type="number" {...field} className="w-[100px]" />
                  <FormMessage />
                </div>
              </SettingsEntry>
            )}
          />
          <Separator className="bg-zinc-700" />
          <h3 className="text-lg font-semibold">SQL Editor</h3>
          <div className="ml-10 space-y-3">
            <FormField
              control={form.control}
              name="sqlEditor.minimap"
              render={({ field }) => (
                <SettingsEntry
                  label="Minimap"
                  description="Toggle minimap visibility."
                >
                  <Switch
                    className="data-[state=unchecked]:bg-zinc-700"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </SettingsEntry>
              )}
            />
            <Separator className="bg-zinc-700" />
            <FormField
              control={form.control}
              name="sqlEditor.fontSize"
              render={({ field }) => (
                <SettingsEntry
                  label="Font size"
                  description="Editor font size."
                >
                  <div className="flex flex-col items-end">
                    <Input type="number" {...field} className="w-[100px]" />
                    <FormMessage />
                  </div>
                </SettingsEntry>
              )}
            />
          </div>
          <div className="absolute bottom-7 right-4 flex flex-row-reverse items-center gap-x-3">
            <Button type="submit" size={"sm"}>
              Save
            </Button>
            <Button
              variant={"outline"}
              size={"icon"}
              onClick={async () =>
                await commands.openInExternalEditor("settings")
              }
            >
              <FileJson2 className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </TabsContent>
  )
}

type SettingsEntryProps = PropsWithChildren & {
  label: string
  description: string
}

const SettingsEntry = (props: SettingsEntryProps) => {
  return (
    <FormItem className="flex w-full items-center justify-between">
      <div className="space-y-0.5">
        <FormLabel className="text-base">{props.label}</FormLabel>
        <FormDescription>{props.description}</FormDescription>
      </div>
      <FormControl>{props.children}</FormControl>
    </FormItem>
  )
}
