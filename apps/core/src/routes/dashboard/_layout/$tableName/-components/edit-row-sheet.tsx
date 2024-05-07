import { getZodSchemaFromCols } from "@/commands/columns"
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
import { Input } from "@/components/ui/input"
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { zodResolver } from "@hookform/resolvers/zod"
import { dirtyValues } from "@tablex/lib/utils"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { Row, Table } from "@tanstack/react-table"
import type { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

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
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: [tableName],
    queryFn: async () => (await getZodSchemaFromCols(tableName)).partial()
  })

  const form = useForm<z.infer<NonNullable<typeof data>>>({
    resolver: zodResolver(data!)
  })

  if (!row) return null

  const onSubmit = async (values: z.infer<NonNullable<typeof data>>) => {
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
    queryClient.invalidateQueries({ queryKey: ["table_rows"] })
  }

  if (isLoading) return <LoadingSpinner />

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
                  <FormItem>
                    <FormLabel>{cell.column.columnDef.meta?.name}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
