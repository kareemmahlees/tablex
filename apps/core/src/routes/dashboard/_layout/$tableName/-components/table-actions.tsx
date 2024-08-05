import SQLDialog from "@/components/dialogs/sql-dialog"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink
} from "@/components/ui/pagination"
import { useSqlEditorState } from "@/state/dialogState"
import type { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Terminal
} from "lucide-react"

type TableActionsProps = {
  tableName: string
  table: Table<any>
}

const TableActions = ({ tableName, table }: TableActionsProps) => {
  const { toggleDialog: toggleSqlEditor } = useSqlEditorState()
  return (
    <>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-start gap-x-2">
          <h1 className="w-full text-2xl font-bold">{tableName}</h1>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={toggleSqlEditor}
            className="hidden lg:block"
          >
            <Terminal className="h-5 w-5" />
          </Button>
        </div>
        <PaginationControls table={table} />
      </div>
      <SQLDialog />
    </>
  )
}

export default TableActions

type PaginationControlsProps = {
  table: Table<any>
}

const PaginationControls = ({ table }: PaginationControlsProps) => {
  return (
    <Pagination className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="mr-1 h-4 w-4 p-0" />
            Previous
          </Button>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>
            {table.getState().pagination.pageIndex + 1}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4 p-0" />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
