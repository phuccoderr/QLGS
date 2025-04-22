import http from "./http.api";
import type {
  CreateStaffRequestType,
  UpdateStaffRequestType,
  StaffResponse,
} from "@/types/staff.type";

/**
 * Get all staff members
 * @returns List of staff members
 */
export const getAllStaff = async (): Promise<StaffResponse[]> => {
  const response = await http.get<StaffResponse[]>("/staffs/all");
  return response.data;
};

/**
 * Get staff member by ID
 * @param id Staff ID to fetch
 * @returns Staff data
 */
export const getStaffById = async (id: string): Promise<StaffResponse> => {
  const response = await http.get<StaffResponse>(`/staffs/${id}`);
  return response.data;
};

/**
 * Get staff members by store ID
 * @param storeId Store ID to fetch staff for
 * @returns List of staff members assigned to the store
 */
export const getStaffByStoreId = async (
  storeId: string
): Promise<StaffResponse[]> => {
  const response = await http.get<StaffResponse[]>(`/staffs/store/${storeId}`);
  return response.data;
};

/**
 * Creates a new staff member
 * @param data Staff data to create
 * @returns Newly created staff data
 */
export const createStaff = async (
  data: CreateStaffRequestType
): Promise<StaffResponse> => {
  const response = await http.post<StaffResponse>("/staffs", data);
  return response.data;
};

/**
 * Updates an existing staff member
 * @param id Staff ID to update
 * @param data Staff data to update
 * @returns Updated staff data
 */
export const updateStaff = async (
  id: string,
  data: UpdateStaffRequestType
): Promise<StaffResponse> => {
  const response = await http.patch<StaffResponse>(`/staffs/${id}`, data);
  return response.data;
};

/**
 * Updates staff member status
 * @param id Staff ID
 * @param status New status value
 * @returns Updated staff data
 */
export const updateStaffStatus = async (
  id: string,
  status: boolean
): Promise<StaffResponse> => {
  const response = await http.patch<StaffResponse>(`/staffs/${id}/status`, {
    status,
  });
  return response.data;
};

/**
 * Updates staff member role
 * @param id Staff ID
 * @param role New role value
 * @returns Updated staff data
 */
export const updateStaffRole = async (
  id: string,
  role: string
): Promise<StaffResponse> => {
  const response = await http.patch<StaffResponse>(`/staffs/${id}/role`, {
    role,
  });
  return response.data;
};

/**
 * Deletes a staff member
 * @param id Staff ID to delete
 * @returns Success status
 */
export const deleteStaff = async (id: string): Promise<void> => {
  await http.delete(`/staffs/${id}`);
};
