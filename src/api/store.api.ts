import http from "./http.api";
import type {
  CreateStoreRequestType,
  UpdateStoreRequestType,
  StoreResponse,
} from "@/types/store.type";

/**
 * Get all store members
 * @returns List of store members
 */
export const getAllStore = async (): Promise<StoreResponse[]> => {
  const response = await http.get<StoreResponse[]>("/stores/all");
  return response.data;
};

/**
 * Get store member by ID
 * @param id Store ID to fetch
 * @returns Store member data
 */
export const getStoreById = async (id: string): Promise<StoreResponse> => {
  const response = await http.get<StoreResponse>(`/stores/${id}`);
  return response.data;
};

/**
 * Get store members by manager ID
 * @param managerId Manager ID to fetch store for
 * @returns List of store members under the manager
 */
export const getStoreByManagerId = async (
  managerId: string
): Promise<StoreResponse[]> => {
  const response = await http.get<StoreResponse[]>(
    `/stores/manager/${managerId}`
  );
  return response.data;
};

/**
 * Creates a new store member
 * @param data Store data to create
 * @returns Newly created store data
 */
export const createStore = async (
  data: CreateStoreRequestType
): Promise<StoreResponse> => {
  const response = await http.post<StoreResponse>("/stores", data);
  return response.data;
};

/**
 * Updates an existing store member
 * @param id Store ID to update
 * @param data Store data to update
 * @returns Updated store data
 */
export const updateStore = async (
  id: string,
  data: UpdateStoreRequestType
): Promise<StoreResponse> => {
  const response = await http.patch<StoreResponse>(`/stores/${id}`, data);
  return response.data;
};

/**
 * Updates store member status
 * @param id Store ID
 * @param status New status value
 * @returns Updated store data
 */
export const updateStoreStatus = async (
  id: string,
  status: boolean
): Promise<StoreResponse> => {
  const response = await http.patch<StoreResponse>(`/stores/${id}/status`, {
    status,
  });
  return response.data;
};

/**
 * Deletes a store member
 * @param id Store ID to delete
 * @returns Success status
 */
export const deleteStore = async (id: string): Promise<void> => {
  await http.delete(`/stores/${id}`);
};
