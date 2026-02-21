import { sql } from "drizzle-orm";
import { integer, jsonb, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Pipeline de pré-construção
export const PROJECT_STATUSES = ["lead", "visite", "devis", "relance", "accepte"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  client: text("client").notNull(),
  value: integer("value").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("lead"),
  daysInStatus: integer("daysInStatus").notNull().default(0),
  type: text("type").notNull().default(""),
  location: text("location").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  measures: text("measures").notNull().default(""),
  notes: text("notes").notNull().default(""),
  expectedQuoteDate: text("expectedQuoteDate").notNull().default(""),
  photoUrls: jsonb("photoUrls").$type<string[]>().default([]),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const updateProjectSchema = createInsertSchema(projects).partial().omit({ id: true });

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type Project = typeof projects.$inferSelect;
