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
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import { Subscription } from "@/types";
import { format } from "date-fns";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

export function SubscriptionList({ subscriptions, onEdit, onDelete }: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold">No subscriptions yet!</h3>
        <p className="text-muted-foreground mt-2">Click "Add Subscription" to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Billing Cycle</TableHead>
            <TableHead>Next Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell className="font-medium">{sub.name}</TableCell>
              <TableCell>{sub.category || "N/A"}</TableCell>
              <TableCell className="text-right">${sub.price.toFixed(2)}</TableCell>
              <TableCell className="capitalize">{sub.billing_cycle}</TableCell>
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
                    <DropdownMenuItem onClick={() => onDelete(sub.id)} className="text-red-500">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}