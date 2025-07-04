import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Subscription } from "@/types";
import { Bell } from "lucide-react";
import { format, parseISO } from "date-fns";
import { SubscriptionIcon } from "./SubscriptionIcon";

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

interface UpcomingRenewalsProps {
  subscriptions: Subscription[];
}

export function UpcomingRenewals({ subscriptions }: UpcomingRenewalsProps) {
  const upcoming = subscriptions
    .filter(sub => {
      try {
        const dueDate = parseISO(sub.next_due_date);
        return dueDate >= new Date();
      } catch (e) {
        return false;
      }
    })
    .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime())
    .slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upcoming Renewals</CardTitle>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10">
            <Bell className="h-12 w-12 mb-4 text-gray-300" />
            <p>No upcoming renewals</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {upcoming.map(sub => (
              <li key={sub.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SubscriptionIcon name={sub.name} />
                  <div>
                    <p className="font-semibold">{sub.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(sub.next_due_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">{formatCurrency(sub.price, sub.currency)}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}