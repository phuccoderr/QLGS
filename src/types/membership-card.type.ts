export interface CreateMemberShipCardRequestType {
  id_khachhang: string;
  so_the: string;
  ngay_cap: Date;
  ngay_het_han: Date;
  diem_tich_luy: number;
  trangthai: boolean;
}

export interface UpdateMemberShipCardRequestType {
  id_khachhang?: string;
  so_the?: string;
  ngay_cap?: Date;
  ngay_het_han?: Date;
  diem_tich_luy?: number;
  trangthai?: boolean;
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
