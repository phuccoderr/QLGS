import { ApiPagination } from "@/types/api-pagination.type";
import http from "./http.api";
import type {
  CreateSupplierRequestType,
  UpdateSupplierRequestType,
  SupplierResponse,
} from "@/types/supplier.type";

/**
 * Get all suppliers
 * @returns List of suppliers
 */
export const getAllSuppliers = async (): Promise<SupplierResponse[]> => {
  const response = await http.get<ApiPagination<SupplierResponse>>(
    "/suppliers",
    {
      params: {
        page: 1,
        limit: 500,
      },
    }
  );
  return response.data.entities;
};

/**
 * Get supplier by ID
 * @param id Supplier ID to fetch
 * @returns Supplier data
 */
export const getSupplierById = async (
  id: string
): Promise<SupplierResponse> => {
  const response = await http.get<SupplierResponse>(`/suppliers/${id}`);
  return response.data;
};

/**
 * Creates a new supplier
 * @param data Supplier data to create
 * @returns Newly created supplier data
 */
export const createSupplier = async (
  data: CreateSupplierRequestType
): Promise<SupplierResponse> => {
  const response = await http.post<SupplierResponse>("/suppliers", data);
  return response.data;
};

/**
 * Updates an existing supplier
 * @param id Supplier ID to update
 * @param data Supplier data to update
 * @returns Updated supplier data
 */
export const updateSupplier = async (
  id: string,
  data: UpdateSupplierRequestType
): Promise<SupplierResponse> => {
  const response = await http.patch<SupplierResponse>(`/suppliers/${id}`, data);
  return response.data;
};

/**
 * Deletes a supplier
 * @param id Supplier ID to delete
 * @returns Success status
 */
export const deleteSupplier = async (id: string): Promise<void> => {
  await http.delete(`/suppliers/${id}`);
};
