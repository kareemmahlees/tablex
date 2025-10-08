import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Drivers } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { connectionFormSchema } from "../schema"
import { ConnectionForm } from "./connection-form"

export const NewConnectionBtn = () => {
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof connectionFormSchema>>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      connectionOpts: {
        driver: Drivers.SQLite
      }
    }
  })

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
        <Form {...form}>
          <ConnectionForm onSuccess={() => setOpen(false)} />
        </Form>
      </DialogContent>
    </Dialog>
  )
}
