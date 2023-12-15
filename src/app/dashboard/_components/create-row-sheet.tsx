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
import { useQuery } from "@tanstack/react-query"

import LoadingSpinner from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@radix-ui/react-label"
import { Plus } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Dispatch, SetStateAction, useState } from "react"
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
              <Plus className="w-4 h-4 lg:w-6 lg:h-6" />
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

const CreateRowForm = ({
  setOpenSheet
}: {
  setOpenSheet: Dispatch<SetStateAction<boolean>>
}) => {
  const params = useSearchParams()
  const tableName = params.get("tableName")!
  const { data, isLoading } = useQuery({
    queryKey: [tableName],
    queryFn: async () => await getZodSchemaFromCols(tableName)
  })

  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<z.infer<NonNullable<typeof data>>>({
    resolver: zodResolver(data!)
  })
  const onSubmit = async (values: z.infer<NonNullable<typeof data>>) => {
    await createRow(tableName, values, setOpenSheet)
  }

  if (isLoading) return <LoadingSpinner />
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {Object.entries(data!.shape).map(([key, _], idx) => (
        <div key={idx}>
          <Label htmlFor={key}>{key}</Label>
          <Input
            {...register(key)}
            id={key}
            className={cn({ "outline outline-red-500": errors[key] })}
          />
          {errors[key] && (
            <p className="text-sm text-red-500">
              {errors[key]?.message?.toString()}
            </p>
          )}
        </div>
      ))}
      <Button type="submit">Save</Button>
    </form>
  )
}
