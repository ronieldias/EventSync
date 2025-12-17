import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { UserEntity } from "./UserEntity";
import { SubscriptionEntity } from "./SubscriptionEntity";

export type EventStatus = "draft" | "published" | "in_progress" | "finished" | "cancelled";
export type EventCategory = "palestra" | "seminario" | "mesa_redonda" | "oficina" | "workshop" | "conferencia" | "outro" | "sem_categoria";

@Entity("events")
export class EventEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column("text")
  description: string;

  @Column({ type: "varchar", length: 50, default: "sem_categoria" })
  category: EventCategory;

  @Column({ type: "varchar", length: 500, nullable: true })
  banner: string | null;

  @Column({ type: "timestamp" })
  date: Date;

  @Column({ type: "timestamp", name: "end_date", nullable: true })
  endDate: Date | null;

  @Column({ length: 300 })
  location: string;

  @Column({ type: "int", default: 0 })
  workload: number;

  @Column({ type: "int" })
  capacity: number;

  @Column({ type: "varchar", length: 20, default: "draft" })
  status: EventStatus;

  @Column({ type: "boolean", name: "subscriptions_open", default: false })
  subscriptionsOpen: boolean;

  @Column({ name: "organizer_id" })
  organizerId: string;

  @ManyToOne(() => UserEntity, (user) => user.organizedEvents)
  @JoinColumn({ name: "organizer_id" })
  organizer: UserEntity;

  @OneToMany(() => SubscriptionEntity, (subscription) => subscription.event)
  subscriptions: SubscriptionEntity[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
