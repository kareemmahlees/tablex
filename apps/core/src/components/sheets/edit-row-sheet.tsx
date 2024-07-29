import { updateRowCmd } from "@/commands/row"
import LoadingSpinner from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useGetGeneralColsData } from "@/hooks/row"
import { dirtyValues, isUnsupported } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnMeta, Row, Table } from "@tanstack/react-table"
import type { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import DynamicFormInput from "../dynamic-input"

interface EditRowSheetProps {
  tableName: string
  table: Table<any>
  row?: Row<any>
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>
}

const EditRowSheet = ({
  setIsSheetOpen,
  row,
  table,
  tableName
}: EditRowSheetProps) => {
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
    const column = table.getColumn("pk")
    if (!column)
      return toast.error("Table Doesn't have a primary key", {
        id: "table_pk_error"
      })
    await updateRowCmd(
      tableName,
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      column.columnDef.meta?.name!,
      row.getValue("pk"),
      dirtyValues(form.formState.dirtyFields, values),
      setIsSheetOpen
    )
  }

  if (isZodSchemaLoading || isColumnsPropsLoading) return <LoadingSpinner />

  if (!isZodSchemaSuccess)
    return toast.error(zodSchemaError!.message, { id: "get_zod_schema" })
  if (!isColumnsPropsSuccess)
    return toast.error(columnsPropsError!.message, { id: "get_zod_schema" })

  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader className="mb-4">
        <SheetTitle>Edit row</SheetTitle>
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
                defaultValue={cell.getValue()}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{cell.column.columnDef.meta?.name}</FormLabel>
                    <DynamicFormInput
                      field={field}
                      disabled={isUnsupported(
                        columnsProps,
                        (cell.column.columnDef.meta as ColumnMeta<any, any>)
                          .name
                      )}
                      defaultValue={
                        isUnsupported(
                          columnsProps,
                          (cell.column.columnDef.meta as ColumnMeta<any, any>)
                            .name
                        )
                          ? "Unsupported"
                          : ""
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </SheetContent>
  )
}

export default EditRowSheet
