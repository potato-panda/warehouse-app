import {OmitEmbedded, ResourceRelations} from '../resource';
import {ContactsResourceResponse} from '../../services/contacts.service';
import {Supplier} from './supplier';
import {Customer} from './customer';

export interface Contact {
  id: string | number;
  name: string;
  phone: string;
  email: string | null;
}

export interface ContactDetail extends Contact {
  customer: Customer;
  supplier: Supplier;
}

export type ContactCreateRequest = Omit<Contact, 'id'>;

export type ContactUpdateRequest = Contact;

export type ContactRelations = ResourceRelations<['customer']> & {
  _embedded?: {
    customer: OmitEmbedded<ContactsResourceResponse>;
  };
};
