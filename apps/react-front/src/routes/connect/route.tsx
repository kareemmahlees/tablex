import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Drivers, MappedDrivers, type SupportedDrivers } from "@/lib/types"
import { cn } from "@/lib/utils"
import { createFileRoute } from "@tanstack/react-router"
import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import PgMySQLConnection from "./-components/pg-mysql-connection"
import SqliteConnection from "./-components/sqlite-connection"

export const Route = createFileRoute("/connect")({
  component: CreateConnection
})

function CreateConnection() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<SupportedDrivers | null>(
    null
  )
  return (
    <section className="flex h-full flex-col items-center justify-center gap-y-9 overflow-hidden">
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
                        : (currentValue as SupportedDrivers)
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
      {selectedDriver === Drivers.SQLite ? (
        <SqliteConnection />
      ) : (
        selectedDriver && <PgMySQLConnection driver={selectedDriver} />
      )}
      <img
        src={"/connect.svg"}
        alt="bg"
        aria-hidden
        className="absolute -z-10 h-full w-full object-cover object-center opacity-50"
      />
    </section>
  )
}
