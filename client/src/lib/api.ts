import type { GetProductionReport, GetProductionCounter, GetProductionEvent, CreateProductionReport } from "@shared/schema";

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
  getAllProductionReports: (): Promise<GetProductionReport[]> =>
    fetch(`${BASE_URL}/api/ProductionReports`).then(r => handleResponse<GetProductionReport[]>(r)),

  getProductionReportsByPage: (pageNumber: number, pageSize: number): Promise<GetProductionReport[]> =>
    fetch(`${BASE_URL}/api/ProductionReports?pageNumber=${pageNumber}&pageSize=${pageSize}`).then(r => handleResponse<GetProductionReport[]>(r)),

  getProductionReport: (id: string): Promise<GetProductionReport> =>
    fetch(`${BASE_URL}/api/ProductionReports/${id}`).then(r => handleResponse<GetProductionReport>(r)),

  openProductionReport: (id: string): Promise<GetProductionReport> =>
    fetch(`${BASE_URL}/api/ProductionReports/${id}/Open`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }).then(r => handleResponse<GetProductionReport>(r)),

  closeProductionReport: (id: string): Promise<GetProductionReport> =>
    fetch(`${BASE_URL}/api/ProductionReports/${id}/Close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }).then(r => handleResponse<GetProductionReport>(r)),

  getProductionCounters: (reportId: string): Promise<GetProductionCounter[]> =>
    fetch(`${BASE_URL}/api/ProductionReports/${reportId}/Counters`).then(r => handleResponse<GetProductionCounter[]>(r)),

  getProductionEvents: (reportId: string): Promise<GetProductionEvent[]> =>
    fetch(`${BASE_URL}/api/ProductionReports/${reportId}/Events`).then(r => handleResponse<GetProductionEvent[]>(r)),

  createProductionReport: (report: CreateProductionReport): Promise<GetProductionReport> =>
    fetch(`${BASE_URL}/api/ProductionReports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    }).then(r => handleResponse<GetProductionReport>(r)),

  updateProductionReport: (id: string, report: CreateProductionReport): Promise<GetProductionReport> =>
    fetch(`${BASE_URL}/api/ProductionReports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    }).then(r => handleResponse<GetProductionReport>(r)),

  deleteProductionReport: (id: string): Promise<void> =>
    fetch(`${BASE_URL}/api/ProductionReports/${id}`, {
      method: "DELETE",
    }).then(r => handleResponse<void>(r)),
};
