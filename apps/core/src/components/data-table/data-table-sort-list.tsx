"use client"

import type { SortDirection, Table } from "@tanstack/react-table"
import { ArrowDownUp, ChevronsUpDown, GripVertical, Trash2 } from "lucide-react"
import * as React from "react"

import { SortingData } from "@/bindings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay
} from "@/components/ui/sortable"
import { dataTableConfig } from "@/config/data-table"
import { cn } from "@tablex/lib/utils"

const OPEN_MENU_SHORTCUT = "s"
const REMOVE_SORT_SHORTCUTS = ["backspace", "delete"]

interface DataTableSortListProps<TData>
  extends React.ComponentProps<typeof PopoverContent> {
  table: Table<TData>
  initialSorting?: SortingData[]
  sorting: SortingData[]
  onSortingChange: (data: SortingData[]) => void
}

export function DataTableSortList<TData>({
  table,
  initialSorting,
  sorting,
  onSortingChange,
  ...props
}: DataTableSortListProps<TData>) {
  const id = React.useId()
  const labelId = React.useId()
  const descriptionId = React.useId()
  const [open, setOpen] = React.useState(false)
  const addButtonRef = React.useRef<HTMLButtonElement>(null)

  const { columnLabels, columns } = React.useMemo(() => {
    const labels = new Map<string, string>()
    const columnIds = new Set(sorting.map((s) => s.column))
    const availableColumns: { id: string; label: string }[] = []

    for (const column of table.getAllColumns()) {
      if (!column.getCanSort()) continue

      const label = column.columnDef.meta?.label ?? column.id
      labels.set(column.id, label)

      if (!columnIds.has(column.id)) {
        availableColumns.push({ id: column.id, label })
      }
    }

    return {
      columnLabels: labels,
      columns: availableColumns
    }
  }, [sorting, table])

  const onSortAdd = React.useCallback(() => {
    const firstColumn = columns[0]
    if (!firstColumn) return
    onSortingChange([...sorting, { column: firstColumn.id, ordering: "desc" }])
  }, [columns, onSortingChange])

  const onSortUpdate = React.useCallback(
    (column: string, updates: Partial<SortingData>) =>
      onSortingChange(
        sorting.map((sort) =>
          sort.column === column ? { ...sort, ...updates } : sort
        )
      ),
    [onSortingChange]
  )

  const onSortRemove = React.useCallback(
    (column: string) =>
      onSortingChange(sorting.filter((item) => item.column !== column)),
    [onSortingChange]
  )

  const onSortingReset = React.useCallback(
    () => onSortingChange(initialSorting ?? []),
    [onSortingChange, table.initialState.sorting]
  )

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (
        event.key.toLowerCase() === OPEN_MENU_SHORTCUT &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey
      ) {
        event.preventDefault()
        setOpen(true)
      }

      if (
        event.key.toLowerCase() === OPEN_MENU_SHORTCUT &&
        event.shiftKey &&
        sorting.length > 0
      ) {
        event.preventDefault()
        onSortingReset()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [sorting.length, onSortingReset])

  const onTriggerKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (
        REMOVE_SORT_SHORTCUTS.includes(event.key.toLowerCase()) &&
        sorting.length > 0
      ) {
        event.preventDefault()
        onSortingReset()
      }
    },
    [sorting.length, onSortingReset]
  )

  return (
    <Sortable
      value={sorting}
      onValueChange={(items) => {
        // setSorting(items)
        onSortingChange(items)
      }}
      getItemValue={(item) => item.column}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onKeyDown={onTriggerKeyDown}
            className="h-8 space-x-2"
          >
            <ArrowDownUp className="size-4" />
            <span>Sort</span>
            {sorting.length > 0 && (
              <Badge
                variant="secondary"
                className="h-[18.24px] rounded-[3.2px] px-[5.12px] font-mono text-[10.4px] font-normal"
              >
                {sorting.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
          className="flex w-full max-w-[var(--radix-popover-content-available-width)] origin-[var(--radix-popover-content-transform-origin)] flex-col gap-3.5 p-4 sm:min-w-[380px]"
          {...props}
        >
          <div className="flex flex-col gap-1">
            <h4 id={labelId} className="font-medium leading-none">
              {sorting.length > 0 ? "Sort by" : "No sorting applied"}
            </h4>
            <p
              id={descriptionId}
              className={cn(
                "text-muted-foreground text-sm",
                sorting.length > 0 && "sr-only"
              )}
            >
              {sorting.length > 0
                ? "Modify sorting to organize your rows."
                : "Add sorting to organize your rows."}
            </p>
          </div>
          {sorting.length > 0 && (
            <SortableContent asChild>
              <ul className="flex max-h-[300px] flex-col gap-2 overflow-y-auto p-1">
                {sorting.map((sort) => (
                  <DataTableSortItem
                    key={sort.column}
                    sort={sort}
                    sortItemId={`${id}-sort-${sort.column}`}
                    columns={columns}
                    columnLabels={columnLabels}
                    onSortUpdate={onSortUpdate}
                    onSortRemove={onSortRemove}
                  />
                ))}
              </ul>
            </SortableContent>
          )}
          <div className="flex w-full items-center gap-2">
            <Button
              size="sm"
              className="h-8 rounded"
              ref={addButtonRef}
              onClick={onSortAdd}
              disabled={columns.length === 0}
            >
              Add sort
            </Button>
            {sorting.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="rounded"
                onClick={onSortingReset}
              >
                Reset sorting
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <SortableOverlay>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 h-8 w-[180px] rounded-sm" />
          <div className="bg-primary/10 h-8 w-24 rounded-sm" />
          <div className="bg-primary/10 size-8 shrink-0 rounded-sm" />
          <div className="bg-primary/10 size-8 shrink-0 rounded-sm" />
        </div>
      </SortableOverlay>
    </Sortable>
  )
}

interface DataTableSortItemProps {
  sort: SortingData
  sortItemId: string
  columns: { id: string; label: string }[]
  columnLabels: Map<string, string>
  onSortUpdate: (column: string, updates: Partial<SortingData>) => void
  onSortRemove: (column: string) => void
}

function DataTableSortItem({
  sort,
  sortItemId,
  columns,
  columnLabels,
  onSortUpdate,
  onSortRemove
}: DataTableSortItemProps) {
  const fieldListboxId = `${sortItemId}-field-listbox`
  const fieldTriggerId = `${sortItemId}-field-trigger`
  const directionListboxId = `${sortItemId}-direction-listbox`

  const [showFieldSelector, setShowFieldSelector] = React.useState(false)
  const [showDirectionSelector, setShowDirectionSelector] =
    React.useState(false)

  const onItemKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLLIElement>) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (showFieldSelector || showDirectionSelector) {
        return
      }

      if (REMOVE_SORT_SHORTCUTS.includes(event.key.toLowerCase())) {
        event.preventDefault()
        onSortRemove(sort.column)
      }
    },
    [sort.column, showFieldSelector, showDirectionSelector, onSortRemove]
  )

  return (
    <SortableItem value={sort.column} asChild>
      <li
        id={sortItemId}
        tabIndex={-1}
        className="flex items-center gap-2"
        onKeyDown={onItemKeyDown}
      >
        <Popover open={showFieldSelector} onOpenChange={setShowFieldSelector}>
          <PopoverTrigger asChild>
            <Button
              id={fieldTriggerId}
              aria-controls={fieldListboxId}
              variant="outline"
              size="sm"
              className="w-44 justify-between rounded font-normal"
            >
              <span className="truncate">{columnLabels.get(sort.column)}</span>
              <ChevronsUpDown className="size-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            id={fieldListboxId}
            className="w-[var(--radix-popover-trigger-width)] origin-[var(--radix-popover-content-transform-origin)] p-0"
          >
            <Command>
              <CommandInput placeholder="Search fields..." />
              <CommandList>
                <CommandEmpty>No fields found.</CommandEmpty>
                <CommandGroup>
                  {columns.map((column) => (
                    <CommandItem
                      key={column.id}
                      value={column.id}
                      onSelect={(value) =>
                        onSortUpdate(sort.column, { column: value })
                      }
                    >
                      <span className="truncate">{column.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Select
          open={showDirectionSelector}
          onOpenChange={setShowDirectionSelector}
          value={sort.ordering}
          onValueChange={(value: SortDirection) =>
            onSortUpdate(sort.column, { ordering: value })
          }
        >
          <SelectTrigger
            aria-controls={directionListboxId}
            className="h-9 w-24 rounded [&[data-size]]:h-8"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            id={directionListboxId}
            className="min-w-[var(--radix-select-trigger-width)] origin-[var(--radix-select-content-transform-origin)]"
          >
            {dataTableConfig.sortOrders.map((order) => (
              <SelectItem key={order.value} value={order.value}>
                {order.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          aria-controls={sortItemId}
          variant="outline"
          size="icon"
          className="size-8 shrink-0 rounded"
          onClick={() => onSortRemove(sort.column)}
        >
          <Trash2 className="size-4" />
        </Button>
        <SortableItemHandle asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-8 shrink-0 rounded"
          >
            <GripVertical className="size-5" />
          </Button>
        </SortableItemHandle>
      </li>
    </SortableItem>
  )
}
