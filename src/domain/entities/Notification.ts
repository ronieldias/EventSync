export type NotificationType = "general" | "event_message" | "removal" | "event_update";

export interface Notification {
  id: string;
  userId: string;
  eventId: string | null;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  eventId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
}
