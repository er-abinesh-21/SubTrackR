/**
 * In-memory stand-in for src/integrations/firebase/subscriptions.ts, used only by
 * `npm run dev:demo`. Dates are relative to today so the dashboard always has
 * something due soon. Changes last until the page is reloaded.
 */
import { addDays, format } from "date-fns";
import { Subscription } from "@/types";

const due = (days: number) => format(addDays(new Date(), days), "yyyy-MM-dd");

let store: Subscription[] = [
  { id: "d1", name: "Netflix", price: 649, currency: "INR", category: "Entertainment", billing_cycle: "monthly", next_due_date: due(2) },
  { id: "d2", name: "Spotify", price: 119, currency: "INR", category: "Entertainment", billing_cycle: "monthly", next_due_date: due(5) },
  { id: "d3", name: "iCloud+", price: 75, currency: "INR", category: "Cloud Storage", billing_cycle: "monthly", next_due_date: due(5) },
  { id: "d4", name: "Figma", price: 1250, currency: "INR", category: "Productivity", billing_cycle: "monthly", next_due_date: due(9) },
  { id: "d5", name: "YouTube Premium", price: 129, currency: "INR", category: "Entertainment", billing_cycle: "monthly", next_due_date: due(12) },
  { id: "d6", name: "Notion", price: 8000, currency: "INR", category: "Productivity", billing_cycle: "yearly", next_due_date: due(17) },
  { id: "d7", name: "Adobe Creative Cloud", price: 1675, currency: "INR", category: "Productivity", billing_cycle: "monthly", next_due_date: due(19) },
  { id: "d8", name: "Xbox Game Pass", price: 549, currency: "INR", category: "Gaming", billing_cycle: "monthly", next_due_date: due(24) },
  { id: "d9", name: "The New York Times", price: 399, currency: "INR", category: "News", billing_cycle: "monthly", next_due_date: due(27) },
  { id: "d10", name: "Dropbox", price: 9999, currency: "INR", category: "Cloud Storage", billing_cycle: "yearly", next_due_date: due(140) },
  { id: "d11", name: "Gym membership", price: 1500, currency: "INR", category: "Health", billing_cycle: "monthly", next_due_date: due(8), is_active: false },
  { id: "d12", name: "Spotify Family (EU)", price: 14.99, currency: "USD", category: "Entertainment", billing_cycle: "monthly", next_due_date: due(14) },
].map((s) => ({ user_id: "demo-user", is_active: true, created_at: new Date().toISOString(), ...s })) as Subscription[];

let counter = 100;
const delay = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 250));

export async function fetchSubscriptions(_userId: string): Promise<Subscription[]> {
  return delay([...store].sort((a, b) => a.next_due_date.localeCompare(b.next_due_date)));
}

export async function addSubscription(data: Omit<Subscription, "id" | "created_at">): Promise<string> {
  const id = `demo-${++counter}`;
  store = [...store, { ...data, id, is_active: true, created_at: new Date().toISOString() }];
  return delay(id);
}

export async function updateSubscription(
  id: string,
  data: Partial<Omit<Subscription, "id" | "created_at">>
): Promise<void> {
  store = store.map((s) => (s.id === id ? { ...s, ...data } : s));
  return delay(undefined);
}

export async function deleteSubscription(id: string): Promise<void> {
  store = store.filter((s) => s.id !== id);
  return delay(undefined);
}
