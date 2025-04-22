export interface CreateGoodsRequestType {
  name: string;
  category: string;
  quantity: number;
  price: number;
  expiryDate?: Date;
  unit: string;
  status: boolean;
  id_store?: string;
}

export interface UpdateGoodsRequestType {
  name?: string;
  category?: string;
  quantity?: number;
  price?: number;
  expiryDate?: Date;
  unit?: string;
  status?: boolean;
  id_store?: string;
}

export interface GoodsResponse {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  expiryDate?: string;
  unit: string;
  status: boolean;
  id_store?: string;
  createdAt: string;
  updatedAt: string;
}
