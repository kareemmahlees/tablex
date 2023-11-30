"use client";
import { useSearchParams } from "next/navigation";
import { columns, tableExmaple } from "./_components/columns";
import { DataTable } from "./_components/data-table";

function getData(): tableExmaple[] {
  // Fetch data from your API here.
  return [];
}

const TableDataPage = () => {
  const params = useSearchParams();
  const tableName = params.get("tableName")!;
  const data = getData();
  return <DataTable columns={columns} data={data} />;
};

export default TableDataPage;
