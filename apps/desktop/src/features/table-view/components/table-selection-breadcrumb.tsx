import { SearchableInput } from "@/components/custom/searchable-input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { useDBSchema } from "@/features/common/db-context"
import { useSettings } from "@/features/settings/manager"
import { LOCAL_STORAGE } from "@/lib/constants"
import { useParams, useRouter } from "@tanstack/react-router"
import { ChevronsUpDown } from "lucide-react"
import { useLocalStorage } from "usehooks-ts"

export const TableSelectionBreadCrumb = ({
  connName,
  connId
}: {
  connName: string
  connId: string
}) => {
  const settings = useSettings()
  const dbSchema = useDBSchema()
  const { tableName } = useParams({ strict: false })
  const [_, setLatestTable, __] = useLocalStorage<string | undefined>(
    LOCAL_STORAGE.LATEST_TABLE(connId),
    undefined,
    {
      serializer: (v) => v ?? "",
      deserializer: (v) => (v === "" ? undefined : v)
    }
  )
  const router = useRouter()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>{connName}</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <SearchableInput
            items={dbSchema.map((t) => ({
              label: t.name,
              value: t.name
            }))}
            defaultValue={tableName}
            placeholder="Select Table"
            emptyMsg="No Tables Found"
            onValueChange={(v) => {
              setLatestTable(v)
              router.navigate({
                to: "/connection/$connId/table-view/$tableName",
                params: {
                  connId,
                  tableName: v
                },
                search: {
                  sorting: [],
                  pagination: { pageIndex: 0, pageSize: settings.pageSize },
                  filtering: [],
                  joinOperator: "and"
                },
                replace: true
              })
              router.invalidate()
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
