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
    openDate: z.string()
});

export type GetProductionReport = z.infer<typeof getProductionReportSchema>;
export type CreateProductionReport = z.infer<typeof createProductionReportSchema>;

export const users = {} as any;
export const insertUserSchema = z.object({ username: z.string(), password: z.string() });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
