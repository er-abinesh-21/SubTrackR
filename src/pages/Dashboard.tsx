import { useAuth } from "@/integrations/firebase/auth";
import {
  fetchSubscriptions as fetchSubscriptionsFromDb,
  addSubscription,
  updateSubscription,
  deleteSubscription as deleteSubscriptionFromDb,
} from "@/integrations/firebase/subscriptions";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
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
import { Loader2, PlusCircle } from "lucide-react";
import { formatISO } from "date-fns";
import { DashboardSummary } from "@/components/DashboardSummary";
import { CategoryChart } from "@/components/CategoryChart";
import { UpcomingRenewals } from "@/components/UpcomingRenewals";

const Dashboard = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const loadSubscriptions = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await fetchSubscriptionsFromDb(user.uid);
      setSubscriptions(data);
    } catch (error) {
      showError("Failed to fetch subscriptions.");
      console.error(error);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSubscriptions();
    }
  }, [user, loadSubscriptions]);

  const handleOpenForm = (subscription: Subscription | null = null) => {
    setEditingSubscription(subscription);
    setIsFormOpen(true);
  };

  const handleSaveSubscription = async (formData: SubscriptionFormValues) => {
    if (!user) return;
    setIsSaving(true);

    const subscriptionData = {
      ...formData,
      user_id: user.uid,
      next_due_date: formatISO(formData.next_due_date),
      price: formData.price,
    };

    try {
      if (editingSubscription) {
        await updateSubscription(editingSubscription.id, subscriptionData);
      } else {
        await addSubscription(subscriptionData as Omit<Subscription, "id" | "created_at">);
      }
      showSuccess(`Subscription successfully ${editingSubscription ? "updated" : "added"}!`);
      setIsFormOpen(false);
      loadSubscriptions();
    } catch (error) {
      const err = error as Error;
      showError(`Failed to save subscription: ${err.message}`);
    }
    setIsSaving(false);
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      await deleteSubscriptionFromDb(id);
      showSuccess("Subscription deleted.");
      loadSubscriptions();
    } catch (error) {
      const err = error as Error;
      showError(`Failed to delete subscription: ${err.message}`);
    }
  };

  if (isLoading && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 200px)'}}>
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neon">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your subscriptions and manage your spending.
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="btn-neon">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Subscription
        </Button>
      </div>

      <main className="space-y-6">
        <DashboardSummary subscriptions={subscriptions} />

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CategoryChart subscriptions={subscriptions} />
          </div>
          <div className="lg:col-span-2">
            <UpcomingRenewals subscriptions={subscriptions} />
          </div>
        </div>

        <SubscriptionList
          subscriptions={subscriptions}
          onEdit={handleOpenForm}
          onDelete={handleDeleteSubscription}
          onAdd={() => handleOpenForm()}
        />
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="text-neon">{editingSubscription ? "Edit" : "Add"} Subscription</DialogTitle>
            <DialogDescription>
              {editingSubscription ? "Update the details of your subscription." : "Enter the details of your new subscription."}
            </DialogDescription>
          </DialogHeader>
          <SubscriptionForm
            subscription={editingSubscription}
            onSave={handleSaveSubscription}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;