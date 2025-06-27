import { SearchableInput } from "@/components/custom/searchable-input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import {
  getConnectionDetailsQueryOptions,
  getTablesQueryOptions
} from "@/features/table-view/queries"
import { LOCAL_STORAGE } from "@/lib/constants"
import { useSuspenseQueries } from "@tanstack/react-query"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useLocalStorage } from "usehooks-ts"

export const TableSelectionBreadCrumb = ({ connId }: { connId: string }) => {
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
                replace: true
              })
            }}
            preventUnselect
          />
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
