import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { TableLocalStorage } from "@/types"
import { cn } from "@tablex/lib/utils"
import type { Table } from "@tanstack/react-table"
import {
  ArrowLeft,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2
} from "lucide-react"
import { useLocalStorage } from "usehooks-ts"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  connectionId?: string
  className?: string
}

export function DataTablePagination<TData>({
  table,
  className,
  connectionId
}: DataTablePaginationProps<TData>) {
  const [connectionStorage, setConnectionStorage] =
    useLocalStorage<TableLocalStorage>(`@tablex/${connectionId}`, {
      tableName: "",
      pageIndex: 0
    })

  return (
    <div className={cn("flex items-center gap-x-5", className)}>
      <div className="flex items-center space-x-4 lg:space-x-2">
        <div className="flex items-start text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              table.setPageIndex(0)
              setConnectionStorage({ ...connectionStorage, pageIndex: 0 })
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              setConnectionStorage({
                ...connectionStorage,
                pageIndex: table.getState().pagination.pageIndex - 1
              })
              table.previousPage()
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              setConnectionStorage({
                ...connectionStorage,
                pageIndex: table.getState().pagination.pageIndex + 1
              })
              table.nextPage()
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              table.setPageIndex(table.getPageCount() - 1)
              setConnectionStorage({
                ...connectionStorage,
                pageIndex: table.getPageCount() - 1
              })
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-muted-foreground hidden text-sm lg:flex">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
    </div>
  )
}

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-muted/50 ml-auto hidden h-8 lg:flex"
        >
          <Settings2 className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
