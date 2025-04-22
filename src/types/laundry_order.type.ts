export interface OrderDetailDto {
  id_service: string;
  id_goods?: string;
  quantity: number;
  price: number;
  subTotal: number;
  note?: string;
}

export interface CreateLaundryOrderRequestType {
  id_store: string;
  id_customer: string;
  id_staff: string;
  receivedDate: string;
  returnedDate?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  totalAmount: number;
  discountAmount?: number;
  amountPaid: number;
  status: string;
  promotionId?: string;
  orderDetails: OrderDetailDto[];
}

export interface UpdateLaundryOrderRequestType {
  id_store?: string;
  id_customer?: string;
  id_staff?: string;
  receivedDate?: string;
  returnedDate?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  totalAmount?: number;
  discountAmount?: number;
  amountPaid?: number;
  status?: string;
  promotionId?: string;
  orderDetails?: OrderDetailDto[];
}

export interface LaundryOrderResponse {
  _id: string;
  id_store: string;
  id_customer: string;
  id_staff: string;
  receivedDate: string;
  returnedDate?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  totalAmount: number;
  discountAmount?: number;
  amountPaid: number;
  status: string;
  promotionId?: string;
  orderDetails: OrderDetailDto[];
  createdAt: string;
  updatedAt: string;
}
