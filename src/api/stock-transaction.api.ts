import { ApiPagination } from "@/types/api-pagination.type";
import http from "./http.api";
import type {
  CreateStockTransactionRequestType,
  UpdateStockTransactionRequestType,
  StockTransactionResponse,
} from "@/types/stock-transaction.type";

/**
 * Get all stock transactions
 * @returns List of stock transactions
 */
export const getAllStockTransactions = async (): Promise<
  StockTransactionResponse[]
> => {
  const response = await http.get<ApiPagination<StockTransactionResponse>>(
    "/stock-transactions",
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
 * Get stock transaction by ID
 * @param id Stock transaction ID to fetch
 * @returns Stock transaction data
 */
export const getStockTransactionById = async (
  id: string
): Promise<StockTransactionResponse> => {
  const response = await http.get<StockTransactionResponse>(
    `/stock-transactions/${id}`
  );
  return response.data;
};

/**
 * Creates a new stock transaction
 * @param data Stock transaction data to create
 * @returns Newly created stock transaction data
 */
export const createStockTransaction = async (
  data: CreateStockTransactionRequestType
): Promise<StockTransactionResponse> => {
  const response = await http.post<StockTransactionResponse>(
    "/stock-transactions",
    data
  );
  return response.data;
};

/**
 * Updates an existing stock transaction
 * @param id Stock transaction ID to update
 * @param data Stock transaction data to update
 * @returns Updated stock transaction data
 */
export const updateStockTransaction = async (
  id: string,
  data: UpdateStockTransactionRequestType
): Promise<StockTransactionResponse> => {
  const response = await http.patch<StockTransactionResponse>(
    `/stock-transactions/${id}`,
    data
  );
  return response.data;
};

/**
 * Deletes a stock transaction
 * @param id Stock transaction ID to delete
 * @returns Success status
 */
export const deleteStockTransaction = async (id: string): Promise<void> => {
  await http.delete(`/stock-transactions/${id}`);
};
