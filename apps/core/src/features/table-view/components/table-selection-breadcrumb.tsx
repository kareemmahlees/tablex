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
import { useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useLocalStorage } from "usehooks-ts"

export const TableSelectionBreadCrumb = ({
  connectionId
}: {
  connectionId: string
}) => {
  const { data: tables } = useSuspenseQuery(getTablesQueryOptions(connectionId))
  const { data: connectionDetails } = useSuspenseQuery(
    getConnectionDetailsQueryOptions(connectionId)
  )
  const [_, setLatestTable, __] = useLocalStorage<string | undefined>(
    LOCAL_STORAGE.LATEST_TABLE(connectionId),
    undefined,
    {
      serializer: (v) => v ?? "",
      deserializer: (v) => (v === "" ? undefined : v)
    }
  )
  const navigate = useNavigate()
  const { tableName } = useParams({ strict: false })

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
                to: "/dashboard/table-view/$tableName",
                params: {
                  tableName: v
                },
                search: {
                  connectionId
                },
                replace: true
              })
            }}
          />
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
