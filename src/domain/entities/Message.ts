import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  remetente_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "remetente_id" })
  remetente: User;

  @Column()
  destinatario_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "destinatario_id" })
  destinatario: User;

  @Column("text")
  conteudo: string;

  @CreateDateColumn()
  data_envio: Date;
}