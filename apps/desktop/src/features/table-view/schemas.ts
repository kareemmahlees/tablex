import { dataTableConfig } from "@/components/data-table/data-table-config"
import { z } from "zod"

export const sortingSchema = z
  .array(
    z.object({
      column: z.string(),
      ordering: z.enum(["asc", "desc"])
    })
  )
  .default([])

export const paginationSchema = z
  .object({
    pageIndex: z.number(),
    pageSize: z.number()
  })
  .default({
    pageIndex: 0,
    pageSize: 10
  })

export const filterItemSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  column: z.string(),
  variant: z.enum(dataTableConfig.filterVariants),
  operator: z.enum(dataTableConfig.operators),
  filterId: z.string()
})

export const filteringSchema = filterItemSchema.array()
