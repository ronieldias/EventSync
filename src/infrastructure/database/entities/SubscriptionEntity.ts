import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { UserEntity } from "./UserEntity";
import { EventEntity } from "./EventEntity";

@Entity("subscriptions")
@Unique(["userId", "eventId"])
export class SubscriptionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id" })
  userId: string;

  @Column({ name: "event_id" })
  eventId: string;

  @ManyToOne(() => UserEntity, (user) => user.subscriptions)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @ManyToOne(() => EventEntity, (event) => event.subscriptions)
  @JoinColumn({ name: "event_id" })
  event: EventEntity;

  @CreateDateColumn({ name: "subscribed_at" })
  subscribedAt: Date;
}
