import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { getTablesQueryOptions } from "@/features/shared/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Table2Icon } from "lucide-react"

export const TableSelectionBreadCrumb = () => {
  const { data: tables } = useSuspenseQuery(getTablesQueryOptions)
  const navigate = useNavigate()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>Tables</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Select
            onValueChange={(v) =>
              navigate({
                to: "/dashboard/table-view/$tableName",
                params: {
                  tableName: v
                }
              })
            }
          >
            <SelectTrigger
              id="select-table"
              className="relative gap-2 ps-9"
              aria-label="Select Table"
            >
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50">
                <Table2Icon size={16} aria-hidden="true" />
              </div>
              <SelectValue placeholder="Select Table" />
            </SelectTrigger>
            <SelectContent>
              {tables.map((t) => (
                <SelectItem value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
