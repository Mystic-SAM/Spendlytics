import PageLayout from "@/components/PageLayout";
import DashboardRecentTransactions from "./DashboardRecentTransactions";
import { useState } from "react";
import type { DateRangeType } from "@/components/DateRangeSelect";
import DashboardSummary from "./DashboardSummary";
import DashboardDataChart from "./DashboardDataChart";
import ExpensePieChart from "./ExpensePieChart";

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<DateRangeType>(null);

  return (
    <div className="w-full flex flex-col">
      {/* Dashboard Summary Overview */}
      <PageLayout className="space-y-6"
        renderPageHeader={<DashboardSummary dateRange={dateRange} setDateRange={setDateRange} />}
      >
        {/* Dashboard Main Section */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-4">
            <DashboardDataChart dateRange={dateRange} />
          </div>
          <div className="lg:col-span-2">
            <ExpensePieChart dateRange={dateRange} />
          </div>
        </div>
        {/* Dashboard Recent Transactions */}
        <div className="w-full mt-0">
          <DashboardRecentTransactions />
        </div>
      </PageLayout>
    </div>
  );
};

export default Dashboard;