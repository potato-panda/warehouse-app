import {ResourceRelations} from '../resource';
import {QuotationTable} from './quotation';
import {Site} from './site';

export interface DeliveryReceiptCreateRequest {
  po: string;
  receivedDate: string;
  receivedBy: string;
  paymentDueDate: string;
  chequeNumber: string;
}

export interface DeliveryReceipt {
  id: string | number;
  po: string;
  site: Site;
  receivedDate: string;
  receivedBy: string;
  paymentDueDate: string;
  chequeNumber: string;
}

export interface DeliveryReceiptTable extends DeliveryReceipt {
  quotation: QuotationTable;
}

export type DeliveryReceiptRelations = ResourceRelations<['quotation']>;
