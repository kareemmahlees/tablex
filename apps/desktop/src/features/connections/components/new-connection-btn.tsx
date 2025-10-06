import { commands } from "@/bindings"
import { SearchableInput } from "@/components/custom/searchable-input"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MappedDrivers } from "@/lib/types"
import { constructConnectionString } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@tablex/lib/utils"
import { useRouter } from "@tanstack/react-router"
import { PlusCircle } from "lucide-react"
import { type Dispatch, type SetStateAction, useState } from "react"
import { useForm, useFormContext, useWatch } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { NewConnectionFormSchema } from "../schema"
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
  const form = useForm<z.infer<typeof NewConnectionFormSchema>>({
    resolver: zodResolver(NewConnectionFormSchema)
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

  const onConnect = async (data: z.infer<typeof NewConnectionFormSchema>) => {
    const connString = constructConnectionString({
      ...data.connectionOpts
    })
    toast.promise(
      commands.establishConnection(connString, data.connectionOpts.driver),
      {
        id: "establish_connection",
        success: () => {
          router.navigate({ to: "/dashboard/table-view/empty" })
          return null
        },
        error: "Failed to establish connection"
      }
    )
  }

  const onSave = async (data: z.infer<typeof NewConnectionFormSchema>) => {
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

  const onTest = async (data: z.infer<typeof NewConnectionFormSchema>) => {
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
          "flex h-full flex-col items-center justify-center overflow-hidden",
          driver === "sqlite" && "gap-y-9"
        )}
      >
        <div className="flex w-full items-end gap-x-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Name</FormLabel>
                <Input {...field} placeholder="Connection Name" />
              </FormItem>
            )}
          />
          <DriverSelector />
        </div>
        {renderDriverInputFields()}

        {driver && (
          <div className="col-span-full mt-4 flex items-center justify-center gap-x-4">
            <Button
              type="button"
              variant={"secondary"}
              size={"sm"}
              className="w-[100px]"
              onClick={form.handleSubmit(onConnect)}
            >
              Connect
            </Button>
            <Button
              type="button"
              className="w-[100px]"
              size={"sm"}
              onClick={form.handleSubmit(onSave)}
            >
              Save
            </Button>
            <Button
              type="button"
              className="w-[100px] bg-green-500 hover:bg-green-700"
              size={"sm"}
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
  const form = useFormContext<z.infer<typeof NewConnectionFormSchema>>()

  return (
    <FormField
      control={form.control}
      name="connectionOpts.driver"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Driver</FormLabel>
          <SearchableInput
            items={MappedDrivers.map((driver) => ({
              value: driver.value,
              label: driver.label
            }))}
            placeholder="Select a Database Driver"
            emptyMsg="No drivers found."
            onValueChange={field.onChange}
            preventUnselect
          />
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
