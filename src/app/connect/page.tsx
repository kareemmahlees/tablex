"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import ConnectionRadio from "./_components/conn-radio";
import SqliteConnectionDetails from "./_components/sqlite-connection";

const frameworks = [
  {
    value: "mysql",
    label: "MySQL"
  },
  {
    value: "psql",
    label: "PostgreSQL"
  },
  {
    value: "sqlite",
    label: "SQLite"
  }
];

interface ConnectionParamsProps {
  type: "mysql" | "psql";
}

const ConnectionPage = () => {
  const [open, setOpen] = useState(false);
  const [driver, setDriver] = useState("");
  return (
    <main className="h-full bg-primary text-white flex items-center justify-center bg-[url(/texture.svg)] bg-contain ">
      <section className="flex flex-col items-center gap-y-10">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={"secondary"}
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {driver
                ? frameworks.find((framework) => framework.value === driver)
                    ?.label
                : "Select a Database..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              {/* <CommandInput placeholder="Search database..." /> */}
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {frameworks.map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.value}
                    onSelect={(currentValue) => {
                      setDriver(currentValue === driver ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        driver === framework.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {framework.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {driver === "sqlite" && <SqliteConnectionDetails />}
        {(driver === "psql" || driver === "mysql") && (
          <ConnectionRadio driver={driver} />
        )}
      </section>
    </main>
  );
};

export default ConnectionPage;
