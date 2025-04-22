interface CreateDeliveryRequestType {
  id_laundry_order?: string;
  id_delivery_staff?: string;
  id_store?: string;
  delivery_address?: string;
  phone_number?: string;
  email?: string;
  status?: "Pending" | "In Delivery" | "Delivered";
}

interface UpdateDeliveryRequestType {
  id_laundry_order?: string | undefined;
  id_delivery_staff?: string | undefined;
  id_store?: string | undefined;
  delivery_address?: string | undefined;
  phone_number?: string | undefined;
  email?: string | undefined;
  status?: "Pending" | "In Delivery" | "Delivered" | undefined;
}

interface DeliveryResponse {
  _id: string;
  id_laundry_order: string;
  id_delivery_staff: string;
  id_store: string;
  delivery_address: string;
  phone_number: string;
  email: string;
  status: "Pending" | "In Delivery" | "Delivered";
  createdAt: Date;
  updatedAt: Date;
}

export type {
  CreateDeliveryRequestType,
  UpdateDeliveryRequestType,
  DeliveryResponse,
};
