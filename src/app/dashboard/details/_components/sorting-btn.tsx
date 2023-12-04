import type { Column } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

interface SortingButtonProps {
  column: Column<any>;
  title: string;
}

const SortingButton = ({ column, title }: SortingButtonProps) => {
  return (
    <button
      className="flex items-center group"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="h-3 w-3 lg:h-4 lg:w-4 group-hover:translate-x-1 group-hover:opacity-100 opacity-0 transition-all" />
    </button>
  );
};

export default SortingButton;
