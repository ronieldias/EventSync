import "reflect-metadata";
import express from "express";
import cors from "cors";
import { authRoutes } from "./presentation/routes/auth.routes";
import { eventRoutes } from "./presentation/routes/event.routes";
import { registrationRoutes } from "./presentation/routes/registration.routes";
import { checkinRoutes } from "./presentation/routes/checkin.routes";
import { socialRoutes } from "./presentation/routes/social.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/registrations", registrationRoutes);
app.use("/checkins", checkinRoutes);
app.use("/social", socialRoutes); // Nova rota Social

app.get("/", (req, res) => {
  res.json({ message: "EventSync API is running" });
});

export { app };