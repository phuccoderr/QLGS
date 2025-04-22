import http from "./http.api";
import type {
  CreateCustomerRequestType,
  UpdateCustomerRequestType,
  CustomerResponse,
} from "@/types/customer.type";

/**
 * Get all customers
 * @returns List of customers
 */
export const getAllCustomers = async (): Promise<CustomerResponse[]> => {
  const response = await http.get<CustomerResponse[]>("/customers/all");
  return response.data;
};

/**
 * Get customer by ID
 * @param id Customer ID to fetch
 * @returns Customer data
 */
export const getCustomerById = async (
  id: string
): Promise<CustomerResponse> => {
  const response = await http.get<CustomerResponse>(`/customers/${id}`);
  return response.data;
};

/**
 * Creates a new customer
 * @param data Customer data to create
 * @returns Newly created customer data
 */
export const createCustomer = async (
  data: CreateCustomerRequestType
): Promise<CustomerResponse> => {
  const response = await http.post<CustomerResponse>("/customers", data);
  return response.data;
};

/**
 * Updates an existing customer
 * @param id Customer ID to update
 * @param data Customer data to update
 * @returns Updated customer data
 */
export const updateCustomer = async (
  id: string,
  data: UpdateCustomerRequestType
): Promise<CustomerResponse> => {
  const response = await http.put<CustomerResponse>(`/customers/${id}`, data);
  return response.data;
};

/**
 * Deletes a customer
 * @param id Customer ID to delete
 * @returns Success status
 */
export const deleteCustomer = async (id: string): Promise<void> => {
  await http.delete(`/customers/${id}`);
};
