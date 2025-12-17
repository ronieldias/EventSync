import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { UserEntity } from "./UserEntity";
import { EventEntity } from "./EventEntity";

@Entity("notifications")
export class NotificationEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id" })
  userId: string;

  @Column({ name: "event_id", nullable: true })
  eventId: string | null;

  @Column({ length: 200 })
  title: string;

  @Column({ type: "text" })
  message: string;

  @Column({ type: "varchar", length: 50, default: "general" })
  type: "general" | "event_message" | "removal" | "event_update";

  @Column({ name: "is_read", default: false })
  isRead: boolean;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @ManyToOne(() => EventEntity, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "event_id" })
  event: EventEntity;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
