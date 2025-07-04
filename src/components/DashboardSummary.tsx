import { Card, CardContent } from "@/components/ui/card";
import { Subscription } from "@/types";
import { Calendar, TrendingUp, CreditCard, Bell } from "lucide-react";
import { differenceInDays, parseISO } from 'date-fns';

interface DashboardSummaryProps {
  subscriptions: Subscription[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBgClass: string;
}

const StatCard = ({ title, value, icon: Icon, iconBgClass }: StatCardProps) => (
  <Card>
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={`p-3 rounded-md ${iconBgClass}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </CardContent>
  </Card>
);

export function DashboardSummary({ subscriptions }: DashboardSummaryProps) {
  const activeSubscriptions = subscriptions.filter(sub => sub.is_active !== false);

  const monthlyTotal = activeSubscriptions
    .filter((sub) => sub.billing_cycle === "monthly")
    .reduce((acc, sub) => acc + Number(sub.price), 0);

  const yearlyFromYearly = activeSubscriptions
    .filter((sub) => sub.billing_cycle === "yearly")
    .reduce((acc, sub) => acc + Number(sub.price), 0);
    
  const totalYearlyCost = yearlyFromYearly + (monthlyTotal * 12);

  const dueThisWeekCount = activeSubscriptions.filter(sub => {
    try {
      const dueDate = parseISO(sub.next_due_date);
      const daysUntilDue = differenceInDays(dueDate, new Date());
      return daysUntilDue >= 0 && daysUntilDue <= 7;
    } catch (e) {
      return false;
    }
  }).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Monthly Cost" 
        value={`$${monthlyTotal.toFixed(2)}`} 
        icon={Calendar} 
        iconBgClass="bg-blue-500"
      />
      <StatCard 
        title="Yearly Cost" 
        value={`$${totalYearlyCost.toFixed(2)}`} 
        icon={TrendingUp} 
        iconBgClass="bg-green-500"
      />
      <StatCard 
        title="Active Subscriptions" 
        value={activeSubscriptions.length} 
        icon={CreditCard} 
        iconBgClass="bg-yellow-500"
      />
      <StatCard 
        title="Due This Week" 
        value={dueThisWeekCount} 
        icon={Bell} 
        iconBgClass="bg-red-500"
      />
    </div>
  );
}