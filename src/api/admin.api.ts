import http from "./http.api";

interface LoginRequestType {
  email: string;
  password: string;
}

interface LoginResponseType {
  token: string;
}

interface AdminType {
  _id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Login to the admin system
 * @param data Login credentials (email and password)
 * @returns Login response with token
 */
export const login = async (
  data: LoginRequestType
): Promise<LoginResponseType> => {
  const response = await http.post<LoginResponseType>("/admins/login", data);
  return response.data;
};

/**
 * Get the current logged-in admin
 * @returns Admin data
 */
export const getCurrentAdmin = async (): Promise<AdminType> => {
  const response = await http.get<AdminType>("/admins/me");
  return response.data;
};

/**
 * Logout from the admin system
 */
export const logout = (): void => {
  localStorage.removeItem("token");
};
