import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"

import { commands } from "@/bindings"
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
import { getZodSchemaFromCols } from "@/features/table-view/columns"
import { discoverDBSchemaOptions } from "@/features/table-view/queries"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSuspenseQueries } from "@tanstack/react-query"
import { PlusCircle } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { TooltipButton } from "../../../components/custom/tooltip-button"
import DynamicFormInput from "./dynamic-input"

type AddRowSheetProps = {
  tableName: string
}

export const AddRowSheet = ({ tableName }: AddRowSheetProps) => {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <TooltipButton
          size={"icon"}
          className="h-8 w-8"
          tooltipContent="Add Row"
        >
          <PlusCircle className="h-4 w-4" />
        </TooltipButton>
      </SheetTrigger>
      <SheetContent className="max-w-lg">
        <ScrollArea className="h-full">
          <SheetHeader className="bg-background sticky top-0 mb-4">
            <SheetTitle>Add new row</SheetTitle>
            <SheetDescription>
              Click Save to submit your changes.
            </SheetDescription>
          </SheetHeader>
          <AddRowForm tableName={tableName} setOpen={setOpen} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

const AddRowForm = ({
  tableName,
  setOpen
}: {
  tableName: string
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const {
    "0": { data: tableSchema },
    "1": { data: zodSchema }
  } = useSuspenseQueries({
    queries: [
      discoverDBSchemaOptions(tableName),
      {
        ...discoverDBSchemaOptions(tableName),
        select: getZodSchemaFromCols
      }
    ]
  })
  const form = useForm<z.infer<NonNullable<typeof zodSchema>>>({
    resolver: zodResolver(zodSchema!)
  })

  const onSubmit = async (values: z.infer<typeof zodSchema>) => {
    toast.promise(commands.createRow(tableName, values), {
      loading: "Creating row...",
      success: () => {
        setOpen(false)
        return "Successfully created row"
      }
    })
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {tableSchema.columns.map((column, idx) => (
          <FormField
            key={idx}
            control={form.control}
            name={column.name}
            render={({ field }) => (
              <FormItem className="flex flex-col px-1">
                <FormLabel>{column.name}</FormLabel>
                <FormControl
                // defaultValue={
                //   column.type === "unsupported" ? "Unsupported" : ""
                // }
                >
                  <DynamicFormInput column={column} field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="bg-background sticky bottom-0 space-x-4">
          <Button type="submit">Save</Button>
          <Button
            type="button"
            variant={"secondary"}
            onClick={() =>
              form.reset(
                {},
                {
                  keepValues: false
                }
              )
            }
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  )
}
