"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"

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
import { cn } from "@tablex/lib/utils"
import { ScrollArea } from "../ui/scroll-area"

type SearchableInputProps = {
  onValueChange: (v: string) => void
  items: { label: string; value: string }[]
  placeholder: string
  emptyMsg: string
  defaultValue?: string
}

export const SearchableInput = ({
  items,
  onValueChange,
  placeholder,
  emptyMsg,
  defaultValue
}: SearchableInputProps) => {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[150px] justify-between text-sm"
        >
          {value
            ? items.find((item) => item.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-fit p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <ScrollArea>
            <CommandList>
              <CommandEmpty>{emptyMsg}</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      onValueChange(currentValue)
                      setOpen(false)
                    }}
                  >
                    {item.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
