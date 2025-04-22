import http from "./http.api";
import type {
  CreateDeliveryRequestType,
  UpdateDeliveryRequestType,
  DeliveryResponse,
} from "@/types/delivery.type";

/**
 * Get all deliveries
 * @returns List of deliveries
 */
export const getAllDeliveries = async (): Promise<DeliveryResponse[]> => {
  const response = await http.get<DeliveryResponse[]>("/deliverys");
  return response.data;
};

/**
 * Get delivery by ID
 * @param id Delivery ID to fetch
 * @returns Delivery data
 */
export const getDeliveryById = async (
  id: string
): Promise<DeliveryResponse> => {
  const response = await http.get<DeliveryResponse>(`/deliverys/${id}`);
  return response.data;
};

/**
 * Creates a new delivery
 * @param data Delivery data to create
 * @returns Newly created delivery data
 */
export const createDelivery = async (
  data: CreateDeliveryRequestType
): Promise<DeliveryResponse> => {
  const response = await http.post<DeliveryResponse>("/deliverys", data);
  return response.data;
};

/**
 * Updates an existing delivery
 * @param id Delivery ID to update
 * @param data Delivery data to update
 * @returns Updated delivery data
 */
export const updateDelivery = async (
  id: string,
  data: UpdateDeliveryRequestType
): Promise<DeliveryResponse> => {
  const response = await http.patch<DeliveryResponse>(`/deliverys/${id}`, data);
  return response.data;
};

/**
 * Deletes a delivery
 * @param id Delivery ID to delete
 * @returns Success status
 */
export const deleteDelivery = async (id: string): Promise<void> => {
  await http.delete(`/deliverys/${id}`);
};
