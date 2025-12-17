export interface Subscription {
  id: string;
  userId: string;
  eventId: string;
  subscribedAt: Date;
}

export type CreateSubscriptionInput = Omit<Subscription, "id" | "subscribedAt">;
