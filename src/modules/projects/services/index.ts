// src/modules/projects/services/index.ts
import { ProjectsService, RealProjectsService } from "./projects.service";

export const projectsService: ProjectsService = new RealProjectsService();

export * from "./projects.service";
