export interface CreateStoreRequestType {
  name: string;
  phoneNumber?: string;
  address?: string;
  status?: boolean;
  id_manager?: string;
}

export interface UpdateStoreRequestType {
  name?: string;
  phoneNumber?: string;
  address?: string;
  status?: boolean;
  id_manager?: string;
}

export interface StoreResponse {
  _id: string;
  name: string;
  phoneNumber?: string;
  address?: string;
  status: boolean;
  id_manager?: string;
  createdAt: string;
  updatedAt: string;
}
