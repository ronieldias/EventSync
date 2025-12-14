import "reflect-metadata";
import express from "express";
import cors from "cors";

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Rota de Health Check (para testar se a API está viva)
app.get("/", (req, res) => {
  res.json({ message: "EventSync API is running" });
});

export { app };