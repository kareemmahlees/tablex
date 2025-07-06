import type { Table } from "@tanstack/react-table"

import { DataTableViewOptions } from "@/components/data-table/data-table-pagination"

type TableActionsProps = {
  table: Table<any>
  connectionId?: string
}

const TableActions = ({ table }: TableActionsProps) => {
  return (
    <>
      <div className="flex items-end justify-between">
        <div className="flex flex-col items-end gap-y-1 lg:gap-y-3">
          <div className="flex items-center gap-x-3">
            <DataTableViewOptions table={table} />
          </div>
        </div>
      </div>
    </>
  )
}

export default TableActions
