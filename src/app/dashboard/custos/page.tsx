import DashboardHeader from "@/components/dashboard/Dashboardheader";
import Costs from "@/components/costs/Costs";

export default function CustosPage() {
  return (
    <>
      <DashboardHeader />
      <div className="min-h-screen w-full">
        <Costs />
      </div>
    </>
  );
}
