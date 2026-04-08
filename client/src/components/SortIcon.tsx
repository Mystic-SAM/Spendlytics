import type { Column, SortDirection } from "@tanstack/react-table";
import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpNarrowWide } from "lucide-react"

const SortIcon = ({ column }: { column: Column<any, any> }) => {
  const sortDirection: false | SortDirection = column.getIsSorted();

  if (sortDirection === "asc") {
    return <ArrowUpNarrowWide className="ml-2 h-4 w-4 sort-icon sorted" />
  }

  if (sortDirection === "desc") {
    return <ArrowDownWideNarrow className="ml-2 h-4 w-4 sort-icon sorted" />
  }

  return (
    <ArrowUpDown className="ml-2 h-4 w-4 sort-icon not-sorted" />
  )
}

export default SortIcon;