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

@Entity("event_removals")
@Unique(["userId", "eventId"])
export class EventRemovalEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id" })
  userId: string;

  @Column({ name: "event_id" })
  eventId: string;

  @Column({ type: "text" })
  reason: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @ManyToOne(() => EventEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "event_id" })
  event: EventEntity;

  @CreateDateColumn({ name: "removed_at" })
  removedAt: Date;
}
