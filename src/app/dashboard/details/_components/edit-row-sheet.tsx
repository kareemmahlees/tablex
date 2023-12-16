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
import { dirtyValues } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Row } from "@tanstack/react-table"
import { useSearchParams } from "next/navigation"
import type { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { getZodSchemaFromCols } from "../../actions"
import { updateRow } from "../actions"

interface EditRowSheetProps {
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>
  row: Row<any>
}

const EditRowSheet = ({ setIsSheetOpen, row }: EditRowSheetProps) => {
  const tableName = useSearchParams().get("tableName")!
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: [tableName],
    queryFn: async () => (await getZodSchemaFromCols(tableName)).partial()
  })

  const form = useForm<z.infer<NonNullable<typeof data>>>({
    resolver: zodResolver(data!)
  })
  const onSubmit = async (values: z.infer<NonNullable<typeof data>>) => {
    await updateRow(
      tableName,
      values.id,
      dirtyValues(form.formState.dirtyFields, values),
      setIsSheetOpen
    )
    queryClient.invalidateQueries({ queryKey: ["table_rows"] })
  }

  if (isLoading) return <LoadingSpinner />
  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
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
                    <FormLabel>{cell.column.id}</FormLabel>
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
