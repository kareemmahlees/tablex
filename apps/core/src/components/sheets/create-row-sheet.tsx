import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { ScrollArea } from "@/components/ui/scroll-area"
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
        <SheetContent>
          <ScrollArea className="h-full">
            <SheetHeader className="bg-background sticky top-0 mb-4">
              <SheetTitle>Add new row</SheetTitle>
              <SheetDescription>
                Click Save to submit your changes.
              </SheetDescription>
            </SheetHeader>
            <AddRowForm tableName={tableName} />
          </ScrollArea>
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
      isPending: isZodSchemaPending,
      isSuccess: isZodSchemaSuccess
    },
    "1": {
      data: columnsProps,
      isPending: isColumnsPropsPending,
      isSuccess: isColumnsPropsSuccess
    }
  } = useGetGeneralColsData(tableName)

  const form = useForm<z.infer<NonNullable<typeof zodSchema>>>({
    resolver: zodResolver(zodSchema!)
  })

  if (isZodSchemaPending || isColumnsPropsPending) return <LoadingSpinner />

  if (!isZodSchemaSuccess || !isColumnsPropsSuccess) return

  const onSubmit = async (values: z.infer<NonNullable<typeof zodSchema>>) => {
    await createRowCmd(tableName, values, toggleSheet)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {columnsProps.map((column, idx) => (
          <FormField
            key={idx}
            control={form.control}
            name={column.columnName}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{column.columnName}</FormLabel>
                <FormControl
                  defaultValue={
                    column.type === "unsupported" ? "Unsupported" : ""
                  }
                >
                  <DynamicFormInput column={column} field={field} />
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
