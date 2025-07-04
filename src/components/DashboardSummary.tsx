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
  iconColor: string;
}

const StatCard = ({ title, value, icon: Icon, iconColor }: StatCardProps) => (
  <Card className="bg-card/50 backdrop-blur-lg border-primary/10">
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={`p-3 rounded-md ${iconColor}`}>
        <Icon className="h-5 w-5 text-background" />
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
          iconColor="bg-neon-cyan shadow-lg shadow-neon-cyan/30"
        />
        <StatCard 
          title="Yearly Cost" 
          value={formatCurrency(totalYearlyCost, primaryCurrency)} 
          icon={TrendingUp} 
          iconColor="bg-neon-green shadow-lg shadow-neon-green/30"
        />
        <StatCard 
          title="Active Subscriptions" 
          value={activeSubscriptions.length} 
          icon={CreditCard} 
          iconColor="bg-neon-magenta shadow-lg shadow-neon-magenta/30"
        />
        <StatCard 
          title="Due This Week" 
          value={dueThisWeekCount} 
          icon={Bell} 
          iconColor="bg-neon-yellow shadow-lg shadow-neon-yellow/30"
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