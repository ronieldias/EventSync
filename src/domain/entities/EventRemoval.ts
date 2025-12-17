export interface EventRemoval {
  id: string;
  userId: string;
  eventId: string;
  reason: string;
  removedAt: Date;
}

export interface CreateEventRemovalInput {
  userId: string;
  eventId: string;
  reason: string;
}
