import Navbar from "@/components/navbar/Navbar";
import EditTransactionDrawer from "@/components/transaction/EditTransactionDrawer";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <>
      <div className="min-h-screen pb-10">
        <Navbar />
        <main className="w-full max-w-full">
          <Outlet />
        </main>
      </div>
      <EditTransactionDrawer />
    </>
  );
};

export default AppLayout;