import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Event } from "./Event";

export enum RegistrationStatus {
  ATIVO = "ativo",
  REMOVIDO = "removido",
  FINALIZADO = "finalizado", // Ex: Participou do evento
}

@Entity("registrations")
export class Registration {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  usuario_id: string;

  @ManyToOne(() => User, (user) => user.inscricoes)
  @JoinColumn({ name: "usuario_id" })
  usuario: User;

  @Column()
  evento_id: string;

  @ManyToOne(() => Event, (event) => event.inscricoes)
  @JoinColumn({ name: "evento_id" })
  evento: Event;

  @Column({
    type: "enum",
    enum: RegistrationStatus,
    default: RegistrationStatus.ATIVO,
  })
  status: RegistrationStatus;

  @Column("text", { nullable: true })
  justificativa_remocao: string;

  @CreateDateColumn()
  data_inscricao: Date;
}