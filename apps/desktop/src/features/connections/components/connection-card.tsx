import type { ConnConfig } from "@/bindings"
import MySQL from "@/components/icons/mysql"
import PostgreSQL from "@/components/icons/postgres"
import SQLite from "@/components/icons/sqlite"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import type { Drivers } from "@/lib/types"
import type { ReactNode } from "react"

const DRIVERS_ICONS: Record<(typeof Drivers)[keyof typeof Drivers], ReactNode> =
  {
    sqlite: <SQLite width={30} height={30} />,
    postgresql: <PostgreSQL width={25} height={25} />,
    mysql: <MySQL width={30} height={30} />
  }

export const ConnectionCard = ({ connection }: { connection: ConnConfig }) => {
  return (
    <Card className="bg-sidebar transition-all hover:border hover:border-white">
      <CardHeader className="p-4">
        <CardTitle className="flex justify-between text-lg">
          <span>{connection.name}</span>
          {DRIVERS_ICONS[connection.driver]}
        </CardTitle>
        <CardDescription className="text-xs">
          {connection.driver}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
