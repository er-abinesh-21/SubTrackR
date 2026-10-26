import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { Subscription } from "@/types";

const SUBSCRIPTIONS_COLLECTION = "subscriptions";

/**
 * Fetch all subscriptions for a given user, ordered by next_due_date ascending.
 */
export async function fetchSubscriptions(userId: string): Promise<Subscription[]> {
  const q = query(
    collection(db, SUBSCRIPTIONS_COLLECTION),
    where("user_id", "==", userId),
    orderBy("next_due_date", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      // Firestore stores a Timestamp; the app type is an ISO string.
      created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
    };
  }) as Subscription[];
}

/**
 * Add a new subscription document.
 */
export async function addSubscription(
  data: Omit<Subscription, "id" | "created_at">
): Promise<string> {
  const docRef = await addDoc(collection(db, SUBSCRIPTIONS_COLLECTION), {
    ...data,
    is_active: true,
    created_at: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Update an existing subscription document by its ID.
 */
export async function updateSubscription(
  id: string,
  data: Partial<Omit<Subscription, "id" | "created_at">>
): Promise<void> {
  const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, id);
  await updateDoc(docRef, data);
}

/**
 * Delete a subscription document by its ID.
 */
export async function deleteSubscription(id: string): Promise<void> {
  const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, id);
  await deleteDoc(docRef);
}
