export interface CreateStockTransactionRequestType {
  id_goods: string;
  id_store: string;
  id_supplier?: string;
  type: "Nhap" | "Xuat";
  quantity: number;
  price: number;
  date: Date;
}

export interface UpdateStockTransactionRequestType {
  id_goods?: string;
  id_store?: string;
  id_supplier?: string;
  type?: "Nhap" | "Xuat";
  quantity?: number;
  price?: number;
  date?: Date;
}

export interface StockTransactionResponse {
  _id: string;
  id_goods: string;
  id_store: string;
  id_supplier?: string;
  type: "Nhap" | "Xuat";
  quantity: number;
  price: number;
  date: Date;
  createdAt: string;
  updatedAt: string;
}
