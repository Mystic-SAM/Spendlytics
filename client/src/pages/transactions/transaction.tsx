import PageLayout from "@/components/PageLayout";
import AddTransactionDrawer from "@/components/transaction/AddTransactionDrawer";

export default function Transactions() {
  return (
    <PageLayout
      title="All Transactions"
      subtitle="Showing all transactions"
      addMarginTop
      rightAction={
        <div className="flex items-center gap-2">
          <AddTransactionDrawer />
        </div>
      }
    ></PageLayout>
  );
}
