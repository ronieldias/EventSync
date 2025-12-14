import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Event } from "./Event";
import { Registration } from "./Registration";

export enum UserRole {
  USER = "user",
  ORGANIZER = "organizer",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // A senha não vem nas consultas por padrão
  senha_hash: string;

  @Column()
  cidade: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  foto_url: string;

  @Column({ type: "text", nullable: true })
  bio: string;

  @Column({ default: true })
  visibilidade_participacao: boolean; // Se false, não aparece na lista de participantes

  @OneToMany(() => Event, (event) => event.organizador)
  eventos_organizados: Event[];

  @OneToMany(() => Registration, (registration) => registration.usuario)
  inscricoes: Registration[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}