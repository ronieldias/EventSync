import { EventRepository } from "../database/repositories/EventRepository";
import { NotificationRepository } from "../database/repositories/NotificationRepository";
import { SubscriptionRepository } from "../database/repositories/SubscriptionRepository";

export class EventSchedulerService {
  private eventRepository: EventRepository;
  private notificationRepository: NotificationRepository;
  private subscriptionRepository: SubscriptionRepository;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.eventRepository = new EventRepository();
    this.notificationRepository = new NotificationRepository();
    this.subscriptionRepository = new SubscriptionRepository();
  }

  start(intervalMs: number = 60000) {
    console.log("[EventScheduler] Starting event scheduler...");

    // Run immediately on start
    this.checkAndUpdateEvents();

    // Then run at intervals
    this.intervalId = setInterval(() => {
      this.checkAndUpdateEvents();
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("[EventScheduler] Stopped event scheduler");
    }
  }

  async checkAndUpdateEvents() {
    const now = new Date();

    try {
      // Get all published events that should start
      const publishedEvents = await this.eventRepository.findByStatus("published");

      for (const event of publishedEvents) {
        const eventDate = new Date(event.date);

        if (eventDate <= now) {
          console.log(`[EventScheduler] Auto-starting event: ${event.title}`);
          await this.eventRepository.update(event.id, { status: "in_progress" });

          // Notify subscribers
          await this.notifySubscribers(
            event.id,
            `O evento "${event.title}" começou!`,
            "O evento está agora em andamento. Aproveite!",
            "event_update"
          );
        }
      }

      // Get all in_progress events that should finish
      const inProgressEvents = await this.eventRepository.findByStatus("in_progress");

      for (const event of inProgressEvents) {
        if (event.endDate) {
          const endDate = new Date(event.endDate);

          if (endDate <= now) {
            console.log(`[EventScheduler] Auto-finishing event: ${event.title}`);
            await this.eventRepository.update(event.id, {
              status: "finished",
              subscriptionsOpen: false
            });

            // Notify subscribers
            await this.notifySubscribers(
              event.id,
              `O evento "${event.title}" foi finalizado`,
              "O evento foi concluído. Obrigado pela participação!",
              "event_update"
            );
          }
        }
      }
    } catch (error) {
      console.error("[EventScheduler] Error checking events:", error);
    }
  }

  private async notifySubscribers(
    eventId: string,
    title: string,
    message: string,
    type: "event_update"
  ) {
    try {
      const subscriptions = await this.subscriptionRepository.findByEventId(eventId);

      if (subscriptions.length > 0) {
        const notifications = subscriptions.map((sub) => ({
          userId: sub.userId,
          eventId,
          title,
          message,
          type,
        }));

        await this.notificationRepository.createMany(notifications);
      }
    } catch (error) {
      console.error("[EventScheduler] Error notifying subscribers:", error);
    }
  }
}

// Singleton instance
let schedulerInstance: EventSchedulerService | null = null;

export function getEventScheduler(): EventSchedulerService {
  if (!schedulerInstance) {
    schedulerInstance = new EventSchedulerService();
  }
  return schedulerInstance;
}
