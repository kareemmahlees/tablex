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
import { Drivers } from "@/lib/types"
import { constructConnectionString } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { open } from "@tauri-apps/api/dialog"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createConnectionRecord, testConnection } from "../actions"

const SqliteConnection = () => {
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

export default SqliteConnection

interface ConnectionFormProps {
  selectedPath: string
}

const formSchema = z.object({
  connName: z.string().min(1, { message: "Connection name is required" })
})

const ConnectionForm = ({ selectedPath }: ConnectionFormProps) => {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })
  const onClickConnect = (values: z.infer<typeof formSchema>) => {
    const connString = constructConnectionString({
      driver: Drivers.SQLite,
      filePath: selectedPath
    })
    createConnectionRecord(values.connName, connString, Drivers.SQLite)
    router.push("/connections")
  }

  const onClickTest = async () => {
    const connString = constructConnectionString({
      driver: Drivers.SQLite,
      filePath: selectedPath
    })
    await testConnection(connString, Drivers.SQLite)
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
        <div className="col-span-full flex items-center justify-center gap-x-4">
          <Button
            variant={"secondary"}
            className="w-[100px]"
            onClick={form.handleSubmit(onClickConnect)}
          >
            Connect
          </Button>
          <Button
            type="button"
            className="w-[100px] bg-green-500 hover:bg-green-700"
            onClick={onClickTest}
          >
            Test
          </Button>
        </div>
      </form>
    </Form>
  )
}
