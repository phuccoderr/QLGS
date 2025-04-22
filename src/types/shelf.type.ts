export interface CreateShelfRequestType {
  location: string;
  stage?: string;
  note?: string;
  id_laundry_order: string;
}

export interface UpdateShelfRequestType {
  location: string;
  stage?: string;
  note?: string;
  id_laundry_order: string;
}
