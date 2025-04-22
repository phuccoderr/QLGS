import http from "./http.api";
import type {
  CreateWarehouseRequestType,
  UpdateWarehouseRequestType,
  WarehouseResponse,
} from "@/types/warehouse.type";

/**
 * Get all warehouse records
 * @returns List of warehouse records
 */
export const getAllWarehouse = async (): Promise<WarehouseResponse[]> => {
  const response = await http.get<WarehouseResponse[]>("/warehouse/all");
  return response.data;
};

/**
 * Get warehouse record by ID
 * @param id Warehouse ID to fetch
 * @returns Warehouse data
 */
export const getWarehouseById = async (
  id: string
): Promise<WarehouseResponse> => {
  const response = await http.get<WarehouseResponse>(`/warehouse/${id}`);
  return response.data;
};

/**
 * Creates a new warehouse record
 * @param data Warehouse data to create
 * @returns Newly created warehouse data
 */
export const createWarehouse = async (
  data: CreateWarehouseRequestType
): Promise<WarehouseResponse> => {
  const response = await http.post<WarehouseResponse>("/warehouse", data);
  return response.data;
};

/**
 * Updates an existing warehouse record
 * @param id Warehouse ID to update
 * @param data Warehouse data to update
 * @returns Updated warehouse data
 */
export const updateWarehouse = async (
  id: string,
  data: UpdateWarehouseRequestType
): Promise<WarehouseResponse> => {
  const response = await http.patch<WarehouseResponse>(
    `/warehouse/${id}`,
    data
  );
  return response.data;
};

/**
 * Deletes a warehouse record
 * @param id Warehouse ID to delete
 * @returns Success status
 */
export const deleteWarehouse = async (id: string): Promise<void> => {
  await http.delete(`/warehouse/${id}`);
};
