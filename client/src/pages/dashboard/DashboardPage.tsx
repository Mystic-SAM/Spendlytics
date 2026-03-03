import PageLayout from "@/components/PageLayout";
import DashboardRecentTransactions from "./DashboardRecentTransactions";

const Dashboard = () => {

  return (
    <div className="w-full flex flex-col">
      {/* Dashboard Summary Overview */}
      <PageLayout className="space-y-6">
        {/* Dashboard Recent Transactions */}
        <div className="w-full mt-0">
          <DashboardRecentTransactions />
        </div>
      </PageLayout>
    </div>
  );
};

export default Dashboard;