export interface ReportRequest {
  storeId: string;
}

export interface ReportResponse {
  gross_sales: number;
  orders_count: number;
  date: Date;
  store_id: string;
}
