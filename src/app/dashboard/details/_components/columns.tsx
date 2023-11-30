import type { ColumnDef } from "@tanstack/react-table";
import SortingButton from "./sorting-btn";

export type tableExmaple = {
  name: string;
  age: number;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  col6: string;
  col7: string;
  col8: string;
  col9: string;
  col10: string;
  col11: string;
  col12: string;
  col13: string;
};

export const columns: ColumnDef<tableExmaple>[] = [
  {
    accessorKey: "age",
    header: ({ column }) => {
      return <SortingButton column={column} title="Age" />;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return <SortingButton column={column} title="Name" />;
    },
  },
  { accessorKey: "col1", header: "Col1" },
  { accessorKey: "col2", header: "Col2" },
  { accessorKey: "col3", header: "Col3" },
  { accessorKey: "col4", header: "Col4" },
  { accessorKey: "col5", header: "Col5" },
  { accessorKey: "col6", header: "Col6" },
  { accessorKey: "col7", header: "Col7" },
  { accessorKey: "col8", header: "Col8" },
  { accessorKey: "col9", header: "Col8" },
  { accessorKey: "col10", header: "Col8" },
  { accessorKey: "col11", header: "Col8" },
  { accessorKey: "col12", header: "Col8" },
  { accessorKey: "col13", header: "Col8" },
  { accessorKey: "col6", header: "Col6" },
  { accessorKey: "col7", header: "Col7" },
  { accessorKey: "col8", header: "Col8" },
  { accessorKey: "col9", header: "Col8" },
  { accessorKey: "col10", header: "Col8" },
  { accessorKey: "col11", header: "Col8" },
  { accessorKey: "col12", header: "Col8" },
  { accessorKey: "col13", header: "Col8" },
];
