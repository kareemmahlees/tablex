import { Drivers } from "@/bindings"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import DriverSelector from "./-components/driver-selector"
import PgMySQLConnection from "./-components/pg-mysql-connection"
import SqliteConnection from "./-components/sqlite-connection"

export const Route = createFileRoute("/connect")({
  component: CreateConnection
})

function CreateConnection() {
  const [selectedDriver, setSelectedDriver] = useState<Drivers | null>(null)

  return (
    <section className="dark:bg-grid-white/[0.2] bg-grid-black/[0.2] flex h-full flex-col items-center justify-center gap-y-9 overflow-hidden bg-white dark:bg-black">
      <DriverSelector
        selectedDriver={selectedDriver}
        setSelectedDriver={setSelectedDriver}
      />
      {selectedDriver === "sqlite" ? (
        <SqliteConnection />
      ) : (
        selectedDriver && <PgMySQLConnection driver={selectedDriver} />
      )}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
    </section>
  )
}
