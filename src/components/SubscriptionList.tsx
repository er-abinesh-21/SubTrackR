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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Pencil, Search, PauseCircle, PlayCircle, Plus, CheckCircle2 } from "lucide-react";
import { Subscription } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { SubscriptionIcon } from "./SubscriptionIcon";
import { LogoMark } from "./Logo";
import { formatCurrency, isActive, isPaidOneTime, parseDueDate, getNextDueDate, daysUntil, describeDays } from "@/lib/subscriptions";
import { cn } from "@/lib/utils";

const CYCLE_LABELS: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  "one-time": "One-time",
};

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleActive: (subscription: Subscription) => void;
  onMarkPaid: (subscription: Subscription) => void;
  onAdd: () => void;
}

export function SubscriptionList({ subscriptions, onEdit, onDelete, onToggleActive, onMarkPaid, onAdd }: SubscriptionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<Subscription | null>(null);

  const categories = useMemo(() => {
    const allCategories = new Set(subscriptions.map(s => s.category).filter(Boolean) as string[]);
    return ["all", ...Array.from(allCategories)];
  }, [subscriptions]);

  // The selected category can disappear (e.g. its last subscription was deleted).
  const activeCategoryFilter = categories.includes(categoryFilter) ? categoryFilter : "all";

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const nameMatch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = activeCategoryFilter === "all" || sub.category === activeCategoryFilter;
      return nameMatch && categoryMatch;
    });
  }, [subscriptions, searchTerm, activeCategoryFilter]);

  if (subscriptions.length === 0) {
    return (
      <section aria-labelledby="list-title" className="panel flex flex-col items-center px-6 py-16 text-center">
        <LogoMark className="h-14 w-14 opacity-90" />
        <h2 id="list-title" className="mt-6 text-2xl font-medium">
          No subscriptions yet
        </h2>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Add the first one and SubTrackR will total your monthly spend and show when each charge lands.
        </p>
        <Button onClick={onAdd} size="lg" className="mt-7">
          <Plus /> Add your first subscription
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="list-title">
      <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="list-title" className="text-2xl font-medium">
            All Subscriptions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground tnum">
            {subscriptions.length} tracked, {subscriptions.filter(isActive).length} active
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label="Search subscriptions"
              placeholder="Search subscriptions"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={activeCategoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger aria-label="Filter by category" className="h-11 w-full rounded-[10px] bg-background/60 sm:w-[190px]">
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

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-11 pl-0">Subscription</TableHead>
            <TableHead className="hidden h-11 md:table-cell">Billing</TableHead>
            <TableHead className="hidden h-11 sm:table-cell">Next charge</TableHead>
            <TableHead className="h-11 text-right">Price</TableHead>
            <TableHead className="h-11 w-12 px-0 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubscriptions.length > 0 ? (
            filteredSubscriptions.map((sub) => {
              const active = isActive(sub);
              const next = getNextDueDate(sub);
              const stored = parseDueDate(sub.next_due_date);
              const shown = next ?? stored;
              return (
                <TableRow
                  key={sub.id}
                  className="group border-border transition-colors duration-200 hover:bg-accent/40"
                >
                  <TableCell className="w-full max-w-0 py-4 pl-0">
                    <div className={cn("flex items-center gap-3.5 transition-opacity duration-300", !active && "opacity-55")}>
                      <SubscriptionIcon name={sub.name} brand={sub.brand} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-medium leading-tight">
                          <span className="truncate">{sub.name}</span>
                          {!active && <Badge variant="secondary" className="rounded-md font-normal">Paused</Badge>}
                          {isPaidOneTime(sub) && <Badge variant="secondary" className="rounded-md font-normal">Paid</Badge>}
                        </div>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">{sub.category || "N/A"}</p>
                        {shown && (
                          <p className="mt-0.5 text-sm text-muted-foreground tnum sm:hidden">
                            {format(shown, "MMM dd")}
                            {active && next && (
                              <span className={cn("ml-1.5", daysUntil(next) <= 3 && "text-destructive")}>
                                {describeDays(daysUntil(next))}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={cn("hidden md:table-cell", !active && "opacity-55")}>
                    {CYCLE_LABELS[sub.billing_cycle] ?? sub.billing_cycle}
                  </TableCell>
                  <TableCell className={cn("hidden whitespace-nowrap tnum transition-opacity duration-300 sm:table-cell", !active && "opacity-55")}>
                    {shown ? format(shown, "MMM dd, yyyy") : "N/A"}
                    {active && next && (
                      <span className={cn("block text-sm", daysUntil(next) <= 3 ? "text-destructive" : "text-muted-foreground")}>
                        {describeDays(daysUntil(next))}
                      </span>
                    )}
                    {sub.last_paid_at && parseDueDate(sub.last_paid_at) && (
                      <span className="block text-sm text-muted-foreground">
                        Paid {format(parseDueDate(sub.last_paid_at) as Date, "MMM dd")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className={cn("whitespace-nowrap text-right font-medium tnum", !active && "opacity-55")}>
                    {formatCurrency(sub.price, sub.currency)}
                  </TableCell>
                  <TableCell className="w-12 px-0 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5">
                        {active && !isPaidOneTime(sub) && (
                          <DropdownMenuItem onClick={() => onMarkPaid(sub)} className="rounded-lg">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            <span>Mark as paid</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onEdit(sub)} className="rounded-lg">
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleActive(sub)} className="rounded-lg">
                          {active ? <PauseCircle className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                          <span>{active ? "Pause" : "Resume"}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setPendingDelete(sub)}
                          className="rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                No results found. Try a different name or category.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the subscription. If you only want to stop counting it, pause it instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) onDelete(pendingDelete.id);
                setPendingDelete(null);
              }}
              className="bg-destructive text-destructive-foreground shadow-none hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
