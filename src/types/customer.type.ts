export interface CreateCustomerRequestType {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  password: string;
  birth_day?: Date;
  customer_type: string;
  role: string;
}

export interface UpdateCustomerRequestType {
  name?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  password?: string;
  birth_day?: Date;
  customer_type?: string;
  role?: string;
}

export interface CustomerResponse {
  _id: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  birth_day?: string;
  customer_type: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface GetAllCustomerPaginationRequestType {
  page: number;
  limit: number;
  sort: string;
  keyword: string;
}
