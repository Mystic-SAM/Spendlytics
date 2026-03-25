
import type { DateRangeType } from "@/components/DateRangeSelect";
import SummaryCard from "./SummaryCard";
import { useSummaryAnalyticsQuery } from "@/features/analytics/analyticsAPI";

const DashboardStats = ({ dateRange }: { dateRange?: DateRangeType }) => {

  const { data, isFetching } = useSummaryAnalyticsQuery(
    { preset: dateRange?.value },
    { skip: !dateRange }
  );
  const summaryData = data?.data;

  return (
    <div className="flex flex-row items-center">
      <div className="flex flex-wrap gap-4">
        <SummaryCard
          title="Total Income"
          value={summaryData?.totalIncome}
          percentageChange={summaryData?.percentageChange?.income}
          dateRange={dateRange}
          isLoading={isFetching}
          cardType="income"
        />
        <SummaryCard
          title="Total Expenses"
          value={summaryData?.totalExpenses}
          dateRange={dateRange}
          percentageChange={summaryData?.percentageChange?.expenses}
          isLoading={isFetching}
          cardType="expenses"
        />
        <SummaryCard
          title="Available Balance"
          value={summaryData?.availableBalance}
          dateRange={dateRange}
          percentageChange={summaryData?.percentageChange?.balance}
          isLoading={isFetching}
          cardType="balance"
        />
        <SummaryCard
          title="Total Investment"
          value={summaryData?.totalInvestment}
          dateRange={dateRange}
          percentageChange={summaryData?.percentageChange?.investment}
          isLoading={isFetching}
          cardType="investment"
        />
        <SummaryCard
          title="Savings Rate"
          value={summaryData?.savingRate?.percentage}
          expenseRatio={summaryData?.savingRate?.expenseRatio}
          isPercentageValue
          dateRange={dateRange}
          isLoading={isFetching}
          cardType="savings"
        />
      </div>
    </div>
  );
};

export default DashboardStats;