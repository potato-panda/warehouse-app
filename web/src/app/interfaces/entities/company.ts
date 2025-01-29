import {Resource, ResourceCollection} from '../resource';

export interface Company {
  id: string | number;
  name: string;
  address: string;
  billingAddress: string;
  contact: any[];
  website: string;
  tin: string;
  quotation: [],
  purchaseOrders: [],
}
