// src/modules/tasks/services/index.ts
import { TasksService, RealTasksService } from "./tasks.service";
import { fakeTasksService } from "./fake-tasks.service";

// Toggle between fake and real service based on env flag
const USE_FAKE_API = process.env.NEXT_PUBLIC_USE_FAKE_API !== "false";

export const tasksService: TasksService = USE_FAKE_API
  ? fakeTasksService
  : new RealTasksService();

export * from "./tasks.service";
export * from "./fake-tasks.service";
