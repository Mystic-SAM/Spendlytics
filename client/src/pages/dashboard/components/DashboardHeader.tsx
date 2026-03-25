import { DateRangeSelect, type DateRangeType } from "@/components/DateRangeSelect";
import AddTransactionDrawer from "@/components/transaction/AddTransactionDrawer";

interface Props {
  title: string;
  subtitle: string;
  dateRange?: DateRangeType;
  setDateRange?: (range: DateRangeType) => void;
}

const DashboardHeader = ({ title, subtitle, dateRange, setDateRange }: Props) => {
  return (
    <div className="flex flex-col lg:flex-row items-start justify-between space-y-7">
      <div className="space-y-1">
        <h2 className="text-2xl lg:text-4xl font-medium">{title}</h2>
        <p className="text-white/60 text-sm">{subtitle}</p>
      </div>
      <div className="flex flex-wrap gap-4 mb-6">
        <DateRangeSelect dateRange={dateRange || null} setDateRange={(range) => setDateRange?.(range)} />
        <AddTransactionDrawer />
      </div>
    </div>
  );
};

export default DashboardHeader;