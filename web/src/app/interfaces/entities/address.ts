export interface Address extends AddressCreateRequest {
  id: string | number;
}

export interface AddressCreateRequest {
  fullAddress: string;
}

export type AddressUpdateRequest = Address;
