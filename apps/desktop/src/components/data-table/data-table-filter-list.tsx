"use client"

import type { Column, ColumnMeta, Table } from "@tanstack/react-table"
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  GripVertical,
  ListFilter,
  Trash2
} from "lucide-react"
import * as React from "react"

import { dataTableConfig } from "@/components/data-table/data-table-config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import {
  filteringSchema,
  filterItemSchema
} from "@/features/table-view/schemas"
import { getDefaultFilterOperator, getFilterOperators } from "@/lib/data-table"
import { formatDate, generateId } from "@/lib/utils"
import type {
  ExtendedColumnFilter,
  FilterOperator,
  JoinOperator
} from "@/types/data-table"
import { cn } from "@tablex/lib/utils"
import { useHotkeys } from "react-hotkeys-hook"
import { useDebounceCallback } from "usehooks-ts"
import { z } from "zod"
import { Input } from "../ui/input"
import { DataTableRangeFilter } from "./data-table-range-filter"

const DEBOUNCE_MS = 300
const THROTTLE_MS = 50
const OPEN_MENU_SHORTCUT = "f"
const REMOVE_FILTER_SHORTCUTS = ["backspace", "delete"]

interface DataTableFilterListProps<TData>
  extends React.ComponentProps<typeof PopoverContent> {
  table: Table<TData>
  filters: z.infer<typeof filteringSchema>
  onFilterChange: (data: z.infer<typeof filteringSchema>) => void
  joinOperator: "and" | "or"
  onJoinOperatorChange: (data: "and" | "or") => void
  debounceMs?: number
  throttleMs?: number
  shallow?: boolean
}

