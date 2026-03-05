import { z } from "zod";

export const productionReportSchema = z.object({
  IdReport: z.string(),
  Date: z.string(),
  UserId: z.string(),
  UserName: z.string(),
  Area: z.string(),
  OpenReport: z.boolean(),
  OpenDate: z.string(),
  CloseDate: z.string(),
  AppVer: z.string(),
  App: z.number().int().min(0).max(255),
  ShiftPatternVersion: z.number().int(),
});

export const insertProductionReportSchema = productionReportSchema;

export type ProductionReport = z.infer<typeof productionReportSchema>;
export type InsertProductionReport = z.infer<typeof insertProductionReportSchema>;

export const users = {} as any;
export const insertUserSchema = z.object({ username: z.string(), password: z.string() });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
