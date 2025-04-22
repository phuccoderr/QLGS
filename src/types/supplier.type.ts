export interface CreateSupplierRequestType {
  id_store: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierRequestType {
  id_store?: string;
  name?: string;
  phone?: string;
  address?: string;
}

export interface SupplierResponse {
  _id: string;
  id_store: string;
  name: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}
