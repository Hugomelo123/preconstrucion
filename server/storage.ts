import {
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type UpdateProject,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(data: InsertProject): Promise<Project>;
  updateProject(id: string, data: UpdateProject): Promise<Project | undefined>;
}

const SEED_PROJECTS: InsertProject[] = [
  {
    title: "Isolation façade",
    client: "Jean Dupont",
    value: 38500,
    status: "lead",
    daysInStatus: 2,
    type: "Rénovation Extérieure",
    location: "Lyon, 69003",
    phone: "06 12 34 56 78",
    email: "jean.dupont@email.com",
    measures: "Surface estimée: 120m2. Échafaudage nécessaire sur 2 faces.",
    notes: "Client très intéressé par les aides d'état (MaPrimeRénov'). À mentionner lors de la visite.",
    expectedQuoteDate: "-",
  },
  {
    title: "Rénovation toiture",
    client: "Marie Martin",
    value: 62000,
    status: "visite",
    daysInStatus: 5,
    type: "Couverture",
    location: "Villeurbanne, 69100",
    phone: "06 98 76 54 32",
    email: "m.martin@email.com",
    measures: "Toiture 2 pans, 150m2. Remplacement tuiles + isolation rampants.",
    notes: "Accès difficile par la cour arrière. Prévoir nacelle spécifique.",
    expectedQuoteDate: "15 Oct 2023",
  },
  {
    title: "Extension maison",
    client: "Famille Dubois",
    value: 85000,
    status: "devis",
    daysInStatus: 16,
    type: "Gros Oeuvre",
    location: "Écully, 69100",
    phone: "06 11 22 33 44",
    email: "famille.dubois@email.com",
    measures: "Extension ossature bois 35m2 sur dalle béton.",
    notes: "Permis de construire déjà validé. En attente de notre devis pour accord banque.",
    expectedQuoteDate: "Envoyé le 01 Oct 2023",
  },
  {
    title: "Aménagement combles",
    client: "Luc Bernard",
    value: 45000,
    status: "relance",
    daysInStatus: 8,
    type: "Aménagement Intérieur",
    location: "Bron, 69500",
    phone: "07 55 66 77 88",
    email: "l.bernard@email.com",
    measures: "Création de 2 chambres et 1 SDB. Surface plancher 60m2.",
    notes: "A demandé une modification sur le choix des velux (plus grands).",
    expectedQuoteDate: "Envoyé le 10 Oct 2023",
  },
  {
    title: "Rénovation complète appartement",
    client: "Sophie Leroy",
    value: 110000,
    status: "accepte",
    daysInStatus: 1,
    type: "Rénovation Globale",
    location: "Lyon, 69006",
    phone: "06 44 55 66 77",
    email: "sophie.leroy@email.com",
    measures: "Appartement 85m2. Démolition cloisons, refonte élec/plomberie, sols, peintures.",
    notes: "Acompte de 30% reçu. Début des travaux prévu le 15 Nov.",
    expectedQuoteDate: "Signé le 16 Oct 2023",
  },
  {
    title: "Changement menuiseries",
    client: "Pierre Morel",
    value: 18000,
    status: "visite",
    daysInStatus: 1,
    type: "Menuiserie",
    location: "Vénissieux, 69200",
    phone: "06 22 33 44 55",
    email: "p.morel@email.com",
    measures: "5 fenêtres standard, 2 portes-fenêtres, 1 porte d'entrée.",
    notes: "Souhaite de l'alu gris anthracite extérieur, blanc intérieur.",
    expectedQuoteDate: "20 Oct 2023",
  },
  {
    title: "Création terrasse béton",
    client: "Antoine Roux",
    value: 12500,
    status: "devis",
    daysInStatus: 18,
    type: "Maçonnerie",
    location: "Saint-Priest, 69800",
    phone: "06 33 44 55 66",
    email: "a.roux@email.com",
    measures: "Terrasse 40m2 avec fondations et escalier 3 marches.",
    notes: "Devis envoyé il y a plus de 2 semaines, pas de retour malgré messages.",
    expectedQuoteDate: "Envoyé le 28 Sep 2023",
  },
];

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    for (const data of SEED_PROJECTS) {
      const id = randomUUID();
      this.projects.set(id, { ...data, id, photoUrls: data.photoUrls ?? [] });
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(data: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      id,
      title: data.title,
      client: data.client,
      value: data.value,
      status: data.status ?? "lead",
      daysInStatus: data.daysInStatus ?? 0,
      type: data.type ?? "",
      location: data.location ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      measures: data.measures ?? "",
      notes: data.notes ?? "",
      expectedQuoteDate: data.expectedQuoteDate ?? "",
      photoUrls: data.photoUrls ?? [],
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, data: UpdateProject): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    const updated: Project = { ...existing, ...data };
    this.projects.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
