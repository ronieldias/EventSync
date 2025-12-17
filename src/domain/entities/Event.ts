export type EventStatus = "draft" | "published" | "in_progress" | "finished" | "cancelled";
export type EventCategory = "palestra" | "seminario" | "mesa_redonda" | "oficina" | "workshop" | "conferencia" | "outro" | "sem_categoria";

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  banner?: string;
  date: Date;
  endDate?: Date;
  location: string;
  workload: number; // carga horária em horas
  capacity: number;
  status: EventStatus;
  subscriptionsOpen: boolean;
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateEventInput = Omit<Event, "id" | "status" | "subscriptionsOpen" | "createdAt" | "updatedAt">;
export type UpdateEventInput = Partial<Omit<Event, "id" | "organizerId" | "createdAt" | "updatedAt">>;
