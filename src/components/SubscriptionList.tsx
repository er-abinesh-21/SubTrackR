import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Edit, CreditCard, Search } from "lucide-react";
import { Subscription } from "@/types";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
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

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function SubscriptionList({ subscriptions, onEdit, onDelete, onAdd }: SubscriptionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    const allCategories = new Set(subscriptions.map(s => s.category).filter(Boolean) as string[]);
    return ["all", ...Array.from(allCategories)];
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const nameMatch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = categoryFilter === "all" || sub.category === categoryFilter;
      return nameMatch && categoryMatch;
    });
  }, [subscriptions, searchTerm, categoryFilter]);

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-16 flex flex-col items-center">
          <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No subscriptions yet</h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
            Start tracking your subscriptions to get insights into your spending.
          </p>
          <Button onClick={onAdd}>Add Your First Subscription</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <CardTitle>All Subscriptions</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search subscriptions..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Next Due Date</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <SubscriptionIcon name={sub.name} />
                    </TableCell>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell>{sub.category || "N/A"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sub.price, sub.currency)}</TableCell>
                    <TableCell className="capitalize">{sub.billing_cycle.replace('_', '-')}</TableCell>
                    <TableCell>{format(new Date(sub.next_due_date), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(sub)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(sub.id)} className="text-red-500 focus:text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}