import { useAuth } from "@/integrations/firebase/auth";
import {
  fetchSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
} from "@/integrations/firebase/subscriptions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Subscription } from "@/types";
import { SubscriptionList } from "@/components/SubscriptionList";
import { SubscriptionForm, SubscriptionFormValues } from "@/components/SubscriptionForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";
import { Plus } from "lucide-react";
import { DashboardSummary } from "@/components/DashboardSummary";
import { CategoryChart } from "@/components/CategoryChart";
import { UpcomingRenewals } from "@/components/UpcomingRenewals";
import { RenewalRuler } from "@/components/RenewalRuler";
import { BrandLoader } from "@/components/Logo";
import { isActive, markPaidUpdate, parseDueDate, toDueDateString } from "@/lib/subscriptions";
import { format } from "date-fns";

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Unknown error");

// Firestore reports a query that needs an index which is still building as "failed-precondition".
const isIndexBuilding = (error: unknown) =>
  typeof error === "object" && error !== null && (error as { code?: string }).code === "failed-precondition";

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const queryKey = ["subscriptions", user?.uid];

  const {
    data: subscriptions = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchSubscriptions(user!.uid),
    enabled: !!user,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey });

  const saveMutation = useMutation({
    mutationFn: async (formData: SubscriptionFormValues) => {
      const subscriptionData = {
        name: formData.name,
        price: formData.price,
        currency: formData.currency,
        category: formData.category?.trim() || null,
        brand: formData.brand,
        billing_cycle: formData.billing_cycle,
        user_id: user!.uid,
        next_due_date: toDueDateString(formData.next_due_date),
      };

      if (editingSubscription) {
        await updateSubscription(editingSubscription.id, subscriptionData);
      } else {
        await addSubscription(subscriptionData as Omit<Subscription, "id" | "created_at">);
      }
    },
    onSuccess: () => {
      showSuccess(`Subscription successfully ${editingSubscription ? "updated" : "added"}!`);
      setIsFormOpen(false);
      refresh();
    },
    onError: (err) => showError(`Failed to save subscription: ${errorMessage(err)}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubscription(id),
    onSuccess: () => {
      showSuccess("Subscription deleted.");
      refresh();
    },
    onError: (err) => showError(`Failed to delete subscription: ${errorMessage(err)}`),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (subscription: Subscription) =>
      updateSubscription(subscription.id, { is_active: !isActive(subscription) }),
    onSuccess: (_data, subscription) => {
      showSuccess(isActive(subscription) ? "Subscription paused." : "Subscription resumed.");
      refresh();
    },
    onError: (err) => showError(`Failed to update subscription: ${errorMessage(err)}`),
  });

  const markPaidMutation = useMutation({
    mutationFn: (subscription: Subscription) => updateSubscription(subscription.id, markPaidUpdate(subscription)),
    onSuccess: (_data, subscription) => {
      const update = markPaidUpdate(subscription);
      const nextDue = parseDueDate(update.next_due_date);
      const recurring = subscription.billing_cycle !== "one-time";
      showSuccess(
        recurring && nextDue
          ? `${subscription.name} marked as paid. Next charge ${format(nextDue, "MMM d")}.`
          : `${subscription.name} marked as paid.`,
        {
          action: {
            label: "Undo",
            onClick: () => {
              updateSubscription(subscription.id, {
                next_due_date: subscription.next_due_date,
                last_paid_at: subscription.last_paid_at ?? null,
              })
                .then(refresh)
                .catch((err) => showError(`Failed to undo: ${errorMessage(err)}`));
            },
          },
        }
      );
      refresh();
    },
    onError: (err) => showError(`Failed to mark as paid: ${errorMessage(err)}`),
  });

  const handleOpenForm = (subscription: Subscription | null = null) => {
    setEditingSubscription(subscription);
    setIsFormOpen(true);
  };

  if (isPending) {
    return <BrandLoader label="Loading your subscriptions" />;
  }

  if (isError) {
    return (
      <div role="alert" className="mx-auto flex max-w-lg flex-col items-center py-24 text-center">
        <h2 className="text-2xl font-medium">We couldn't load your subscriptions</h2>
        <p className="mt-3 text-muted-foreground">
          {isIndexBuilding(error)
            ? "Your database is still getting ready. This usually takes a couple of minutes, so try again shortly."
            : errorMessage(error)}
        </p>
        <Button onClick={() => refetch()} size="lg" className="mt-7">Try again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 md:space-y-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-medium text-muted-foreground">Dashboard</h1>
        <Button onClick={() => handleOpenForm()}>
          <Plus /> Add subscription
        </Button>
      </div>

      <DashboardSummary subscriptions={subscriptions} />

      <RenewalRuler subscriptions={subscriptions} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CategoryChart subscriptions={subscriptions} />
        </div>
        <div className="lg:col-span-2">
          <UpcomingRenewals
            subscriptions={subscriptions}
            onMarkPaid={(subscription) => markPaidMutation.mutate(subscription)}
          />
        </div>
      </div>

      <SubscriptionList
        subscriptions={subscriptions}
        onEdit={handleOpenForm}
        onDelete={(id) => deleteMutation.mutate(id)}
        onToggleActive={(subscription) => toggleActiveMutation.mutate(subscription)}
        onMarkPaid={(subscription) => markPaidMutation.mutate(subscription)}
        onAdd={() => handleOpenForm()}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-medium">{editingSubscription ? "Edit" : "Add"} subscription</DialogTitle>
            <DialogDescription>
              {editingSubscription ? "Update the details of your subscription." : "Enter the details of your new subscription."}
            </DialogDescription>
          </DialogHeader>
          <SubscriptionForm
            subscription={editingSubscription}
            onSave={(data) => saveMutation.mutate(data)}
            isSaving={saveMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
