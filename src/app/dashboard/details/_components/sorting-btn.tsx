import { Column } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { tableExmaple } from "./columns";

interface SortingButtonProps {
  column: Column<tableExmaple>;
  title: string;
}

const SortingButton = ({ column, title }: SortingButtonProps) => {
  return (
    <button
      className="flex items-center group"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:opacity-100 opacity-0 transition-all" />
    </button>
  );
};

export default SortingButton;
