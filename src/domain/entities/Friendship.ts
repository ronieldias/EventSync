import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

export enum FriendshipStatus {
  PENDENTE = "pendente",
  ACEITO = "aceito",
}

@Entity("friendships")
export class Friendship {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  solicitante_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "solicitante_id" })
  solicitante: User;

  @Column()
  destinatario_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "destinatario_id" })
  destinatario: User;

  @Column({
    type: "enum",
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDENTE,
  })
  status: FriendshipStatus;

  @CreateDateColumn()
  data_solicitacao: Date;

  @UpdateDateColumn()
  updated_at: Date;
}