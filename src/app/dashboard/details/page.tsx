"use client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { generateColumns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { getRows } from "./actions";

const TableDataPage = () => {
  const params = useSearchParams();
  const tableName = params.get("tableName")!;

  const { data, isLoading } = useQuery({
    queryKey: ["table_rows", tableName],
    queryFn: async () => {
      let rows = await getRows(tableName);
      let columns = await generateColumns(tableName);
      return { columns, rows };
    },
  });
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return <DataTable columns={data?.columns!} data={data?.rows!} />;
};

export default TableDataPage;
