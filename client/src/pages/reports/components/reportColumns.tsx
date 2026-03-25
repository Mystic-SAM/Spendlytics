import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw } from "lucide-react";
import { REPORT_STATUS, type ReportStatusType } from "@/constants/constants";
import type { ReportType } from "@/features/report/reportTypes";
import { toast } from "sonner";

export const reportColumns: ColumnDef<ReportType>[] = [
  {
    accessorKey: "period",
    header: "Report Period",
    size: 150,
    cell: ({ row }) => {
      const period = row.getValue("period") as string;
      return (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Clock className="h-3.5 w-3.5 opacity-50 shrink-0" />
          <span>{period}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "sentDate",
    header: "Sent Date",
    size: 100,
    cell: ({ row }) => {
      const date = new Date(row.original.sentDate);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 100,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusStyles = {
        [REPORT_STATUS.SENT]: "bg-green-100 text-green-800",
        [REPORT_STATUS.FAILED]: "bg-red-100 text-red-800",
        [REPORT_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
        [REPORT_STATUS.PROCESSING]: "bg-blue-100 text-blue-800",
        [REPORT_STATUS.NO_ACTIVITY]: "bg-gray-100 text-gray-800",
      };

      const style = statusStyles[status as ReportStatusType] || "bg-gray-100 text-gray-800";

      return (
        <span className={`inline-flex items-center rounded-full
         px-2.5 py-0.5 text-xs font-medium ${style}`}>
          {status}
        </span>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "actions",
    header: "Actions",
    size: 100,
    cell: () => {
      const handleResend = () => {
        toast.info("Not Implemented yet! Coming Soon!");
      }

      return <div className="flex gap-1">
        <Button size="sm" variant="outline" className="font-normal" onClick={handleResend}>
          <RefreshCw className="h-4 w-4" />
          Resend
        </Button>
        <div></div>
      </div>
    },
  },
];