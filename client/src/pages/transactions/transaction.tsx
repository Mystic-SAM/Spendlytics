import PageLayout from "@/components/PageLayout";
import AddTransactionDrawer from "@/components/transaction/AddTransactionDrawer";
import TransactionTable from "@/components/transaction/transaction-table/TransactionTable";
import { Card, CardContent } from "@/components/ui/card";

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
    >
      <Card className="border-0 shadow-none">
        <CardContent className="pt-2">
          <TransactionTable pageSize={20} />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
