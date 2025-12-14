import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Registration } from "./Registration";

@Entity("checkins")
export class Checkin {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Mudança de OneToOne para ManyToOne
  @ManyToOne(() => Registration)
  @JoinColumn({ name: "inscricao_id" })
  inscricao: Registration;

  @CreateDateColumn()
  data_hora: Date;
}