import SQLDialog from "@/components/dialogs/sql-dialog"
import { Button } from "@/components/ui/button"
import { useSqlEditorState } from "@/state/dialogState"
import type { Table } from "@tanstack/react-table"
import { Terminal } from "lucide-react"

import { DataTableViewOptions } from "@/components/custom/data-table-pagination"

type TableActionsProps = {
  table: Table<any>
  connectionId?: string
}

const TableActions = ({ table }: TableActionsProps) => {
  const { toggleDialog: toggleSqlEditor } = useSqlEditorState()
  return (
    <>
      <div className="flex items-end justify-between p-4">
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
