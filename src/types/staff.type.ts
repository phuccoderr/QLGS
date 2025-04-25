export interface CreateStaffRequestType {
  id_store: string;
  name: string;
  phoneNumber: string;
  email: string;
  role?: "MANAGER" | "STAFF";
  password: string;
  status: boolean;
}

export interface UpdateStaffRequestType {
  id_store?: string;
  name?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  status?: boolean;
}

export interface StaffResponse {
  _id: string;
  id_store: string;
  name: string;
  phoneNumber: string;
  email: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  status: boolean;
  createdAt: string;
  updatedAt: string;
}
