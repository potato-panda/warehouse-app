import {ResourceRelations} from '../resource';
import {Contact} from './contact';
import {Quotation} from './quotation';

export interface Company {
  id: string | number;
  name: string;
  address: string;
  billingAddress: string;
  website: string;
  tin: string;
}

export interface CompanyWithContacts extends Company {
  contacts: Contact[];
}

export interface CompanyFull extends CompanyWithContacts {
  quotations: Quotation[],
  purchaseOrders: [],
}

export type CompanyRelations = ResourceRelations<['contacts', 'purchaseOrders', 'quotations']>
