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

export const getAreaDescriptionSchema = z.object({
  id: z.number(),
  area: z.string(),
  description: z.string()
});

export const getProductionCounterSchema = z.object({
  id: z.number(),
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

export const createUpdateProductionCounterSchema = z.object({
  hour: z.number(),
  pn: z.string(),
  userName: z.string(),
  updateTime: z.string().default(() => new Date().toISOString()),
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

export const errorCodeSchema = z.object({
  code: z.number(),
  count: z.number()
});

export const codingSchema = z.object({
    name: z.string(),
    errorCodes: z.array(errorCodeSchema)
});

export const getCounterRowProductionTimeSchema = z.object({
  id: z.number(),
  idReport: z.string(),
  hour: z.number(),
  sequence: z.number(),
  pn: z.string(),
  fert: z.string(),
  productionTime: z.number(),
  codings: z.array(codingSchema)
});

export const createUpdateProductionTimeAndCounterRowsSchema = z.object({
  hour: z.number(),
  sequence: z.number(),
  pn: z.string(),
  fert: z.string(),
  productionTime: z.number(),
  codings: z.array(codingSchema)
});

export const getProductionEventSchema = z.object({
  id: z.number(),
  startTime: z.string(),
  stopTime: z.string(),
  category: z.number(),
  subcategory: z.number().nullable(),
  pn: z.string(),
  isAvailabilityLoss: z.boolean(),
  machineNr: z.number(),
  description: z.string(),
});

export const createUpdateProductionEventSchema = z.object({
  userName: z.string(),
  updateTime: z.string().default(() => new Date().toISOString()),
  startTime: z.string(),
  stopTime: z.string(),
  category: z.coerce.number(),
  subcategory: z.coerce.number().nullable(),
  pn: z.string(),
  isAvailabilityLoss: z.boolean(),
  machineNr: z.coerce.number(),
  description: z.string(),
});

export const getCategoryDescriptionSchema = z.object({
  id: z.number(),
  description: z.string(),
  descriptionEn: z.string(),
});

export const getSubcategoryDescriptionSchema = z.object({
  id: z.number(),
  descriptionEn: z.string(),
  descriptionSp: z.string(),
});

export const getMachineDescriptionSchema = z.object({
  id: z.number(),
  area: z.string(),
  machine: z.string(),
  description: z.string(),
  descriptionEn: z.string(),
});

export const getNokCategorySchema = z.object({
  id: z.number(),
  coding: z.string(),
  descriptionEn: z.string(),
  descriptionSp: z.string(),
});

export type GetProductionReport = z.infer<typeof getProductionReportSchema>;
export type CreateProductionReport = z.infer<typeof createProductionReportSchema>;
export type GetAreaDescription = z.infer<typeof getAreaDescriptionSchema>;
export type GetProductionCounter = z.infer<typeof getProductionCounterSchema>;
export type CreateUpdateProductionCounter = z.infer<typeof createUpdateProductionCounterSchema>;
export type GetCounterRowProductionTime = z.infer<typeof getCounterRowProductionTimeSchema>;
export type CreateUpdateProductionTimeAndCounterRows = z.infer<typeof createUpdateProductionTimeAndCounterRowsSchema>;
export type GetProductionEvent = z.infer<typeof getProductionEventSchema>;
export type CreateUpdateProductionEvent = z.infer<typeof createUpdateProductionEventSchema>;
export type GetNokCategory = z.infer<typeof getNokCategorySchema>;
export type GetCategoryDescription = z.infer<typeof getCategoryDescriptionSchema>;
export type GetSubcategoryDescription = z.infer<typeof getSubcategoryDescriptionSchema>;
export type GetMachineDescription = z.infer<typeof getMachineDescriptionSchema>;

export const users = {} as any;
export const insertUserSchema = z.object({ username: z.string(), password: z.string() });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
