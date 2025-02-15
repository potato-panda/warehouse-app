import {ResourceRelations} from '../resource';
import {QuotationWithCompany} from './quotation';

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
  quotation: QuotationWithCompany;
}

export type ReceiptRelations = ResourceRelations<['quotation']>;
