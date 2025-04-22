import http from "./http.api";
import type {
  CreateInvoiceRequestType,
  UpdateInvoiceRequestType,
  InvoiceResponse,
} from "@/types/invoice.type";

/**
 * Get all invoices
 * @returns List of invoices
 */
export const getAllInvoices = async (): Promise<InvoiceResponse[]> => {
  const response = await http.get<InvoiceResponse[]>("/invoices");
  return response.data;
};

/**
 * Get invoice by ID
 * @param id Invoice ID to fetch
 * @returns Invoice data
 */
export const getInvoiceById = async (id: string): Promise<InvoiceResponse> => {
  const response = await http.get<InvoiceResponse>(`/invoices/${id}`);
  return response.data;
};

/**
 * Creates a new invoice
 * @param data Invoice data to create
 * @returns Newly created invoice data
 */
export const createInvoice = async (
  data: CreateInvoiceRequestType
): Promise<InvoiceResponse> => {
  const response = await http.post<InvoiceResponse>("/invoices", data);
  return response.data;
};

/**
 * Updates an existing invoice
 * @param id Invoice ID to update
 * @param data Invoice data to update
 * @returns Updated invoice data
 */
export const updateInvoice = async (
  id: string,
  data: UpdateInvoiceRequestType
): Promise<InvoiceResponse> => {
  const response = await http.patch<InvoiceResponse>(`/invoices/${id}`, data);
  return response.data;
};

/**
 * Deletes an invoice
 * @param id Invoice ID to delete
 * @returns Success status
 */
export const deleteInvoice = async (id: string): Promise<void> => {
  await http.delete(`/invoices/${id}`);
};
