import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import AddTransactionDrawer from "@/components/transaction/AddTransactionDrawer";
import ImportTransactionModal from "@/components/transaction/import-transaction/ImportTransactionModal";
import DownloadTransactionButton from "@/components/transaction/DownloadTransactionButton";
import TransactionTable from "@/components/transaction/transaction-table/TransactionTable";
import { Card, CardContent } from "@/components/ui/card";
import type { GetAllTransactionParams } from "@/features/transaction/transactionTypes";

export default function Transactions() {
  const [downloadParams, setDownloadParams] = useState<GetAllTransactionParams>({});

  return (
    <PageLayout
      title="All Transactions"
      subtitle="Showing all transactions"
      addMarginTop
      rightAction={
        <div className="flex items-center gap-2 flex-wrap">
          <DownloadTransactionButton filters={downloadParams} />
          <ImportTransactionModal />
          <AddTransactionDrawer />
        </div>
      }
    >
      <Card className="border-0 shadow-none">
        <CardContent className="pt-2">
          <TransactionTable
            pageSize={10}
            isShowDateFilter
            onQueryParamsChange={setDownloadParams}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
