import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

import { createRowCmd } from "@/commands/row"
import LoadingSpinner from "@/components/loading-spinner"
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
import { useGetZodSchema } from "@/hooks/table"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useState, type Dispatch, type SetStateAction } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

type AddRowBtnProps = {
  tableName: string
}

const AddRowBtn = ({ tableName }: AddRowBtnProps) => {
  const [open, setOpen] = useState(false)
  return (
    <TooltipProvider>
      <Tooltip>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <TooltipTrigger
              role="button"
              className="absolute bottom-0 left-0 m-4 rounded-full bg-zinc-900 p-1"
            >
              <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
            </TooltipTrigger>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Add new row</SheetTitle>
            </SheetHeader>
            <AddRowForm setOpenSheet={setOpen} tableName={tableName} />
          </SheetContent>
        </Sheet>
        <TooltipContent
          side="right"
          className="mr-1 p-1 text-xs lg:mr-2 lg:px-2 lg:py-1 lg:text-sm"
        >
          <p>Add new row</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default AddRowBtn

type AddRowFormProps = {
  setOpenSheet: Dispatch<SetStateAction<boolean>>
  tableName: string
}

const AddRowForm = ({ setOpenSheet, tableName }: AddRowFormProps) => {
  const { data, isLoading, error } = useGetZodSchema(tableName)
  const form = useForm<z.infer<NonNullable<typeof data>>>({
    resolver: zodResolver(data!)
  })
  const onSubmit = async (values: z.infer<NonNullable<typeof data>>) => {
    await createRowCmd(tableName, values, setOpenSheet)
  }

  if (isLoading) return <LoadingSpinner />

  if (error) return toast.error(error.message, { id: "get_zod_schema" })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {Object.entries(data!.shape).map(([colName], idx) => (
          <FormField
            key={idx}
            control={form.control}
            name={colName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{colName}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit">Save</Button>
      </form>
    </Form>
  )
}
