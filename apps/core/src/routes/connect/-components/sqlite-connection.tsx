import {
  createConnectionRecord,
  establishConnection,
  testConnection
} from "@/bindings"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Drivers } from "@tablex/lib/types"
import { constructConnectionString, customToast } from "@tablex/lib/utils"
import { useNavigate } from "@tanstack/react-router"
import { open } from "@tauri-apps/plugin-dialog"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import ConnectionActions from "./connection-actions"

const SQLiteConnectionForm = () => {
  const [selectedPath, setSelectedPath] = useState<string>()

  return (
    <>
      <Button
        variant={"secondary"}
        onClick={async () => {
          const selected = await open({
            multiple: false,
            filters: [
              {
                name: "DB File",
                extensions: ["db", "db3", "s3db", "sl3", "sqlite", "sqlite3"]
              }
            ]
          })
          setSelectedPath(selected as string)
        }}
      >
        Select DB file
      </Button>
      {selectedPath && <ConnectionForm selectedPath={selectedPath} />}
    </>
  )
}

export default SQLiteConnectionForm

type ConnectionFormProps = {
  selectedPath: string
}

const formSchema = z.object({
  connName: z.string().min(1, { message: "Connection name is required" })
})

const ConnectionForm = ({ selectedPath }: ConnectionFormProps) => {
  const navigate = useNavigate({ from: "/connect" })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  const onClickConnect = async (values: z.infer<typeof formSchema>) => {
    const connString = constructConnectionString({
      driver: Drivers.SQLite,
      filePath: selectedPath
    })
    customToast(
      establishConnection(connString, Drivers.SQLite),
      () => {
        navigate({
          to: "/dashboard/layout/land",
          search: {
            connectionName: values.connName
          }
        })
        return "Successfully established connection"
      },
      "create_connection"
    )
  }

  const onClickSave = async (values: z.infer<typeof formSchema>) => {
    const connString = constructConnectionString({
      driver: Drivers.SQLite,
      filePath: selectedPath
    })
    await createConnectionRecord(values.connName, connString, Drivers.SQLite)
    navigate({ to: "/connections" })
  }

  const onClickTest = async () => {
    const connString = constructConnectionString({
      driver: Drivers.SQLite,
      filePath: selectedPath
    })
    await testConnection(connString)
  }

  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="connName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g awesome project dev" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <pre className="text-muted-foreground text-sm">{selectedPath}</pre>

        <ConnectionActions
          onClickConnect={form.handleSubmit(onClickConnect)}
          onClickSave={form.handleSubmit(onClickSave)}
          onClickTest={form.handleSubmit(onClickTest)}
        />
      </form>
    </Form>
  )
}
