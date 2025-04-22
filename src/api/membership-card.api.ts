import http from "./http.api";
import type {
  CreateMemberShipCardRequestType,
  UpdateMemberShipCardRequestType,
  MemberShipCardResponse,
} from "@/types/membership-card.type";

/**
 * Get all membership cards
 * @returns List of membership cards
 */
export const getAllMembershipCards = async (): Promise<
  MemberShipCardResponse[]
> => {
  const response = await http.get<MemberShipCardResponse[]>(
    "/membership_cards/all"
  );
  return response.data;
};

/**
 * Get membership card by ID
 * @param id Membership card ID to fetch
 * @returns Membership card data
 */
export const getMembershipCardById = async (
  id: string
): Promise<MemberShipCardResponse> => {
  const response = await http.get<MemberShipCardResponse>(
    `/membership_cards/${id}`
  );
  return response.data;
};

/**
 * Get membership card by customer ID
 * @param customerId Customer ID to fetch membership card for
 * @returns Membership card data
 */
export const getMembershipCardByCustomerId = async (
  customerId: string
): Promise<MemberShipCardResponse> => {
  const response = await http.get<MemberShipCardResponse>(
    `/membership_cards/customer/${customerId}`
  );
  return response.data;
};

/**
 * Creates a new membership card
 * @param data Membership card data to create
 * @returns Newly created membership card data
 */
export const createMembershipCard = async (
  data: CreateMemberShipCardRequestType
): Promise<MemberShipCardResponse> => {
  const response = await http.post<MemberShipCardResponse>(
    "/membership_cards",
    data
  );
  return response.data;
};

/**
 * Updates an existing membership card
 * @param id Membership card ID to update
 * @param data Membership card data to update
 * @returns Updated membership card data
 */
export const updateMembershipCard = async (
  id: string,
  data: UpdateMemberShipCardRequestType
): Promise<MemberShipCardResponse> => {
  const response = await http.patch<MemberShipCardResponse>(
    `/membership_cards/${id}`,
    data
  );
  return response.data;
};

/**
 * Updates membership card points
 * @param id Membership card ID
 * @param points Points to add (positive) or subtract (negative)
 * @returns Updated membership card data
 */
export const updateMembershipCardPoints = async (
  id: string,
  points: number
): Promise<MemberShipCardResponse> => {
  const response = await http.patch<MemberShipCardResponse>(
    `/membership_cards/${id}/points`,
    { points }
  );
  return response.data;
};

/**
 * Deletes a membership card
 * @param id Membership card ID to delete
 * @returns Success status
 */
export const deleteMembershipCard = async (id: string): Promise<void> => {
  await http.delete(`/membership_cards/${id}`);
};
