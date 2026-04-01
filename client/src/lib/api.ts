import type
{
    GetProductionReport,
    CreateProductionReport,
    GetAreaDescription,
    GetProductionCounter,
    CreateUpdateProductionCounter,
    GetProductionEvent,
    CreateUpdateProductionEvent,
    GetNokCategory,
    GetCategoryDescription,
    GetSubcategoryDescription,
    GetMachineDescription
} from "@shared/schema";

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

  getProductionReportById: (id: string): Promise<GetProductionReport> =>
    fetch(`${BASE_URL}/api/ProductionReports/${id}`).then(r => handleResponse<GetProductionReport>(r)),

  createProductionReport: (report: CreateProductionReport): Promise<GetProductionReport> =>
    fetch(`${BASE_URL}/api/ProductionReports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    }).then(r => handleResponse<GetProductionReport>(r)),

  getAreaDescriptions: (): Promise<GetAreaDescription[]> =>
    fetch(`${BASE_URL}/api/ProductionReports/Areas`).then(r => handleResponse<GetAreaDescription[]>(r)),

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

  createProductionCounter: (reportId: string, event: CreateUpdateProductionCounter): Promise<GetProductionCounter> =>
    fetch(`${BASE_URL}/api/ProductionReports/${reportId}/Counters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
    }).then(r => handleResponse<GetProductionCounter>(r)),

  updateProductionCounter: (reportId: string, id: number, event: CreateUpdateProductionCounter): Promise<GetProductionCounter> =>
    fetch(`${BASE_URL}/api/ProductionReports/${reportId}/Counters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
    }).then(r => handleResponse<GetProductionCounter>(r)),

  deleteProductionCounter: (id: number): Promise<void> =>
    fetch(`${BASE_URL}/api/ProductionReports/Counters/${id}`, {
      method: "DELETE",
    }).then(r => handleResponse<void>(r)),

  getProductionEvents: (reportId: string): Promise<GetProductionEvent[]> =>
    fetch(`${BASE_URL}/api/ProductionReports/${reportId}/Events`).then(r => handleResponse<GetProductionEvent[]>(r)),

  createProductionEvent: (reportId: string, event: CreateUpdateProductionEvent): Promise<GetProductionEvent> =>
    fetch(`${BASE_URL}/api/ProductionReports/${reportId}/Events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
    }).then(r => handleResponse<GetProductionEvent>(r)),

  updateProductionEvent: (reportId: string, id: number, event: CreateUpdateProductionEvent): Promise<GetProductionEvent> =>
    fetch(`${BASE_URL}/api/ProductionReports/${reportId}/Events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
    }).then(r => handleResponse<GetProductionEvent>(r)),

  deleteProductionEvent: (id: number): Promise<void> =>
    fetch(`${BASE_URL}/api/ProductionReports/Events/${id}`, {
      method: "DELETE",
    }).then(r => handleResponse<void>(r)),

  getCategoryDescriptions: (): Promise<GetCategoryDescription[]> =>
    fetch(`${BASE_URL}/api/ProductionReports/Categories`).then(r => handleResponse<GetCategoryDescription[]>(r)),

  getSubcategoriesForCategoryId: (id: number): Promise<GetSubcategoryDescription[] | null> =>
    fetch(`${BASE_URL}/api/ProductionReports/Categories/${id}/Subcategories`).then(r => handleResponse<GetSubcategoryDescription[] | null>(r)),

  getSubcategories: (): Promise<GetSubcategoryDescription[]> =>
    fetch(`${BASE_URL}/api/ProductionReports/Subcategories`).then(r => handleResponse<GetSubcategoryDescription[]>(r)),

  getSubcategoryById: (id: number): Promise<GetSubcategoryDescription> =>
    fetch(`${BASE_URL}/api/ProductionReports/Subcategories/${id}`).then(r => handleResponse<GetSubcategoryDescription>(r)),

  getMachineDescriptions: (area: string): Promise<GetMachineDescription[]> =>
    fetch(`${BASE_URL}/api/ProductionReports/Machines?area=${area}`).then(r => handleResponse<GetMachineDescription[]>(r)),

  getNokCategories: (area: string): Promise<GetNokCategory[]> =>
    fetch(`${BASE_URL}/api/ProductionReports/NokCategories?area=${area}`).then(r => handleResponse<GetNokCategory[]>(r)),

  getPNs: (area: string): Promise<string[]> =>
    fetch(`${BASE_URL}/api/ProductionReports/PNs?area=${area}`).then(r => handleResponse<string[]>(r)),
};
