import {ResourceRelations} from '../resource';
import {Contact} from './contact';

export interface Company extends CompanyWithContacts {
  quotation: [],
  purchaseOrders: [],
}

export interface CompanySummary {
  id: string | number;
  name: string;
  address: string;
  billingAddress: string;
  website: string;
  tin: string;
}

export interface CompanyWithContacts extends CompanySummary {
  contacts: Contact[];
}

export type CompanyRelations = ResourceRelations<['contacts']>
