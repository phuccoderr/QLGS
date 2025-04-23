import http from "@/api/http.api";
import { ReportResponse } from "@/types/report.type";

/**
 * Get the current logged-in admin
 * @returns Admin data
 */
export const getReports = async (
  day: "last_7_days" | "last_30_days" | "last_year",
  storeId: string
): Promise<ReportResponse> => {
  const response = await http.get<ReportResponse>(`/reports/${day}`, {
    params: { storeId },
  });
  return response.data;
};
