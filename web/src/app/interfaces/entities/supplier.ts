import {Contact} from './contact';
import {ResourceRelations} from '../resource';
import {Address} from './address';

export interface Supplier {
  id: string | number;
  name: string;
}

export type SupplierCreateRequest = Omit<Supplier, 'id'>;

export type SupplierUpdateRequest = Supplier;

export interface SupplierWithContacts extends Supplier {
  contacts: Contact[];
}

export interface SupplierDetail extends SupplierWithContacts {
  addresses: Address[];
}


export type SupplierRelations = ResourceRelations<['contacts', 'purchaseOrders']>
