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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header className="flex flex-wrap gap-4 justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Subscription
          </Button>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <main className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DashboardSummary subscriptions={subscriptions} />
              </div>
              <CategoryChart subscriptions={subscriptions} />
            </div>
            <SubscriptionList
              subscriptions={subscriptions}
              onEdit={handleOpenForm}
              onDelete={handleDeleteSubscription}
            />
          </>
        )}
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