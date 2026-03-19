import { string, z } from "zod";

export const getProductionReportSchema = z.object({
  idReport: z.string(),
  date: z.string(),
  area: z.string(),
  shift: z.number(),
  userId: z.string(),
  userName: z.string(),
  openReport: z.boolean()
});

export const createProductionReportSchema = z.object({
  date: z.string(),
  area: z.string(),
  shift: z.coerce.number(),
  userId: z.string(),
  userName: z.string(),
  openDate: z.string().default(() => new Date().toISOString())
});

export const getProductionCounterSchema = z.object({
  hour: z.number(),
  pn: z.string(),
  okCount: z.number(),
  nokCount: z.number(),
  nokA: z.number(),
  nokB: z.number(),
  nokC: z.number(),
  nokD: z.number(),
  nokE: z.number(),
  nokF: z.number(),
  nokG: z.number(),
  nokH: z.number(),
  nokI: z.number(),
  nokJ: z.number(),
  nokK: z.number(),
  nokL: z.number(),
  nokM: z.number(),
  nokN: z.number(),
  nokO: z.number(),
  nokP: z.number(),
  nokQ: z.number(),
  nokR: z.number(),
  nokS: z.number(),
  nokT: z.number(),
  nokX: z.number(),
  nokY: z.number(),
  nokZ: z.number(),
  nokAa: z.number(),
  nokBb: z.number(),
  nokCc: z.number(),
  nokDd: z.number(),
  nokEe: z.number(),
  nokFf: z.number(),
  nokGg: z.number(),
  nokHh: z.number(),
  nokIi: z.number(),
  nokJj: z.number(),
  nokKk: z.number(),
  nokTaken: z.number(),
  operators: z.number(),
  operatorsIndirect: z.number(),
  productionTime: z.number()
});

export const getProductionEventSchema = z.object({
  startTime: z.string(),
  stopTime: z.string(),
  category: z.string(),
  machine: z.string(),
  description: z.string(),
});

export type GetProductionReport = z.infer<typeof getProductionReportSchema>;
export type CreateProductionReport = z.infer<typeof createProductionReportSchema>;
export type GetProductionCounter = z.infer<typeof getProductionCounterSchema>;
export type GetProductionEvent = z.infer<typeof getProductionEventSchema>;

export const users = {} as any;
export const insertUserSchema = z.object({ username: z.string(), password: z.string() });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
