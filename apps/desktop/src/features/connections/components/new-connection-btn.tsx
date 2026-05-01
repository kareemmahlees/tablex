import { Button } from "@tablex/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@tablex/ui/components/dialog"
import { Form } from "@tablex/ui/components/form"
import { Drivers } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { connectionFormSchema } from "../schema"
import { ConnectionForm } from "./connection-form"
import { constructConnectionString } from "@/lib/utils"
import { toast } from "sonner"
import { commands } from "@/bindings"
import { useRouter } from "@tanstack/react-router"

export const NewConnectionBtn = () => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof connectionFormSchema>>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      connectionOpts: {
        driver: Drivers.SQLite
      }
    }
  })

  const onSave = async (data: z.infer<typeof connectionFormSchema>) => {
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
        success: async () => {
          await router.invalidate({ filter: (d) => d.fullPath === "/" })
          setOpen(false)
          return "Successfully saved connection"
        },
        error: "Couldn't save connection",
        position: "bottom-left"
      }
    )
  }

  const onTest = async (data: z.infer<typeof connectionFormSchema>) => {
    const connString = constructConnectionString({
      ...data.connectionOpts
    })
    return toast.promise(
      commands.testConnection(connString, data.connectionOpts.driver),
      {
        id: "test_connection",
        loading: "Testing connection...",
        success: "Connection is healthy",
        error: "Connection is unhealthy",
        position: "bottom-left"
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size={"sm"} className="space-x-2">
          <PlusCircle className="size-4" />
          <span>New Connection</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new connection</DialogTitle>
          <DialogDescription>
            Add a new connection to the list
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <ConnectionForm onSuccess={() => setOpen(false)} />
        </Form>
        <DialogFooter>
          <Button
            type="button"
            size={"sm"}
            className="w-1/2"
            onClick={form.handleSubmit(onSave)}
          >
            Save
          </Button>
          <Button
            type="button"
            size={"sm"}
            variant={"secondary"}
            className="w-1/2"
            onClick={form.handleSubmit(onTest)}
          >
            Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
