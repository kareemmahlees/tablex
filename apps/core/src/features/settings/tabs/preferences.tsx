import { commands } from "@/bindings"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/features/settings/manager"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileJson } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import {
  Setting,
  SettingsContent,
  SettingsHeader,
  SettingsSection
} from "../components/settings"

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
    try {
      await commands.writeIntoSettingsFile(data)

      return toast.success("Successfully updated settings", {
        position: "bottom-center"
      })
    } catch (error) {
      return toast.error("Failed to update settings.", {
        description: error.details
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-16">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Preferences</h1>
          <div className="flex flex-row-reverse items-center gap-x-3">
            <Button
              type="submit"
              size={"sm"}
              disabled={form.formState.isSubmitting}
            >
              Save
            </Button>
            <Button
              variant={"secondary"}
              size={"icon"}
              onClick={async () =>
                await commands.openInExternalEditor("settings")
              }
            >
              <FileJson className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <SettingsSection>
          <SettingsHeader>General</SettingsHeader>
          <SettingsContent>
            <FormField
              control={form.control}
              name="checkForUpdates"
              render={({ field }) => (
                <Setting
                  label="Check for updates"
                  description="TableX will check for updates on each startup."
                >
                  <Switch
                    className="data-[state=unchecked]:bg-zinc-700"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Setting>
              )}
            />
            <FormField
              control={form.control}
              name="pageSize"
              render={({ field }) => (
                <Setting
                  label="Page Size"
                  description="Number of rows to be fetched per page."
                >
                  <div className="flex flex-col items-end">
                    <Input type="number" {...field} className="w-[100px]" />
                    <FormMessage />
                  </div>
                </Setting>
              )}
            />
          </SettingsContent>
        </SettingsSection>

        <SettingsSection>
          <SettingsHeader>SQL Editor</SettingsHeader>
          <SettingsContent>
            <FormField
              control={form.control}
              name="sqlEditor.minimap"
              render={({ field }) => (
                <Setting
                  label="Minimap"
                  description="Toggle minimap visibility."
                >
                  <Switch
                    className="data-[state=unchecked]:bg-zinc-700"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Setting>
              )}
            />
            <FormField
              control={form.control}
              name="sqlEditor.fontSize"
              render={({ field }) => (
                <Setting label="Font size" description="Editor font size.">
                  <div className="flex flex-col items-end">
                    <Input type="number" {...field} className="w-[100px]" />
                    <FormMessage />
                  </div>
                </Setting>
              )}
            />
          </SettingsContent>
        </SettingsSection>
      </form>
    </Form>
  )
}
