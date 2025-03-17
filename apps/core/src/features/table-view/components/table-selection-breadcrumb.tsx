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
import {
  getConnectionDetailsQueryOptions,
  getTablesQueryOptions
} from "@/features/table-view/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "@tanstack/react-router"
import { Table2Icon } from "lucide-react"

export const TableSelectionBreadCrumb = ({
  connectionId
}: {
  connectionId: string
}) => {
  const { data: tables } = useSuspenseQuery(getTablesQueryOptions(connectionId))
  const { data: connectionDetails } = useSuspenseQuery(
    getConnectionDetailsQueryOptions(connectionId)
  )
  const navigate = useNavigate()
  const { tableName } = useParams({ strict: false })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>{connectionDetails.connName}</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Select
            onValueChange={(v) =>
              navigate({
                to: "/dashboard/table-view/$tableName",
                params: {
                  tableName: v
                },
                search: {
                  connectionId
                }
              })
            }
            defaultValue={tableName}
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
