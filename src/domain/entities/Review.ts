import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Event } from "./Event";

@Entity("reviews")
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  evento_id: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: "evento_id" })
  evento: Event;

  @Column()
  usuario_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "usuario_id" })
  usuario: User;

  @Column({ type: "int" })
  nota: number; // 1 a 5

  @Column("text")
  comentario: string;

  @CreateDateColumn()
  data: Date;
}