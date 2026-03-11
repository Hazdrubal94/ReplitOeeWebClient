import type { GetProductionReport, CreateProductionReport } from "@shared/schema";

const BASE_URL = "https://localhost:8443";

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
  getProductionReports: (count: number): Promise<GetProductionReport[]> =>
    fetch(`${BASE_URL}/api/ProductionReports/ProductionReports?count=${count}`).then(r => handleResponse<GetProductionReport[]>(r)),

  getProductionReport: (id: string): Promise<GetProductionReport> =>
    fetch(`${BASE_URL}/api/ProductionReports/ProductionReports/${id}`).then(r => handleResponse<GetProductionReport>(r)),

  createProductionReport: (report: CreateProductionReport): Promise<GetProductionReport> =>
    fetch(`${BASE_URL}/api/ProductionReports/ProductionReports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    }).then(r => handleResponse<GetProductionReport>(r)),

  updateProductionReport: (id: string, report: CreateProductionReport): Promise<GetProductionReport> =>
    fetch(`${BASE_URL}/api/ProductionReports/ProductionReports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    }).then(r => handleResponse<GetProductionReport>(r)),

  deleteProductionReport: (id: string): Promise<void> =>
    fetch(`${BASE_URL}/api/ProductionReports/ProductionReports/${id}`, {
      method: "DELETE",
    }).then(r => handleResponse<void>(r)),
};
