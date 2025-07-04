export type Subscription = {
  id: string;
  user_id: string;
  name: string;
  price: number;
  currency: string;
  category: string | null;
  billing_cycle: string;
  next_due_date: string;
  is_active: boolean;
  created_at: string;
};