import http from "./http.api";
import type {
  CreatePromotionRequestType,
  UpdatePromotionRequestType,
  PromotionResponse,
} from "@/types/promotion.type";

/**
 * Get all promotions
 * @returns List of promotions
 */
export const getAllPromotions = async (): Promise<PromotionResponse[]> => {
  const response = await http.get<PromotionResponse[]>("/promotions");
  return response.data;
};

/**
 * Get promotion by ID
 * @param id Promotion ID to fetch
 * @returns Promotion data
 */
export const getPromotionById = async (
  id: string
): Promise<PromotionResponse> => {
  const response = await http.get<PromotionResponse>(`/promotions/${id}`);
  return response.data;
};

/**
 * Creates a new promotion
 * @param data Promotion data to create
 * @returns Newly created promotion data
 */
export const createPromotion = async (
  data: CreatePromotionRequestType
): Promise<PromotionResponse> => {
  const response = await http.post<PromotionResponse>("/promotions", data);
  return response.data;
};

/**
 * Updates an existing promotion
 * @param id Promotion ID to update
 * @param data Promotion data to update
 * @returns Updated promotion data
 */
export const updatePromotion = async (
  id: string,
  data: UpdatePromotionRequestType
): Promise<PromotionResponse> => {
  const response = await http.patch<PromotionResponse>(
    `/promotions/${id}`,
    data
  );
  return response.data;
};

/**
 * Deletes a promotion
 * @param id Promotion ID to delete
 * @returns Success status
 */
export const deletePromotion = async (id: string): Promise<void> => {
  await http.delete(`/promotions/${id}`);
};
