import LoadingSpinner from "@/components/loading-spinner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useGetFKRelations } from "@/hooks/row"
import { Link } from "lucide-react"

type ForeignKeyDropdownProps = {
  tableName: string
  columnName: string
  cellValue: any
}

const ForeignKeyDropdown = ({
  tableName,
  columnName,
  cellValue
}: ForeignKeyDropdownProps) => {
  const { data, isLoading, refetch } = useGetFKRelations(
    tableName,
    columnName,
    cellValue
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onFocus={() => refetch()}
        onMouseEnter={() => refetch()}
      >
        <Link className="md:h-3 md:w-3 lg:h-4 lg:w-4" />
      </DropdownMenuTrigger>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <DropdownMenuContent className="sm:w-[300px] md:w-[400px] lg:w-[500px]">
          <Tabs defaultValue={data![0].tableName} className="w-full">
            <TabsList>
              {data?.map((fkRow) => (
                <TabsTrigger value={fkRow.tableName}>
                  {fkRow.tableName}
                </TabsTrigger>
              ))}
            </TabsList>
            {data?.map((fkRow) => (
              <TabsContent value={fkRow.tableName} className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow>
                      {/* A quick trick to get column headings without the need to 
                          make an extra call to the backend
                       */}
                      {Object.keys(fkRow.rows[0]).map((head) => (
                        <TableHead>{head}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fkRow.rows.map((row) => (
                      <TableRow>
                        {Object.values(row).map((rowValue) => (
                          <TableCell>{rowValue}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )
}

export default ForeignKeyDropdown
