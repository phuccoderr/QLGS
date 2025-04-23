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
  id_khachhang: string;
  so_the: string;
  ngay_cap: string;
  ngay_het_han: string;
  diem_tich_luy: number;
  trangthai: boolean;
  createdAt: string;
  updatedAt: string;
}
