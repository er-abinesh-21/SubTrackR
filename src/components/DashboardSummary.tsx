import { Card, CardContent } from "@/components/ui/card";
import { Subscription } from "@/types";
import { Calendar, TrendingUp, CreditCard, Bell } from "lucide-react";
import { differenceInDays, parseISO } from 'date-fns';

interface DashboardSummaryProps {
  subscriptions: Subscription[];
}

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  } catch (e) {
    return `${(currency || 'USD').toUpperCase()} ${amount.toFixed(2)}`;
  }
};

const getMostCommonCurrency = (subs: Subscription[]): string => {
    if (subs.length === 0) return 'USD';
    const counts: { [key: string]: number } = {};
    subs.forEach(s => {
        const currency = s.currency || 'USD';
        counts[currency] = (counts[currency] || 0) + 1;
    });
    if (Object.keys(counts).length === 0) return 'USD';
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
}

const StatCard = ({ title, value, icon: Icon }: StatCardProps) => (
  <Card>
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-neon">{value}</p>
      </div>
      <div className="p-3 rounded-md bg-secondary">
        <Icon className="h-5 w-5 text-secondary-foreground" />
      </div>
    </CardContent>
  </Card>
);

export function DashboardSummary({ subscriptions }: DashboardSummaryProps) {
  const activeSubscriptions = subscriptions.filter(sub => sub.is_active !== false);
  const allCurrencies = new Set(activeSubscriptions.map(s => s.currency || 'USD'));
  const primaryCurrency = getMostCommonCurrency(activeSubscriptions);

  const subscriptionsInPrimaryCurrency = activeSubscriptions.filter(s => (s.currency || 'USD') === primaryCurrency);

  const monthlyTotal = subscriptionsInPrimaryCurrency
    .filter((sub) => sub.billing_cycle === "monthly")
    .reduce((acc, sub) => acc + Number(sub.price), 0);

  const yearlyFromYearly = subscriptionsInPrimaryCurrency
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
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Monthly Cost" 
          value={formatCurrency(monthlyTotal, primaryCurrency)} 
          icon={Calendar} 
        />
        <StatCard 
          title="Yearly Cost" 
          value={formatCurrency(totalYearlyCost, primaryCurrency)} 
          icon={TrendingUp} 
        />
        <StatCard 
          title="Active Subscriptions" 
          value={activeSubscriptions.length} 
          icon={CreditCard} 
        />
        <StatCard 
          title="Due This Week" 
          value={dueThisWeekCount} 
          icon={Bell} 
        />
      </div>
      {allCurrencies.size > 1 && (
        <p className="text-xs text-muted-foreground text-center mt-2">
            Note: Cost summaries are calculated for your primary currency ({primaryCurrency}).
        </p>
      )}
    </div>
  );
}