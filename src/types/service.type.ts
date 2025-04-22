export interface CreateServiceRequestType {
  name: string;
  price: number;
  description: string;
}

export interface UpdateServiceRequestType {
  name?: string;
  price?: number;
  description?: string;
}

export interface ServiceResponse {
  _id: string;
  name: string;
  price: number;
  description: string;
}
