"use client"
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
import { Drivers, DriversValues } from "@/lib/types"
import { constructConnectionString } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createConnectionRecord, testConnection } from "../actions"

const formSchema = z.object({
  connName: z.string(),
  username: z.string(),
  password: z.string(),
  host: z.string().ip(),
  port: z.coerce.number({ invalid_type_error: "Field is not a valid port" }),
  db: z.string()
})

interface ConnectionParamsFormProps {
  driver: Exclude<DriversValues, typeof Drivers.SQLite>
}

const ConnectionParamsForm = ({ driver }: ConnectionParamsFormProps) => {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })
  const onClickConnect = async ({
    connName,
    username,
    password,
    host,
    port,
    db
  }: z.infer<typeof formSchema>) => {
    const connString = constructConnectionString({
      driver,
      username,
      password,
      host,
      port,
      db
    })
    await createConnectionRecord(connName, connString, driver)
    router.push("/connections")
  }

  const onClickTest = async ({
    username,
    password,
    host,
    port,
    db
  }: z.infer<typeof formSchema>) => {
    const connString = constructConnectionString({
      driver,
      username,
      password,
      host,
      port,
      db
    })
    await testConnection(connString)
  }
  return (
    <Form {...form}>
      <form className="grid grid-cols-2 gap-x-7 gap-y-7 lg:gap-x-14 lg:gap-y-14 ">
        <FormField
          control={form.control}
          name="connName"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Connection Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g awesome project dev" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="host"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Host</FormLabel>
              <FormControl>
                <Input placeholder="host" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="db"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DB</FormLabel>
              <FormControl>
                <Input placeholder="DB name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="port"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Port</FormLabel>
              <FormControl>
                <Input placeholder="port" inputMode="numeric" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="col-span-full flex justify-center items-center gap-x-4">
          <Button
            variant={"secondary"}
            className="w-[100px]"
            onClick={form.handleSubmit(onClickConnect)}
          >
            Connect
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-700 w-[100px]"
            onClick={form.handleSubmit(onClickTest)}
          >
            Test
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ConnectionParamsForm
