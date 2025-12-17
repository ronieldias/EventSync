import "dotenv/config";
import { app } from "./app";
import { AppDataSource } from "../database/data-source";
import { getEventScheduler } from "../services/EventSchedulerService";

const PORT = process.env.PORT || 3333;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");

    // Start the event scheduler (checks every minute)
    const scheduler = getEventScheduler();
    scheduler.start(60000);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
    process.exit(1);
  });
