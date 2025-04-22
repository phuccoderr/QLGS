import http from "./http.api";
import type {
  CreateLaundryOrderRequestType,
  UpdateLaundryOrderRequestType,
  LaundryOrderResponse,
} from "@/types/laundry_order.type";

/**
 * Get all laundry orders
 * @returns List of laundry orders
 */
export const getAllLaundryOrders = async (): Promise<
  LaundryOrderResponse[]
> => {
  const response = await http.get<LaundryOrderResponse[]>(
    "/laundry_orders/names"
  );
  return response.data;
};

/**
 * Get laundry order by ID
 * @param id Laundry order ID to fetch
 * @returns Laundry order data
 */
export const getLaundryOrderById = async (
  id: string
): Promise<LaundryOrderResponse> => {
  const response = await http.get<LaundryOrderResponse>(
    `/laundry_orders/${id}`
  );
  return response.data;
};

/**
 * Creates a new laundry order
 * @param data Laundry order data to create
 * @returns Newly created laundry order data
 */
export const createLaundryOrder = async (
  data: CreateLaundryOrderRequestType
): Promise<LaundryOrderResponse> => {
  const response = await http.post<LaundryOrderResponse>(
    "/laundry_orders",
    data
  );
  return response.data;
};

/**
 * Updates an existing laundry order
 * @param id Laundry order ID to update
 * @param data Laundry order data to update
 * @returns Updated laundry order data
 */
export const updateLaundryOrder = async (
  id: string,
  data: UpdateLaundryOrderRequestType
): Promise<LaundryOrderResponse> => {
  const response = await http.patch<LaundryOrderResponse>(
    `/laundry_orders/${id}`,
    data
  );
  return response.data;
};

/**
 * Deletes a laundry order
 * @param id Laundry order ID to delete
 * @returns Success status
 */
export const deleteLaundryOrder = async (id: string): Promise<void> => {
  await http.delete(`/laundry_orders/${id}`);
};
