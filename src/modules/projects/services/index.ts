// src/modules/projects/services/index.ts
import { ProjectsService, RealProjectsService } from "./projects.service";
import { fakeProjectsService } from "./fake-projects.service";

// Strict Fake/Real API toggling based on environment variable
const USE_FAKE_API = process.env.NEXT_PUBLIC_USE_FAKE_API !== "false";

export const projectsService: ProjectsService = USE_FAKE_API
  ? fakeProjectsService
  : new RealProjectsService();

export * from "./projects.service";
export * from "./fake-projects.service";
