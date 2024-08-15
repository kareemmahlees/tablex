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
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useGetGeneralColsData } from "@/hooks/row"
import { dirtyValues, isUnsupported } from "@/lib/utils"
import { useEditRowSheetState } from "@/state/sheetState"
import { useTableState } from "@/state/tableState"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Row } from "@tanstack/react-table"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import DynamicFormInput from "./components/dynamic-input"

const getColumnType = (columnsProps: ColumnProps[], columnName: string) => {
  return (
    columnsProps.find((col) => col.columnName == columnName)?.type ?? "text"
  )
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

  const partialZodSchema = zodSchema?.partial()

  const form = useForm<z.infer<NonNullable<typeof partialZodSchema>>>({
    resolver: zodResolver(partialZodSchema!)
  })

  if (!row) return null

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

  if (isZodSchemaLoading || isColumnsPropsLoading) return <LoadingSpinner />

  if (!isZodSchemaSuccess)
    return toast.error(zodSchemaError!.message, { id: "get_zod_schema" })
  if (!isColumnsPropsSuccess)
    return toast.error(columnsPropsError!.message, { id: "get_zod_schema" })

  return (
    <SheetContent>
      <SheetHeader className="mb-4">
        <SheetTitle>Edit row</SheetTitle>
      </SheetHeader>
      <ScrollArea className="h-full">
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
                    <FormItem className="flex flex-col">
                      <FormLabel>{cell.column.id}</FormLabel>
                      <FormControl>
                        <DynamicFormInput
                          colDataType={getColumnType(
                            columnsProps,
                            cell.column.id
                          )}
                          defaultValue={cell.getValue() as string}
                          field={field}
                          disabled={isUnsupported(columnsProps, cell.column.id)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </ScrollArea>
    </SheetContent>
  )
}

export default EditRowSheet
