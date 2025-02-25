import {ResourceRelations} from '../resource';
import {QuotationWithCustomer} from './quotation';

export interface CreateReceipt {
  receivedDate: string;
  receivedBy: string;
}

export interface Receipt {
  id: string | number;
  receivedDate: string;
  receivedBy: string;
}

export interface ReceiptTable extends Receipt {
  quotation: QuotationWithCustomer;
}

export type ReceiptRelations = ResourceRelations<['quotation']>;
