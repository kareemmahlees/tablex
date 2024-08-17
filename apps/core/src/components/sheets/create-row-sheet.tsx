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
import { useGetGeneralColsData } from "@/hooks/row"
import { useCreateRowSheetState } from "@/state/sheetState"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import CustomTooltip from "../custom-tooltip"
import DynamicFormInput from "./components/dynamic-input"

type AddRowBtnProps = {
  tableName: string
}

const AddRowBtn = ({ tableName }: AddRowBtnProps) => {
  const { isOpen, toggleSheet } = useCreateRowSheetState()
  return (
    <TooltipProvider>
      <Sheet open={isOpen} onOpenChange={toggleSheet}>
        <SheetTrigger>
          <CustomTooltip
            className="absolute bottom-0 left-0 m-4 rounded-full bg-zinc-900 p-1"
            side="right"
            content="Add new row"
          >
            <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
          </CustomTooltip>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Add new row</SheetTitle>
          </SheetHeader>
          <AddRowForm tableName={tableName} />
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}

export default AddRowBtn

const AddRowForm = ({ tableName }: { tableName: string }) => {
  const { toggleSheet } = useCreateRowSheetState()
  const {
    "0": {
      data: zodSchema,
      isLoading: isZodSchemaLoading,
      isSuccess: isZodSchemaSuccess
    },
    "1": {
      data: columnsProps,
      isLoading: isColumnsPropsLoading,
      isSuccess: isColumnsPropsSuccess
    }
  } = useGetGeneralColsData(tableName)

  const form = useForm<z.infer<NonNullable<typeof zodSchema>>>({
    resolver: zodResolver(zodSchema!)
  })

  if (isZodSchemaLoading || isColumnsPropsLoading) return <LoadingSpinner />

  if (!isZodSchemaSuccess || !isColumnsPropsSuccess) return

  const onSubmit = async (values: z.infer<NonNullable<typeof zodSchema>>) => {
    await createRowCmd(tableName, values, toggleSheet)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {columnsProps.map(({ columnName, type }, idx) => (
          <FormField
            key={idx}
            control={form.control}
            name={columnName}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{columnName}</FormLabel>
                <FormControl
                  defaultValue={type === "unsupported" ? "Unsupported" : ""}
                >
                  <DynamicFormInput
                    colDataType={type}
                    field={field}
                    disabled={type === "unsupported"}
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
