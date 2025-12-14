import { Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { Registration } from "./Registration";

@Entity("checkins")
export class Checkin {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => Registration)
  @JoinColumn({ name: "inscricao_id" })
  inscricao: Registration;

  @CreateDateColumn()
  data_hora: Date;
}