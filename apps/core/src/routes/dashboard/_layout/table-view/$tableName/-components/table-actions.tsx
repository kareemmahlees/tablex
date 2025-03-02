import SQLDialog from "@/components/dialogs/sql-dialog"
import { Button } from "@/components/ui/button"
import { useSqlEditorState } from "@/state/dialogState"
import type { Table } from "@tanstack/react-table"
import { Table2Icon, Terminal } from "lucide-react"

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

import { DataTableViewOptions } from "@/components/custom/data-table-pagination"
import { getTablesQueryOptions } from "@/features/shared/queries"
import { useSuspenseQuery } from "@tanstack/react-query"

type TableActionsProps = {
  table: Table<any>
  connectionId?: string
}

const TableActions = ({ table }: TableActionsProps) => {
  const { toggleDialog: toggleSqlEditor } = useSqlEditorState()
  return (
    <>
      <div className="flex items-end justify-between p-4">
        <div className="flex h-full flex-col items-start gap-y-3">
          <h1 className="text-center text-xl font-bold lg:text-3xl">
            <TableSelectionBreadCrumb />
          </h1>
        </div>
        <div className="flex flex-col items-end gap-y-1 lg:gap-y-3">
          <div className="flex items-center gap-x-3">
            <DataTableViewOptions table={table} />
            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() => toggleSqlEditor()}
              className="hidden h-8 items-center gap-x-3 lg:flex"
            >
              <Terminal className="h-4 w-4" />
              SQL
            </Button>
          </div>
        </div>
      </div>
      <SQLDialog />
    </>
  )
}

export default TableActions

const TableSelectionBreadCrumb = () => {
  const { data: tables } = useSuspenseQuery(getTablesQueryOptions)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>Tables</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Select defaultValue={tables[0]}>
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
              {(tables as string[]).map((t) => (
                <SelectItem value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
