export interface CreateMemberShipCardRequestType {
  id_customer: string;
  card_number: string;
  issue_date: Date;
  expiry_date: Date;
  points: number;
  status: boolean;
}

export interface UpdateMemberShipCardRequestType {
  id_customer?: string;
  card_number?: string;
  issue_date?: Date;
  expiry_date?: Date;
  points?: number;
  status?: boolean;
}

export interface MemberShipCardResponse {
  _id: string;
  id_customer: string;
  card_number: string;
  issue_date: string;
  expiry_date: string;
  points: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}
