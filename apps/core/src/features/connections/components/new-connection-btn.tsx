import { commands } from "@/bindings"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { MappedDrivers } from "@/lib/types"
import { constructConnectionString } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@tablex/lib/utils"
import { useNavigate } from "@tanstack/react-router"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"
import { useState } from "react"
import { useForm, useFormContext, useWatch } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { NewConnectionFormSchema } from "../schema"
import { PgMySQLConnectionForm } from "./pg-mysql-connection"
import { SQLiteConnectionForm } from "./sqlite-connection-form"

export const NewConnectionBtn = () => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button size={"sm"} className="space-x-2">
          <PlusCircle className="size-4" />
          <span>New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-sidebar">
        <DialogHeader>
          <DialogTitle>Create a new connection</DialogTitle>
          <DialogDescription>
            Add a new connection to the list
          </DialogDescription>
        </DialogHeader>
        <NewConnectionForm />
      </DialogContent>
    </Dialog>
  )
}

const NewConnectionForm = () => {
  const navigate = useNavigate()
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
    try {
      await commands.establishConnection(connString, data.connectionOpts.driver)
      navigate({
        to: "/dashboard/table-view/empty"
      })
    } catch (_) {
      return toast.error("Failed to establish connection")
    }
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
        loading: "Saving connection...",
        success: () => "Closes me",
        error: "Couldn't save connection"
      }
    )
  }

  const onTest = async (data: z.infer<typeof NewConnectionFormSchema>) => {
    const connString = constructConnectionString({
      ...data.connectionOpts
    })
    return toast.promise(commands.testConnection(connString), {
      loading: "Testing connection...",
      success: "Connection is healthy",
      error: "Connection is unhealthy"
    })
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
  const [open, setIsOpen] = useState(false)

  return (
    <FormField
      control={form.control}
      name="connectionOpts.driver"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Driver</FormLabel>
          <Popover open={open} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button role="combobox" className="w-[230px] justify-between">
                  {field.value
                    ? MappedDrivers.find(
                        (driver) => driver.value === field.value
                      )?.label
                    : "Select a Database Driver"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search driver..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No drivers found.</CommandEmpty>
                  <CommandGroup>
                    {MappedDrivers.map((driver) => (
                      <CommandItem
                        key={driver.value}
                        value={driver.value}
                        onSelect={(currValue) => {
                          field.onChange(currValue)
                          setIsOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            driver.value === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {driver.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
