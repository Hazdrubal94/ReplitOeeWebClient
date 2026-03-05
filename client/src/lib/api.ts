import type { ProductionReport, InsertProductionReport } from "@shared/schema";

const BASE_URL = "/proxy";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message || body?.title || message;
    } catch {
      try {
        message = await res.text() || message;
      } catch {}
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getProductionReports: (): Promise<ProductionReport[]> =>
    fetch(`${BASE_URL}/api/ProductionReports/ProductionReports`).then(r => handleResponse<ProductionReport[]>(r)),

  getProductionReport: (id: string): Promise<ProductionReport> =>
    fetch(`${BASE_URL}/api/ProductionReports/ProductionReports/${id}`).then(r => handleResponse<ProductionReport>(r)),

  createProductionReport: (report: InsertProductionReport): Promise<ProductionReport> =>
    fetch(`${BASE_URL}/api/ProductionReports/ProductionReports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    }).then(r => handleResponse<ProductionReport>(r)),

  updateProductionReport: (id: string, report: InsertProductionReport): Promise<ProductionReport> =>
    fetch(`${BASE_URL}/api/ProductionReports/ProductionReports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    }).then(r => handleResponse<ProductionReport>(r)),

  deleteProductionReport: (id: string): Promise<void> =>
    fetch(`${BASE_URL}/api/ProductionReports/ProductionReports/${id}`, {
      method: "DELETE",
    }).then(r => handleResponse<void>(r)),
};
