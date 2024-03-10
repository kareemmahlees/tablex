import {
  establishConnection,
  getConnectionDetails
} from "@/commands/connection"
import { getTables } from "@/commands/table"
import LoadingSpinner from "@/components/loading-spinner"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Link, Outlet, createFileRoute } from "@tanstack/react-router"
import { ArrowLeft, Search, Table } from "lucide-react"
import { Suspense, useRef, useState, type KeyboardEvent } from "react"
import toast from "react-hot-toast"
import { z } from "zod"

const dashboardConnectionSchema = z.object({
  connectionId: z.string().uuid().optional()
})

export const Route = createFileRoute("/dashboard/_layout")({
  validateSearch: dashboardConnectionSchema,
  loaderDeps: ({ search: { connectionId } }) => ({ connectionId }),
  loader: async ({ deps: { connectionId }, navigate }) => {
    let connName: string

    if (connectionId) {
      const connDetails = await getConnectionDetails(connectionId)

      try {
        await establishConnection(connDetails.connString, connDetails.driver)
      } catch (error) {
        toast.error(error as string)
        navigate({ to: "/connections" })
      }

      connName = connDetails.connName
    } else {
      // * useful for `on the fly` connections
      connName = "Temp Connection"
    }

    const tables = await getTables()

    return { connName, tables }
  },
  component: DashboardLayout
})

function DashboardLayout() {
  const data = Route.useLoaderData()
  const [tables, setTables] = useState<string[]>(data?.tables)
  // const [isDialogOpen, setIsDialogOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // useLayoutEffect(() => {
  //   unregister("CommandOrControl+S").then(() =>
  //     registerSearchShortcut(inputRef)
  //   )
  // })

  let timeout: NodeJS.Timeout
  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    const searchPattern = e.currentTarget.value
    if (searchPattern === "") return setTables(data.tables)

    clearTimeout(timeout)

    timeout = setTimeout(() => {
      const filteredTables = tables.filter((table) =>
        table.includes(searchPattern)
      )
      setTables(filteredTables)
    }, 100)
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main className="flex h-full">
        <aside className="flex w-56 flex-col items-start justify-between overflow-y-auto bg-zinc-800 p-4 pt-2 lg:w-72 lg:p-6">
          <Link
            to="/connections"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hover:bg-muted-foreground/20 p-1"
            )}
          >
            <ArrowLeft className="h-4 w-4 " color="gray" />
          </Link>
          <div className="mb-4 flex flex-col items-start gap-y-4 lg:gap-y-5">
            <h1 className="text-lg font-bold text-gray-500">{data.connName}</h1>
            <div className="bg-background flex items-center rounded-sm px-1">
              <Search className="h-3 lg:h-5" color="#4a506f" />
              <Input
                ref={inputRef}
                onKeyUp={handleKeyUp}
                placeholder="Search..."
                className="h-6 border-none text-sm placeholder:text-xs focus-visible:ring-0 focus-visible:ring-offset-0 lg:h-8 lg:placeholder:text-base"
              />
              <div className="hidden items-center gap-x-1 text-xs lg:flex">
                <p className="bg-muted rounded-sm px-1 py-[0.5px]">Ctrl</p>
                <p>+</p>
                <p className="bg-muted rounded-sm px-1 py-[0.5px]">S</p>
              </div>
            </div>
            <div className="overflow-y-auto">
              <ul className="flex flex-col items-start gap-y-1 ">
                {tables.map((table, index) => {
                  return (
                    <Link
                      to="/dashboard/layout/data/$tableName"
                      params={{
                        tableName: table
                      }}
                      key={index}
                      className="flex items-center justify-center gap-x-1 text-sm text-white lg:text-base"
                      role="button"
                    >
                      <Table size={16} className="fill-amber-600 text-black" />
                      {table}
                    </Link>
                  )
                })}
              </ul>
            </div>
          </div>
          {/* {tableName && <AddRowBtn />} */}
        </aside>
        {tables.length > 0 && <Outlet />}
        {/* <CommandPalette setIsDialogOpen={setIsDialogOpen} />
      <APIDocsDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      /> */}
      </main>
    </Suspense>
  )
}

export default DashboardLayout
