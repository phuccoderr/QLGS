export interface CreatePromotionRequestType {
  name: string;
  description: string;
  type: "Percentage" | "Cash";
  value: number;
  startDate: string;
  endDate: string;
  status: boolean;
}

export interface UpdatePromotionRequestType {
  name?: string;
  description?: string;
  type?: "Percentage" | "Cash";
  value?: number;
  startDate?: string;
  endDate?: string;
  status?: boolean;
}

export interface PromotionResponse {
  _id: string;
  name: string;
  description: string;
  type: "Percentage" | "Cash";
  value: number;
  startDate: string;
  endDate: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}
