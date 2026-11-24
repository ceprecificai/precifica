import DashboardHeader from "@/components/dashboard/Dashboardheader";
import PricingCalculatorModern from "@/components/pricing/Pricingcalculator";

export default function PricingPage() {
  return (
    <>
      <DashboardHeader />
      <div className="min-h-screen w-full">
        <PricingCalculatorModern />
      </div>
    </>
  );
}
