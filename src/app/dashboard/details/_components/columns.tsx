import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef, Row, Table } from "@tanstack/react-table";
import { getColumns } from "../actions";
import SortingButton from "./sorting-btn";

export const generateColumns = async (
  tableName: string
): Promise<ColumnDef<any>[]> => {
  const columns = await getColumns(tableName);
  const columnsDefinition = columns.map((colName) => {
    return {
      accessorKey: colName,
      header: ({ column }: { column: any }) => {
        return <SortingButton column={column} title={colName} />;
      }
    };
  });
  columnsDefinition.unshift({
    // @ts-ignore
    id: "select",
    // @ts-ignore
    header: ({ table }: { table: Table<any> }) => (
      <Checkbox
        className="invert"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => {
          if (table.getIsSomeRowsSelected()) {
            table.toggleAllRowsSelected(false);
          } else {
            table.toggleAllPageRowsSelected(!!value);
          }
        }}
        aria-label="Select all"
      />
    ),
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <Checkbox
          className="invert"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      );
    },
    enableSorting: false,
    enableHiding: false
  });
  return columnsDefinition;
};
