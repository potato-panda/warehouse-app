import {ResourceRelations} from '../resource';
import {Contact} from './contact';
import {Quotation} from './quotation';
import {Address} from './address';

export interface Customer {
  id: string | number;
  name: string;
  billingAddress: string;
  website: string;
  tin: string;
}

export type CustomerCreateOneRequest = Omit<Customer, 'id'>;

export type CustomerUpdateOneRequest = Customer;

export type CustomerCreateRequest = Omit<Customer, 'id'> & {
  shippingAddresses: Address[];
  contacts: Omit<Contact, 'id'>[];
};

export type CustomerUpdateRequest = Customer & {
  shippingAddresses: Address[];
  contacts: Contact[];
};

export interface CustomerWithContacts extends Customer {
  contacts: Contact[];
}

export interface CustomerFull extends CustomerWithContacts {
  quotations: Quotation[];
}

export type CustomerRelations = ResourceRelations<['contacts', 'quotations']>
