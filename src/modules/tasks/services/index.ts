// src/modules/tasks/services/index.ts
import { TasksService, RealTasksService } from "./tasks.service";

export const tasksService: TasksService = new RealTasksService();

export * from "./tasks.service";
