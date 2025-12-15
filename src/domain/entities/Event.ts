import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { Registration } from "./Registration";

export enum EventStatus {
  RASCUNHO = "rascunho",
  PUBLICADO = "publicado",
  ENCERRADO = "encerrado",
  CANCELADO = "cancelado",
}

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  titulo: string;

  @Column("text")
  descricao: string;

  @Column()
  local: string;

  @Column({ nullable: true })
  categoria: string; 

  @Column()
  data_inicio: Date;

  @Column()
  data_fim: Date;

  @Column({
    type: "enum",
    enum: EventStatus,
    default: EventStatus.RASCUNHO,
  })
  status: EventStatus;

  @Column()
  carga_horaria: number; // Em horas

  @Column()
  organizador_id: string;

  @Column({ type: "int", default: 0 }) // 0 = sem limite
  max_inscricoes: number;

  @Column({ type: "int", default: 1 })
  n_checkins_permitidos: number;

  @Column({ nullable: true })
  banner_url: string;

  @Column({ default: false })
  inscricao_aberta: boolean; // Controle manual do organizador

  @ManyToOne(() => User, (user) => user.eventos_organizados)
  @JoinColumn({ name: "organizador_id" })
  organizador: User;

  @OneToMany(() => Registration, (registration) => registration.evento)
  inscricoes: Registration[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}