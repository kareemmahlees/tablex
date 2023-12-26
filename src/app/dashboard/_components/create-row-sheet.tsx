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
import { useQuery, useQueryClient } from "@tanstack/react-query"

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
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useState, type Dispatch, type SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createRow, getZodSchemaFromCols } from "../actions"

const CreateRowBtn = () => {
  const [open, setOpen] = useState(false)
  return (
    <TooltipProvider>
      <Tooltip>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <TooltipTrigger
              role="button"
              className="bg-zinc-900 p-1 rounded-full"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
            </TooltipTrigger>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add new row</SheetTitle>
            </SheetHeader>
            <CreateRowForm setOpenSheet={setOpen} />
          </SheetContent>
        </Sheet>
        <TooltipContent
          side="right"
          className="text-xs mr-1 p-1 lg:text-sm lg:px-2 lg:py-1 lg:mr-2"
        >
          <p>Add new row</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default CreateRowBtn

interface CreateRowFormProps {
  setOpenSheet: Dispatch<SetStateAction<boolean>>
}

const CreateRowForm = ({ setOpenSheet }: CreateRowFormProps) => {
  const queryClient = useQueryClient()
  const tableName = useSearchParams().get("tableName")!
  const { data, isLoading } = useQuery({
    queryKey: [tableName],
    queryFn: async () => await getZodSchemaFromCols(tableName)
  })

  const form = useForm<z.infer<NonNullable<typeof data>>>({
    resolver: zodResolver(data!)
  })
  const onSubmit = async (values: z.infer<NonNullable<typeof data>>) => {
    await createRow(tableName, values, setOpenSheet, queryClient)
  }

  if (isLoading) return <LoadingSpinner />

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
