import {ResourceRelations} from '../resource';

export interface Contact {
  id: string | number;
  name: string;
  phone: string;
  email: string;
}

export type ContactRelations = ResourceRelations<['company']>;
