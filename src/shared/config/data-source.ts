import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "eventsync_db",
  synchronize: true, // Apenas para dev inicial. Em prod, usamos false + migrations
  logging: false,
  entities: ["src/domain/entities/*.ts"], 
  migrations: ["src/persistence/migrations/*.ts"],
  subscribers: [],
});