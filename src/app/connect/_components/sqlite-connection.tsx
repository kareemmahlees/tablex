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
import { useState, type FC } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createConnectionRecord, testConnection } from "../actions"

const SqliteConnection = () => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

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
                extensions: ["db"]
              }
            ]
          })
          setSelectedPath((selected as string) ?? null)
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

const ConnectionForm: FC<ConnectionFormProps> = ({ selectedPath }) => {
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
        <pre className="text-sm text-muted-foreground">{selectedPath}</pre>
        <div className="col-span-full flex justify-center items-center gap-x-4">
          <Button
            variant={"secondary"}
            className="w-[100px]"
            onClick={form.handleSubmit(onClickConnect)}
          >
            Connect
          </Button>
          <Button
            type="button"
            className="bg-green-500 hover:bg-green-700 w-[100px]"
            onClick={onClickTest}
          >
            Test
          </Button>
        </div>
      </form>
    </Form>
  )
}
