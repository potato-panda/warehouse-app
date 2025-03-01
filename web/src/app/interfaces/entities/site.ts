import {Address} from './address';

export interface Site {
  id: string | number;
  name: string;
}

export interface SiteDetail extends Site {
  address: Address;
}

export type SiteCreateRequest = Omit<Site, 'id'>;
