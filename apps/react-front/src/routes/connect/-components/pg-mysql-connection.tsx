import {
  createConnectionRecord,
  establishConnection,
  testConnection
} from "@/commands/connection"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Drivers, type SupportedDrivers } from "@/lib/types"
import { constructConnectionString, customToast } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import ConnectionActions from "./connection-actions"

interface ConnectionParamsProps {
  driver: Exclude<SupportedDrivers, typeof Drivers.SQLite>
}

const PgMySQLConnection = ({ driver }: ConnectionParamsProps) => {
  const [radioValue, setRadioValue] = useState<
    (string & NonNullable<unknown>) | "conn_params" | "conn_string"
  >("conn_params")
  return (
    <>
      <RadioGroup
        defaultValue="conn_params"
        className="flex items-center gap-x-7 lg:gap-x-10"
        onValueChange={(value) => setRadioValue(value)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="conn_params"
            id="conn_params"
            className="border-secondary-foreground text-secondary-foreground"
          />
          <Label htmlFor="conn_params" className="hover:cursor-pointer">
            Connection Params
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="conn_string"
            id="conn_string"
            className="border-secondary-foreground text-secondary-foreground"
          />
          <Label htmlFor="conn_string" className="hover:cursor-pointer">
            Connection String
          </Label>
        </div>
      </RadioGroup>
      {radioValue === "conn_params" && <ConnectionParamsForm driver={driver} />}
      {radioValue === "conn_string" && <ConnectionStringForm driver={driver} />}
    </>
  )
}

export default PgMySQLConnection

type ConnectionParamsFormProps = {
  driver: Exclude<SupportedDrivers, typeof Drivers.SQLite>
}

const connectionParamsFormSchema = z.object({
  connName: z.string(),
  username: z.string(),
  password: z.string(),
  host: z.string().ip(),
  port: z.coerce.number({ invalid_type_error: "Field is not a valid port" }),
  db: z.string()
})

const ConnectionParamsForm = ({ driver }: ConnectionParamsFormProps) => {
  const navigate = useNavigate({ from: "/connect" })
  const form = useForm<z.infer<typeof connectionParamsFormSchema>>({
    resolver: zodResolver(connectionParamsFormSchema)
  })

  const onClickConnect = async (
    values: z.infer<typeof connectionParamsFormSchema>
  ) => {
    const connString = constructConnectionString({ ...values, driver })
    customToast(
      establishConnection(connString, driver),
      {
        success: () => {
          navigate({ to: "" }) // TODO navigate to dashboard page
          return "Successfully established connection"
        },
        error: (e: string) => e
      },
      "establish_connection"
    )
  }

  const onClickSave = async (
    values: z.infer<typeof connectionParamsFormSchema>
  ) => {
    const connString = constructConnectionString({
      driver: driver,
      ...values
    })
    await createConnectionRecord(values.connName, connString, Drivers.SQLite)
    navigate({ to: "/connections" })
  }

  const onClickTest = async (
    values: z.infer<typeof connectionParamsFormSchema>
  ) => {
    const connString = constructConnectionString({ ...values, driver })
    await testConnection(connString, driver)
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
        <ConnectionActions
          onClickConnect={form.handleSubmit(onClickConnect)}
          onClickSave={form.handleSubmit(onClickSave)}
          onClickTest={form.handleSubmit(onClickTest)}
        />
      </form>
    </Form>
  )
}

const connectionStringFormSchema = z.object({
  connName: z.string(),
  connString: z.string()
})

type ConnectionStringFormProps = {
  driver: Exclude<SupportedDrivers, typeof Drivers.SQLite>
}

const ConnectionStringForm = ({ driver }: ConnectionStringFormProps) => {
  const navigate = useNavigate({ from: "/connect" })
  const form = useForm<z.infer<typeof connectionStringFormSchema>>({
    resolver: zodResolver(connectionStringFormSchema)
  })

  const onClickConnect = async (
    values: z.infer<typeof connectionStringFormSchema>
  ) => {
    customToast(
      establishConnection(values.connString, driver),
      {
        success: () => {
          navigate({ to: "" }) // TODO navigate to dashboard page
          return "Successfully established connection"
        },
        error: (e) => e
      },
      "establish_connection"
    )
  }

  const onClickSave = async (
    values: z.infer<typeof connectionStringFormSchema>
  ) => {
    await createConnectionRecord(values.connName, values.connString, driver)
    navigate({ to: "/connections" })
  }

  const onClickTest = async (
    values: z.infer<typeof connectionStringFormSchema>
  ) => {
    await testConnection(values.connString, driver)
  }

  return (
    <Form {...form}>
      <form className="space-y-10">
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
          name="connString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection String</FormLabel>
              <FormControl>
                <Input
                  placeholder={`${driver}://user:password@host:port/dbName?sslmode=`}
                  className="w-[300px] lg:w-[400px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <ConnectionActions
          onClickConnect={form.handleSubmit(onClickConnect)}
          onClickSave={form.handleSubmit(onClickSave)}
          onClickTest={form.handleSubmit(onClickTest)}
        />
      </form>
    </Form>
  )
}
