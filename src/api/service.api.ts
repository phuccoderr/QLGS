import http from "./http.api";
import type {
  CreateServiceRequestType,
  UpdateServiceRequestType,
  ServiceResponse,
} from "@/types/service.type";

/**
 * Get all services
 * @returns List of services
 */
export const getAllServices = async (): Promise<ServiceResponse[]> => {
  const response = await http.get<ServiceResponse[]>("/services/all");
  return response.data;
};

/**
 * Get service by ID
 * @param id Service ID to fetch
 * @returns Service data
 */
export const getServiceById = async (id: string): Promise<ServiceResponse> => {
  const response = await http.get<ServiceResponse>(`/services/${id}`);
  return response.data;
};

/**
 * Creates a new service
 * @param data Service data to create
 * @returns Newly created service data
 */
export const createService = async (
  data: CreateServiceRequestType
): Promise<ServiceResponse> => {
  const response = await http.post<ServiceResponse>("/services", data);
  return response.data;
};

/**
 * Updates an existing service
 * @param id Service ID to update
 * @param data Service data to update
 * @returns Updated service data
 */
export const updateService = async (
  id: string,
  data: UpdateServiceRequestType
): Promise<ServiceResponse> => {
  const response = await http.patch<ServiceResponse>(`/services/${id}`, data);
  return response.data;
};

/**
 * Deletes a service
 * @param id Service ID to delete
 * @returns Success status
 */
export const deleteService = async (id: string): Promise<void> => {
  await http.delete(`/services/${id}`);
};
