import { ColumnProps } from "@/bindings"
import { updateRowCmd } from "@/commands/row"
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
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { useGetGeneralColsData } from "@/hooks/row"
import { dirtyValues } from "@/lib/utils"
import { useEditRowSheetState } from "@/state/sheetState"
import { useTableState } from "@/state/tableState"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Row } from "@tanstack/react-table"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import DynamicFormInput from "./components/dynamic-input"

const getColumn = (columnsProps: ColumnProps[], columnName: string) => {
  return columnsProps.find((col) => col.columnName == columnName)
}

interface EditRowSheetProps {
  row?: Row<any>
}

const EditRowSheet = ({ row }: EditRowSheetProps) => {
  const { tableName, pkColumn } = useTableState()
  const { toggleSheet } = useEditRowSheetState()
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

  const partialZodSchema = zodSchema?.partial()

  const form = useForm<z.infer<NonNullable<typeof partialZodSchema>>>({
    resolver: zodResolver(partialZodSchema!)
  })

  if (!row) return null

  if (isZodSchemaPending || isColumnsPropsPending) return <LoadingSpinner />

  if (!isZodSchemaSuccess || !isColumnsPropsSuccess) return

  const onSubmit = async (
    values: z.infer<NonNullable<typeof partialZodSchema>>
  ) => {
    if (!pkColumn)
      return toast.error("Table Doesn't have a primary key", {
        id: "table_pk_error"
      })
    await updateRowCmd(
      tableName,
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      pkColumn,
      row.getValue(pkColumn),
      dirtyValues(form.formState.dirtyFields, values),
      toggleSheet
    )
  }

  return (
    <SheetContent>
      <ScrollArea className="h-full">
        <SheetHeader className="bg-background sticky top-0 mb-4">
          <SheetTitle>Edit row</SheetTitle>
          <SheetDescription>
            Click Save to submit your changes.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {row
              .getAllCells()
              // to remove the first checkbox column
              .slice(1)
              .map((cell) => (
                <FormField
                  key={cell.column.id}
                  control={form.control}
                  name={cell.column.id}
                  render={({ field }) => (
                    <FormItem className="flex flex-col px-1">
                      <FormLabel>{cell.column.id}</FormLabel>
                      <FormControl>
                        <DynamicFormInput
                          column={getColumn(columnsProps, cell.column.id)!}
                          defaultValue={cell.getValue() as string}
                          field={field}
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
      </ScrollArea>
    </SheetContent>
  )
}

export default EditRowSheet
