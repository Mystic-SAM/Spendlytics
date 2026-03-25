import PageLayout from "@/components/PageLayout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import ReportTable from "./components/ReportTable";
import ScheduleReportDrawer from "./components/ScheduleReportDrawer";

export default function ReportsPage() {

  return (
    <PageLayout
      title="Report History"
      subtitle="View and manage your financial reports"
      addMarginTop
      rightAction={
        <ScheduleReportDrawer />
      }
    >
      <Card className="border shadow-none">
        <CardContent>
          <ReportTable />
        </CardContent>
      </Card>
    </PageLayout>
  );
}