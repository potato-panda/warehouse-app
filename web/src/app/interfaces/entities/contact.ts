import {OmitEmbedded, ResourceRelations} from '../resource';
import {ContactsResourceResponse} from '../../services/contacts.service';

export interface Contact {
  id: string | number;
  name: string;
  phone: string;
  email: string;
}

export type ContactRelations = ResourceRelations<['company']> & {
  _embedded?: {
    company: OmitEmbedded<ContactsResourceResponse>;
  };
};
