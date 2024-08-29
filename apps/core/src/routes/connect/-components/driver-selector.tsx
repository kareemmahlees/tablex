import type { Drivers } from "@/bindings"
import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { MappedDrivers } from "@/lib/types"
import { cn } from "@tablex/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { useState, type Dispatch, type SetStateAction } from "react"

type Props = {
  selectedDriver: Drivers | null
  setSelectedDriver: Dispatch<SetStateAction<Drivers | null>>
}
const DriverSelector = ({ selectedDriver, setSelectedDriver }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          role="combobox"
          aria-expanded={isPopoverOpen}
          className="w-[230px] justify-between"
        >
          {selectedDriver
            ? MappedDrivers.find((driver) => driver.value === selectedDriver)
                ?.label
            : "Select a Database Driver"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandGroup>
            {MappedDrivers.map((driver) => (
              <CommandItem
                key={driver.value}
                value={driver.value}
                onSelect={(currentValue) => {
                  setSelectedDriver(
                    currentValue === selectedDriver
                      ? null
                      : (currentValue as Drivers)
                  )
                  setIsPopoverOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    driver.value === selectedDriver
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {driver.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default DriverSelector
