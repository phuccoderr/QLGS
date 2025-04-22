export interface CreateInvoiceRequestType {
  id_laundry_order: string;
  id_store: string;
  date: string;
  total_price: number;
  discount_price?: number;
  actual_price: number;
  shipping_fee?: number;
  status: string;
  note?: string;
}

export interface UpdateInvoiceRequestType {
  id_laundry_order?: string;
  id_store?: string;
  date?: string;
  total_price?: number;
  discount_price?: number;
  actual_price?: number;
  shipping_fee?: number;
  status?: string;
  note?: string;
}

export interface InvoiceResponse {
  _id: string;
  id_laundry_order: string;
  id_store: string;
  date: string;
  total_price: number;
  discount_price?: number;
  actual_price: number;
  shipping_fee?: number;
  status: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
