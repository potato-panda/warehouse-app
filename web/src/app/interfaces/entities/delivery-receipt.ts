import {ResourceRelations} from '../resource';
import {QuotationTable} from './quotation';

export interface DeliveryReceiptCreateRequest {
  receivedDate: string;
  receivedBy: string;
  paymentDueDate: string;
  chequeNumber: string;
}

export interface DeliveryReceipt {
  id: string | number;
  receivedDate: string;
  receivedBy: string;
  paymentDueDate: string;
  chequeNumber: string;
}

export interface DeliveryReceiptTable extends DeliveryReceipt {
  quotation: QuotationTable;
}

export type DeliveryReceiptRelations = ResourceRelations<['quotation']>;
