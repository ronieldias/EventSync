import "reflect-metadata";
import "express-async-errors";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { router } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { swaggerSpec } from "./swagger";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);
app.use(errorHandler);

export { app };
