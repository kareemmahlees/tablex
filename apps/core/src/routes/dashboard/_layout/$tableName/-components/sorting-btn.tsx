import type { Column } from "@tanstack/react-table"
import { ChevronsUpDown } from "lucide-react"

interface SortingButtonProps {
  column: Column<any>
  title: string
}

const SortingButton = ({ column, title }: SortingButtonProps) => {
  return (
    <button
      className="group flex items-center gap-x-2"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ChevronsUpDown className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
    </button>
  )
}

export default SortingButton
