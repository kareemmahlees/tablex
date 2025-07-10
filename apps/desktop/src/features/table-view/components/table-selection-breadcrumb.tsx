import { SearchableInput } from "@/components/custom/searchable-input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { useSettings } from "@/features/settings/manager"
import {
  getConnectionDetailsQueryOptions,
  getTablesQueryOptions
} from "@/features/table-view/queries"
import { LOCAL_STORAGE } from "@/lib/constants"
import { useSuspenseQueries } from "@tanstack/react-query"
import { useNavigate, useParams } from "@tanstack/react-router"
import { ChevronsUpDown } from "lucide-react"
import { useLocalStorage } from "usehooks-ts"

export const TableSelectionBreadCrumb = ({ connId }: { connId: string }) => {
  const settings = useSettings()
  const { tableName } = useParams({ strict: false })
  const {
    "0": { data: tables },
    "1": { data: connectionDetails }
  } = useSuspenseQueries({
    queries: [
      getTablesQueryOptions(connId),
      getConnectionDetailsQueryOptions(connId)
    ]
  })
  const [_, setLatestTable, __] = useLocalStorage<string | undefined>(
    LOCAL_STORAGE.LATEST_TABLE(connId),
    undefined,
    {
      serializer: (v) => v ?? "",
      deserializer: (v) => (v === "" ? undefined : v)
    }
  )
  const navigate = useNavigate()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>{connectionDetails.connName}</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <SearchableInput
            items={tables.map((t) => ({
              label: t,
              value: t
            }))}
            defaultValue={tableName}
            placeholder="Select Table"
            emptyMsg="No Tables Found"
            onValueChange={(v) => {
              setLatestTable(v)
              navigate({
                to: "/connection/$connId/table-view/$tableName",
                params: {
                  connId,
                  tableName: v
                },
                search: {
                  sorting: [],
                  pagination: { pageIndex: 0, pageSize: settings.pageSize }
                },
                replace: true
              })
            }}
            preventUnselect
          >
            {(value) => (
              <button className="flex h-7 w-fit max-w-[150px] items-center space-x-2 text-sm transition-colors hover:text-white">
                <span>{value}</span>
                <ChevronsUpDown className="-mb-1 size-4" />
              </button>
            )}
          </SearchableInput>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export const TableSelectionSkeleton = () => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Skeleton className="h-9 w-20" />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Skeleton className="h-9 w-20" />
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
