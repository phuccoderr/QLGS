export interface CreateWarehouseRequestType {
  id_store: string;
  id_goods: string;
  quantity: number;
  status?: boolean;
}

export interface UpdateWarehouseRequestType {
  id_store?: string;
  id_goods?: string;
  quantity?: number;
  status?: boolean;
}

export interface WarehouseResponse {
  _id: string;
  id_store: string;
  id_goods: string;
  quantity: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}
