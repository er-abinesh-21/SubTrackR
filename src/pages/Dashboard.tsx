import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
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
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .order("next_due_date", { ascending: true });

    if (error) {
      showError("Failed to fetch subscriptions.");
      console.error(error);
    } else {
      setSubscriptions(data as Subscription[]);
    }
    setIsLoading(false);
  };

  const handleOpenForm = (subscription: Subscription | null = null) => {
    setEditingSubscription(subscription);
    setIsFormOpen(true);
  };

  const handleSaveSubscription = async (formData: SubscriptionFormValues) => {
    if (!user) return;
    setIsSaving(true);

    const subscriptionData = {
      ...formData,
      user_id: user.id,
      next_due_date: formatISO(formData.next_due_date),
      price: formData.price
    };

    let error;
    if (editingSubscription) {
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update(subscriptionData)
        .eq("id", editingSubscription.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert(subscriptionData);
      error = insertError;
    }

    if (error) {
      showError(`Failed to save subscription: ${error.message}`);
    } else {
      showSuccess(`Subscription successfully ${editingSubscription ? 'updated' : 'added'}!`);
      setIsFormOpen(false);
      fetchSubscriptions();
    }
    setIsSaving(false);
  };

  const handleDeleteSubscription = async (id: string) => {
    const { error } = await supabase.from("subscriptions").delete().eq("id", id);
    if (error) {
      showError(`Failed to delete subscription: ${error.message}`);
    } else {
      showSuccess("Subscription deleted.");
      fetchSubscriptions();
    }
  };

  if (isLoading && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 200px)'}}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <DialogTitle>{editingSubscription ? "Edit" : "Add"} Subscription</DialogTitle>
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