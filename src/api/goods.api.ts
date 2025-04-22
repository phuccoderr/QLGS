import http from "./http.api";
import type {
  CreateGoodsRequestType,
  UpdateGoodsRequestType,
  GoodsResponse,
} from "@/types/goods.type";

/**
 * Get all goods
 * @returns List of goods items
 */
export const getAllGoods = async (): Promise<GoodsResponse[]> => {
  const response = await http.get<GoodsResponse[]>("/goods");
  return response.data;
};

/**
 * Get goods by ID
 * @param id Goods ID to fetch
 * @returns Goods data
 */
export const getGoodsById = async (id: string): Promise<GoodsResponse> => {
  const response = await http.get<GoodsResponse>(`/goods/${id}`);
  return response.data;
};

/**
 * Get goods by store ID
 * @param storeId Store ID to fetch goods for
 * @returns List of goods items for the specified store
 */
export const getGoodsByStoreId = async (
  storeId: string
): Promise<GoodsResponse[]> => {
  const response = await http.get<GoodsResponse[]>(`/goods/store/${storeId}`);
  return response.data;
};

/**
 * Creates a new goods item
 * @param data Goods data to create
 * @returns Newly created goods data
 */
export const createGoods = async (
  data: CreateGoodsRequestType
): Promise<GoodsResponse> => {
  const response = await http.post<GoodsResponse>("/goods", data);
  return response.data;
};

/**
 * Updates an existing goods item
 * @param id Goods ID to update
 * @param data Goods data to update
 * @returns Updated goods data
 */
export const updateGoods = async (
  id: string,
  data: UpdateGoodsRequestType
): Promise<GoodsResponse> => {
  const response = await http.patch<GoodsResponse>(`/goods/${id}`, data);
  return response.data;
};

/**
 * Deletes a goods item
 * @param id Goods ID to delete
 * @returns Success status
 */
export const deleteGoods = async (id: string): Promise<void> => {
  await http.delete(`/goods/${id}`);
};
