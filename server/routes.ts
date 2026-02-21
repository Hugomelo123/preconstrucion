import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { updateProjectSchema, insertProjectSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // GET /api/projects — lista todos os projetos
  app.get("/api/projects", async (_req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  // GET /api/projects/:id — um projeto
  app.get("/api/projects/:id", async (req, res) => {
    const project = await storage.getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Projeto não encontrado" });
    res.json(project);
  });

  // POST /api/projects — criar projeto
  app.post("/api/projects", async (req, res) => {
    const parsed = insertProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.flatten() });
    }
    const project = await storage.createProject(parsed.data);
    res.status(201).json(project);
  });

  // PATCH /api/projects/:id — atualizar projeto (ex.: mudar estado)
  app.patch("/api/projects/:id", async (req, res) => {
    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.flatten() });
    }
    const project = await storage.updateProject(req.params.id, parsed.data);
    if (!project) return res.status(404).json({ message: "Projeto não encontrado" });
    res.json(project);
  });

  return httpServer;
}
