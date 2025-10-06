import { commands } from "@/bindings"
import MySQL from "@/components/icons/mysql"
import PostgreSQL from "@/components/icons/postgres"
import SQLite from "@/components/icons/sqlite"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
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
import { Drivers } from "@/lib/types"
import { constructConnectionString } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@tablex/lib/utils"
import { useRouter } from "@tanstack/react-router"
import { CheckCircle2, PlusCircle } from "lucide-react"
import { type Dispatch, type SetStateAction, useState } from "react"
import { useForm, useFormContext, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { newConnectionFormSchema } from "../schema"
import { PgMySQLConnectionForm } from "./pg-mysql-connection"
import { SQLiteConnectionForm } from "./sqlite-connection-form"

export const NewConnectionBtn = () => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size={"sm"} className="space-x-2">
          <PlusCircle className="size-4" />
          <span>New Connection</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-sidebar">
        <DialogHeader>
          <DialogTitle>Create a new connection</DialogTitle>
          <DialogDescription>
            Add a new connection to the list
          </DialogDescription>
        </DialogHeader>
        <NewConnectionForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  )
}

const NewConnectionForm = ({
  setOpen
}: {
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const router = useRouter()
  const form = useForm<z.infer<typeof newConnectionFormSchema>>({
    resolver: zodResolver(newConnectionFormSchema),
    defaultValues: {
      connectionOpts: {
        driver: Drivers.SQLite
      }
    }
  })

  const driver = useWatch({
    control: form.control,
    name: "connectionOpts.driver"
  })

  const renderDriverInputFields = () => {
    switch (driver) {
      case "sqlite":
        return <SQLiteConnectionForm />
      case "postgresql":
      case "mysql":
        return <PgMySQLConnectionForm />
    }
  }

  const onSave = async (data: z.infer<typeof newConnectionFormSchema>) => {
    const connString = constructConnectionString({
      ...data.connectionOpts
    })
    return toast.promise(
      commands.createConnectionRecord(
        connString,
        data.name,
        data.connectionOpts.driver
      ),
      {
        id: "save_connection",
        loading: "Saving connection...",
        success: () => {
          router.invalidate({ filter: (d) => d.fullPath === "/" })
          setOpen(false)
          return "Successfully saved connection"
        },
        error: "Couldn't save connection"
      }
    )
  }

  const onTest = async (data: z.infer<typeof newConnectionFormSchema>) => {
    const connString = constructConnectionString({
      ...data.connectionOpts
    })
    return toast.promise(
      commands.testConnection(connString, data.connectionOpts.driver),
      {
        id: "test_connection",
        loading: "Testing connection...",
        success: "Connection is healthy",
        error: "Connection is unhealthy"
      }
    )
  }

  return (
    <Form {...form}>
      <form
        className={cn(
          "flex h-full flex-col items-center justify-center gap-y-7 overflow-hidden"
        )}
      >
        <div className="w-full space-y-5">
          <DriverSelector />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full flex-1">
                <FormLabel>Name</FormLabel>
                <Input {...field} placeholder="Connection Name" />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {renderDriverInputFields()}

        {driver && (
          <div className="mt-10 flex w-full items-center justify-center gap-x-4">
            <Button
              type="button"
              size={"sm"}
              className="w-full"
              onClick={form.handleSubmit(onSave)}
            >
              Save
            </Button>
            <Button
              type="button"
              size={"sm"}
              variant={"secondary"}
              className="w-full"
              onClick={form.handleSubmit(onTest)}
            >
              Test
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}

const DriverSelector = () => {
  const form = useFormContext<z.infer<typeof newConnectionFormSchema>>()

  return (
    <FormField
      control={form.control}
      name="connectionOpts.driver"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
            <RadioGroup
              className="w-full grid-cols-3"
              defaultValue={field.value}
              onValueChange={field.onChange}
            >
              <div className="border-input has-[:checked]:border-primary/50 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-ring/50 shadow-xs group relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-2 py-3 text-center outline-none transition-[color,box-shadow] has-[:focus-visible]:ring-[3px]">
                <RadioGroupItem
                  id={`sqlite`}
                  value={Drivers.SQLite}
                  className="sr-only"
                />
                <SQLite className="size-10" />
                <Label
                  htmlFor={`sqlite`}
                  className="text-foreground cursor-pointer text-xs font-medium leading-none after:absolute after:inset-0"
                >
                  SQLite
                </Label>
                <CheckCircle2 className="text-muted-foreground invisible absolute right-0 top-0 m-2 size-4 group-has-[:checked]:visible" />
              </div>
              <div className="border-input has-[:checked]:border-primary/50 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-ring/50 shadow-xs group relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-2 py-3 text-center outline-none transition-[color,box-shadow] has-[:focus-visible]:ring-[3px]">
                <RadioGroupItem
                  id={`postgres`}
                  value={Drivers.PostgreSQL}
                  className="sr-only"
                />
                <PostgreSQL className="size-10" />
                <Label
                  htmlFor={`postgres`}
                  className="text-foreground cursor-pointer text-xs font-medium leading-none after:absolute after:inset-0"
                >
                  PostgreSQL
                </Label>

                <CheckCircle2 className="text-muted-foreground invisible absolute right-0 top-0 m-2 size-4 group-has-[:checked]:visible" />
              </div>
              <div className="border-input has-[:checked]:border-primary/50 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-ring/50 shadow-xs group relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-2 py-3 text-center outline-none transition-[color,box-shadow] has-[:focus-visible]:ring-[3px]">
                <RadioGroupItem
                  id={`mysql`}
                  value={Drivers.MySQL}
                  className="sr-only"
                />
                <MySQL className="size-10" />
                <Label
                  htmlFor={`mysql`}
                  className="text-foreground cursor-pointer text-xs font-medium leading-none after:absolute after:inset-0"
                >
                  MySQL
                </Label>
                <CheckCircle2 className="text-muted-foreground invisible absolute right-0 top-0 m-2 size-4 group-has-[:checked]:visible" />
              </div>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  )
}