export function DataTableFilterList<TData>({
  table,
  filters,
  onFilterChange,
  joinOperator,
  onJoinOperatorChange,
  debounceMs = DEBOUNCE_MS,
  throttleMs = THROTTLE_MS,
  shallow = true,
  ...props
}: DataTableFilterListProps<TData>) {
  const id = React.useId()
  const labelId = React.useId()
  const descriptionId = React.useId()
  const [open, setOpen] = React.useState(false)
  const addButtonRef = React.useRef<HTMLButtonElement>(null)

  const columns = React.useMemo(() => {
    return table.getAllColumns().filter((column) => column.getCanFilter())
  }, [table])

  const debouncedSetFilters = useDebounceCallback(onFilterChange, debounceMs)

  const onFilterAdd = React.useCallback(() => {
    const column = columns[0]

    if (!column) return

    debouncedSetFilters([
      ...filters,
      {
        column: column.id,
        id: column.id as Extract<keyof TData, string>,
        value: "",
        variant: column.columnDef.meta?.type ?? "text",
        operator: getDefaultFilterOperator(
          column.columnDef.meta?.variant ?? "text"
        ),
        filterId: generateId({ length: 8 })
      }
    ])
  }, [columns, filters, debouncedSetFilters])

  const onFilterUpdate = React.useCallback(
    (
      filterId: string,
      updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>
    ) => {
      const updatedFilters = filters.map((filter) => {
        if (filter.filterId === filterId) {
          return { ...filter, ...updates }
        }
        return filter
      })

      debouncedSetFilters(updatedFilters)
    },
    [debouncedSetFilters]
  )

  const onFilterRemove = React.useCallback(
    (filterId: string) => {
      const updatedFilters = filters.filter(
        (filter) => filter.filterId !== filterId
      )
      onFilterChange(updatedFilters)
      requestAnimationFrame(() => {
        addButtonRef.current?.focus()
      })
    },
    [filters, onFilterChange]
  )

  const onFiltersReset = React.useCallback(() => {
    onFilterChange([])
    onJoinOperatorChange("and")
  }, [onFilterChange, onJoinOperatorChange])

  useHotkeys(
    `${OPEN_MENU_SHORTCUT},shift+${OPEN_MENU_SHORTCUT}`,
    (event) => {
      if (event.shiftKey && filters.length > 0) {
        onFilterRemove(filters[filters.length - 1]?.filterId ?? "")
        return
      }

      setOpen(true)
    },
    {
      keydown: true,
      ignoreEventWhen: (e) =>
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
    }
  )

  const onTriggerKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (
        REMOVE_FILTER_SHORTCUTS.includes(event.key.toLowerCase()) &&
        filters.length > 0
      ) {
        event.preventDefault()
        onFilterRemove(filters[filters.length - 1]?.filterId ?? "")
      }
    },
    [filters, onFilterRemove]
  )

  return (
    <Sortable
      value={filters}
      onValueChange={onFilterChange}
      getItemValue={(item) => item.filterId}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onKeyDown={onTriggerKeyDown}
            className="h-8 space-x-2"
          >
            <ListFilter className="size-4" />
            <span>Filter</span>
            {filters.length > 0 && (
              <Badge
                variant="secondary"
                className="h-[18.24px] rounded-[3.2px] px-[5.12px] font-mono text-[10.4px] font-normal"
              >
                {filters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          aria-describedby={descriptionId}
          aria-labelledby={labelId}
          className="flex w-full max-w-[var(--radix-popover-content-available-width)] origin-[var(--radix-popover-content-transform-origin)] flex-col gap-3.5 p-4 sm:min-w-[380px]"
          {...props}
        >
          <div className="flex flex-col gap-1">
            <h4 id={labelId} className="font-medium leading-none">
              {filters.length > 0 ? "Filters" : "No filters applied"}
            </h4>
            <p
              id={descriptionId}
              className={cn(
                "text-muted-foreground text-sm",
                filters.length > 0 && "sr-only"
              )}
            >
              {filters.length > 0
                ? "Modify filters to refine your rows."
                : "Add filters to refine your rows."}
            </p>
          </div>
          {filters.length > 0 ? (
            <SortableContent asChild>
              <ul className="flex max-h-[300px] flex-col gap-2 overflow-y-auto p-1">
                {filters.map((filter, index) => (
                  <DataTableFilterItem<TData>
                    key={filter.filterId}
                    filter={filter}
                    index={index}
                    filterItemId={`${id}-filter-${filter.filterId}`}
                    joinOperator={joinOperator}
                    setJoinOperator={onJoinOperatorChange}
                    columns={columns}
                    onFilterUpdate={onFilterUpdate}
                    onFilterRemove={onFilterRemove}
                  />
                ))}
              </ul>
            </SortableContent>
          ) : null}
          <div className="flex w-full items-center gap-2">
            <Button
              size="sm"
              className="rounded"
              ref={addButtonRef}
              onClick={onFilterAdd}
            >
              Add filter
            </Button>
            {filters.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded"
                onClick={onFiltersReset}
              >
                Reset filters
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
      <SortableOverlay>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 h-8 min-w-[72px] rounded-sm" />
          <div className="bg-primary/10 h-8 w-32 rounded-sm" />
          <div className="bg-primary/10 h-8 w-32 rounded-sm" />
          <div className="bg-primary/10 h-8 min-w-36 flex-1 rounded-sm" />
          <div className="bg-primary/10 size-8 shrink-0 rounded-sm" />
          <div className="bg-primary/10 size-8 shrink-0 rounded-sm" />
        </div>
      </SortableOverlay>
    </Sortable>
  )
}

interface DataTableFilterItemProps<TData> {
  filter: z.infer<typeof filterItemSchema>
  index: number
  filterItemId: string
  joinOperator: JoinOperator
  setJoinOperator: (value: JoinOperator) => void
  columns: Column<TData>[]
  onFilterUpdate: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>
  ) => void
  onFilterRemove: (filterId: string) => void
}

function DataTableFilterItem<TData>({
  filter,
  index,
  filterItemId,
  joinOperator,
  setJoinOperator,
  columns,
  onFilterUpdate,
  onFilterRemove
}: DataTableFilterItemProps<TData>) {
  const [showFieldSelector, setShowFieldSelector] = React.useState(false)
  const [showOperatorSelector, setShowOperatorSelector] = React.useState(false)
  const [showValueSelector, setShowValueSelector] = React.useState(false)

  const column = columns.find((column) => column.id === filter.id)

  const joinOperatorListboxId = `${filterItemId}-join-operator-listbox`
  const fieldListboxId = `${filterItemId}-field-listbox`
  const operatorListboxId = `${filterItemId}-operator-listbox`
  const inputId = `${filterItemId}-input`

  const columnMeta = column?.columnDef.meta
  const filterOperators = getFilterOperators(filter.variant)

  const onItemKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLLIElement>) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (showFieldSelector || showOperatorSelector || showValueSelector) {
        return
      }

      if (REMOVE_FILTER_SHORTCUTS.includes(event.key.toLowerCase())) {
        event.preventDefault()
        onFilterRemove(filter.filterId)
      }
    },
    [
      filter.filterId,
      showFieldSelector,
      showOperatorSelector,
      showValueSelector,
      onFilterRemove
    ]
  )

  if (!column) return null

  return (
    <SortableItem value={filter.filterId} asChild>
      <li
        id={filterItemId}
        tabIndex={-1}
        className="flex items-center gap-2"
        onKeyDown={onItemKeyDown}
      >
        <div className="min-w-[72px] text-center">
          {index === 0 ? (
            <span className="text-muted-foreground text-sm">Where</span>
          ) : index === 1 ? (
            <Select
              value={joinOperator}
              onValueChange={(value: JoinOperator) => setJoinOperator(value)}
            >
              <SelectTrigger
                aria-label="Select join operator"
                aria-controls={joinOperatorListboxId}
                className="h-8 rounded lowercase [&[data-size]]:h-8"
              >
                <SelectValue placeholder={joinOperator} />
              </SelectTrigger>
              <SelectContent
                id={joinOperatorListboxId}
                position="popper"
                className="min-w-(--radix-select-trigger-width) lowercase"
              >
                {dataTableConfig.joinOperators.map((joinOperator) => (
                  <SelectItem key={joinOperator} value={joinOperator}>
                    {joinOperator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-muted-foreground text-sm">
              {joinOperator}
            </span>
          )}
        </div>
        <Popover open={showFieldSelector} onOpenChange={setShowFieldSelector}>
          <PopoverTrigger asChild>
            <Button
              aria-controls={fieldListboxId}
              variant="outline"
              size="sm"
              className="h-8 w-32 justify-between space-x-2 rounded font-normal"
            >
              <span className="truncate">
                {columns.find((column) => column.id === filter.id)?.id ??
                  "Select field"}
              </span>
              <ChevronsUpDown className="size-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            id={fieldListboxId}
            align="start"
            className="w-40 origin-[var(--radix-popover-content-transform-origin)] p-0"
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
                      onSelect={(value) => {
                        onFilterUpdate(filter.filterId, {
                          id: value as Extract<keyof TData, string>,
                          variant: column.columnDef.meta?.type ?? "text",
                          operator: getDefaultFilterOperator(
                            column.columnDef.meta?.variant ?? "text"
                          ),
                          value: ""
                        })

                        setShowFieldSelector(false)
                      }}
                    >
                      <span className="truncate">{column.id}</span>
                      <Check
                        className={cn(
                          "ml-auto",
                          column.id === filter.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Select
          open={showOperatorSelector}
          onOpenChange={setShowOperatorSelector}
          value={filter.operator}
          onValueChange={(value: FilterOperator) =>
            onFilterUpdate(filter.filterId, {
              operator: value,
              value:
                value === "isEmpty" || value === "isNotEmpty"
                  ? ""
                  : filter.value
            })
          }
        >
          <SelectTrigger
            aria-controls={operatorListboxId}
            className="h-8 w-32 rounded lowercase [&[data-size]]:h-8"
          >
            <div className="truncate">
              <SelectValue placeholder={filter.operator} />
            </div>
          </SelectTrigger>
          <SelectContent
            id={operatorListboxId}
            className="origin-[var(--radix-select-content-transform-origin)]"
          >
            {filterOperators.map((operator) => (
              <SelectItem
                key={operator.value}
                value={operator.value}
                className="lowercase"
              >
                {operator.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="min-w-36 flex-1">
          {onFilterInputRender({
            filter,
            inputId,
            column,
            columnMeta,
            onFilterUpdate,
            showValueSelector,
            setShowValueSelector
          })}
        </div>
        <Button
          aria-controls={filterItemId}
          variant="outline"
          size="icon"
          className="size-8 rounded"
          onClick={() => onFilterRemove(filter.filterId)}
        >
          <Trash2 className="size-5" />
        </Button>
        <SortableItemHandle asChild>
          <Button variant="outline" size="icon" className="size-8 rounded">
            <GripVertical className="size-5" />
          </Button>
        </SortableItemHandle>
      </li>
    </SortableItem>
  )
}

function onFilterInputRender<TData>({
  filter,
  inputId,
  column,
  columnMeta,
  onFilterUpdate,
  showValueSelector,
  setShowValueSelector
}: {
  filter: ExtendedColumnFilter<TData>
  inputId: string
  column: Column<TData>
  columnMeta?: ColumnMeta<TData, unknown>
  onFilterUpdate: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>
  ) => void
  showValueSelector: boolean
  setShowValueSelector: (value: boolean) => void
}) {
  if (filter.operator === "isEmpty" || filter.operator === "isNotEmpty") {
    return (
      <div
        id={inputId}
        role="status"
        aria-label={`${columnMeta?.label} filter is ${
          filter.operator === "isEmpty" ? "empty" : "not empty"
        }`}
        aria-live="polite"
        className="dark:bg-input/30 h-8 w-full rounded border bg-transparent"
      />
    )
  }

  switch (filter.variant) {
    case "text":
    case "string":
    case "uuid":
    case "integer":
    case "positiveInteger":
    case "float": {
      if (filter.operator === "between") {
        return (
          <DataTableRangeFilter
            filter={filter}
            column={column}
            inputId={inputId}
            onFilterUpdate={onFilterUpdate}
          />
        )
      }

      const isNumber =
        filter.variant === "float" ||
        filter.variant === "integer" ||
        filter.variant === "positiveInteger"

      return (
        <Input
          id={inputId}
          type={isNumber ? "number" : filter.variant}
          aria-label={`${columnMeta?.label} filter value`}
          aria-describedby={`${inputId}-description`}
          inputMode={isNumber ? "numeric" : undefined}
          placeholder={columnMeta?.placeholder ?? "Enter a value..."}
          className="h-8 w-full rounded"
          defaultValue={
            typeof filter.value === "string" ? filter.value : undefined
          }
          onChange={(event) =>
            onFilterUpdate(filter.filterId, {
              value: isNumber ? Number(event.target.value) : event.target.value
            })
          }
        />
      )
    }

    case "boolean": {
      if (Array.isArray(filter.value)) return null

      const inputListboxId = `${inputId}-listbox`

      return (
        <Select
          open={showValueSelector}
          onOpenChange={setShowValueSelector}
          value={String(filter.value)}
          onValueChange={(value) =>
            onFilterUpdate(filter.filterId, {
              value
            })
          }
        >
          <SelectTrigger
            id={inputId}
            aria-controls={inputListboxId}
            aria-label={`${columnMeta?.label} boolean filter`}
            className="h-8 w-full rounded [&[data-size]]:h-8"
          >
            <SelectValue placeholder={filter.value ? "True" : "False"} />
          </SelectTrigger>
          <SelectContent id={inputListboxId}>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      )
    }

    // case "select":
    // case "multiSelect": {
    //   const inputListboxId = `${inputId}-listbox`

    //   const multiple = filter.variant === "multiSelect"
    //   const selectedValues = multiple
    //     ? Array.isArray(filter.value)
    //       ? filter.value
    //       : []
    //     : typeof filter.value === "string"
    //       ? filter.value
    //       : undefined

    //   return (
    //     <Faceted
    //       open={showValueSelector}
    //       onOpenChange={setShowValueSelector}
    //       value={selectedValues}
    //       onValueChange={(value) => {
    //         onFilterUpdate(filter.filterId, {
    //           value
    //         })
    //       }}
    //       multiple={multiple}
    //     >
    //       <FacetedTrigger asChild>
    //         <Button
    //           id={inputId}
    //           aria-controls={inputListboxId}
    //           aria-label={`${columnMeta?.label} filter value${
    //             multiple ? "s" : ""
    //           }`}
    //           variant="outline"
    //           size="sm"
    //           className="w-full rounded font-normal"
    //         >
    //           <FacetedBadgeList
    //             options={columnMeta?.options}
    //             placeholder={
    //               columnMeta?.placeholder ??
    //               `Select option${multiple ? "s" : ""}...`
    //             }
    //           />
    //         </Button>
    //       </FacetedTrigger>
    //       <FacetedContent
    //         id={inputListboxId}
    //         className="w-[200px] origin-[var(--radix-popover-content-transform-origin)]"
    //       >
    //         <FacetedInput
    //           aria-label={`Search ${columnMeta?.label} options`}
    //           placeholder={columnMeta?.placeholder ?? "Search options..."}
    //         />
    //         <FacetedList>
    //           <FacetedEmpty>No options found.</FacetedEmpty>
    //           <FacetedGroup>
    //             {columnMeta?.options?.map((option) => (
    //               <FacetedItem key={option.value} value={option.value}>
    //                 {option.icon && <option.icon />}
    //                 <span>{option.label}</span>
    //                 {option.count && (
    //                   <span className="ml-auto font-mono text-xs">
    //                     {option.count}
    //                   </span>
    //                 )}
    //               </FacetedItem>
    //             ))}
    //           </FacetedGroup>
    //         </FacetedList>
    //       </FacetedContent>
    //     </Faceted>
    //   )
    // }

    // case "dateRange":
    case "date": {
      const inputListboxId = `${inputId}-listbox`

      const dateValue = Array.isArray(filter.value)
        ? filter.value.filter(Boolean)
        : [filter.value, filter.value].filter(Boolean)

      const displayValue =
        filter.operator === "between" && dateValue.length === 2
          ? `${formatDate(new Date(Number(dateValue[0])))} - ${formatDate(
              new Date(Number(dateValue[1]))
            )}`
          : dateValue[0]
            ? formatDate(new Date(Number(dateValue[0])))
            : "Pick a date"

      return (
        <Popover open={showValueSelector} onOpenChange={setShowValueSelector}>
          <PopoverTrigger asChild>
            <Button
              id={inputId}
              aria-controls={inputListboxId}
              aria-label={`${columnMeta?.label} date filter`}
              variant="outline"
              size="sm"
              className={cn(
                "w-full justify-start rounded text-left font-normal",
                !filter.value && "text-muted-foreground"
              )}
            >
              <CalendarIcon />
              <span className="truncate">{displayValue}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            id={inputListboxId}
            align="start"
            className="w-auto origin-[var(--radix-popover-content-transform-origin)] p-0"
          >
            {filter.operator === "between" ? (
              <Calendar
                aria-label={`Select ${columnMeta?.label} date range`}
                mode="range"
                autoFocus
                selected={
                  dateValue.length === 2
                    ? {
                        from: new Date(Number(dateValue[0])),
                        to: new Date(Number(dateValue[1]))
                      }
                    : {
                        from: new Date(),
                        to: new Date()
                      }
                }
                onSelect={(date) => {
                  onFilterUpdate(filter.filterId, {
                    value: date
                      ? [
                          (date.from?.getTime() ?? "").toString(),
                          (date.to?.getTime() ?? "").toString()
                        ]
                      : []
                  })
                }}
              />
            ) : (
              <Calendar
                aria-label={`Select ${columnMeta?.label} date`}
                mode="single"
                autoFocus
                selected={
                  dateValue[0] ? new Date(Number(dateValue[0])) : undefined
                }
                onSelect={(date) => {
                  onFilterUpdate(filter.filterId, {
                    value: (date?.getTime() ?? "").toString()
                  })
                }}
              />
            )}
          </PopoverContent>
        </Popover>
      )
    }

    default:
      return null
  }
}
