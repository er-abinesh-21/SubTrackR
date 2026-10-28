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
  /** `yyyy-MM-dd` of the most recent payment the user marked as paid. */
  last_paid_at?: string | null;
  /** Logo id from lib/brands, or "none". Undefined means: match the name. */
  brand?: string | null;
  created_at: string;
};