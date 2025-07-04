import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Subscription } from "@/types";

interface DashboardSummaryProps {
  subscriptions: Subscription[];
}

export function DashboardSummary({ subscriptions }: DashboardSummaryProps) {
  const monthlyTotal = subscriptions
    .filter((sub) => sub.billing_cycle === "monthly")
    .reduce((acc, sub) => acc + Number(sub.price), 0);

  const yearlyTotal = subscriptions
    .filter((sub) => sub.billing_cycle === "yearly")
    .reduce((acc, sub) => acc + Number(sub.price), 0);
    
  const totalYearlyCost = yearlyTotal + (monthlyTotal * 12);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Monthly Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Total from monthly subscriptions
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Annual Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalYearlyCost.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Total from all recurring subscriptions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}