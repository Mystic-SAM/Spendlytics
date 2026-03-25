import { useTypedSelector } from "@/app/hook";
import DashboardHeader from "./components/DashboardHeader";
import type { DateRangeType } from "@/components/DateRangeSelect";
import DashboardStats from "./components/DashboardStats";

const DashboardSummary = ({ dateRange, setDateRange }: { dateRange?: DateRangeType; setDateRange?: (range: DateRangeType) => void }) => {
  const { user } = useTypedSelector((state) => state.auth);

  return (
    <div className="w-full">
      <DashboardHeader
        title={`Welcome back, ${user?.name || "Anonymous User"}`}
        subtitle="This is your overview report for the selected period"
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      <DashboardStats
        dateRange={dateRange}
      />
    </div>
  );
};

export default DashboardSummary;