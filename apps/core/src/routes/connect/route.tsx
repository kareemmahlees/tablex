import { Drivers } from "@/bindings"
import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { MappedDrivers } from "@/lib/types"
import { cn } from "@tablex/lib/utils"
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
  const [selectedDriver, setSelectedDriver] = useState<Drivers | null>(null)
  return (
    <section className="dark:bg-grid-white/[0.2] bg-grid-black/[0.2] flex h-full flex-col items-center justify-center gap-y-9 overflow-hidden bg-white dark:bg-black">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

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
      {selectedDriver === "sqlite" ? (
        <SqliteConnection />
      ) : (
        selectedDriver && <PgMySQLConnection driver={selectedDriver} />
      )}
    </section>
  )
}
