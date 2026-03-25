import { startJobs } from "./scheduler.js";
import { Logger } from "../utils/logger.js";

export const initializeCrons = async () => {
  try {
    const jobs = startJobs();
    Logger.info("Cron jobs initialized", { jobCount: jobs.length });
    return jobs;
  } catch (error) {
    Logger.error("Failed to initialize cron jobs", error);
    return [];
  }
};