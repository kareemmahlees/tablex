import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"

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
import { useGetGeneralColsData } from "@/hooks/row"
import { isUnsupported } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useState, type Dispatch, type SetStateAction } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import CustomTooltip from "../custom-tooltip"

type AddRowBtnProps = {
  tableName: string
}

const AddRowBtn = ({ tableName }: AddRowBtnProps) => {
  const [open, setOpen] = useState(false)
  return (
    <TooltipProvider>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <CustomTooltip
            className="absolute bottom-0 left-0 m-4 rounded-full bg-zinc-900 p-1"
            side="right"
            content="Add new row"
          >
            <Plus
              className="h-3 w-3 lg:h-4 lg:w-4"
              onClick={() => setOpen(true)}
            />
          </CustomTooltip>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Add new row</SheetTitle>
          </SheetHeader>
          <AddRowForm setOpenSheet={setOpen} tableName={tableName} />
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}

export default AddRowBtn

type AddRowFormProps = {
  setOpenSheet: Dispatch<SetStateAction<boolean>>
  tableName: string
}

const AddRowForm = ({ setOpenSheet, tableName }: AddRowFormProps) => {
  const {
    "0": {
      data: zodSchema,
      isLoading: isZodSchemaLoading,
      isSuccess: isZodSchemaSuccess,
      error: zodSchemaError
    },
    "1": {
      data: columnsProps,
      isLoading: isColumnsPropsLoading,
      isSuccess: isColumnsPropsSuccess,
      error: columnsPropsError
    }
  } = useGetGeneralColsData(tableName)

  const form = useForm<z.infer<NonNullable<typeof zodSchema>>>({
    resolver: zodResolver(zodSchema!)
  })

  if (isZodSchemaLoading || isColumnsPropsLoading) return <LoadingSpinner />

  if (!isZodSchemaSuccess)
    return toast.error(zodSchemaError!.message, { id: "get_zod_schema" })
  if (!isColumnsPropsSuccess)
    return toast.error(columnsPropsError!.message, { id: "get_zod_schema" })

  const onSubmit = async (values: z.infer<typeof zodSchema>) => {
    await createRowCmd(tableName, values, setOpenSheet)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {Object.entries(zodSchema.shape).map(([colName], idx) => (
          <FormField
            key={idx}
            control={form.control}
            name={colName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{colName}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isUnsupported(columnsProps, colName)}
                    placeholder={
                      isUnsupported(columnsProps, colName) ? "Unsupported" : ""
                    }
                  />
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
