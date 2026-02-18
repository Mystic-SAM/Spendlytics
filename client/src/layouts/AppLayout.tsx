import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <>
    <div className="min-h-screen pb-10">
      <main className="w-full max-w-full">
        <Outlet />
      </main>
    </div>
    </>
  );
};

export default AppLayout;