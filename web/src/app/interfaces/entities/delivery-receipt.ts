import {ResourceRelations} from '../resource';
import {PurchaseOrderDetail} from './purchase-order';

export interface DeliveryReceiptCreateRequest {
  receivedDate: string;
  receivedBy: string;
}

export interface DeliveryReceipt {
  id: string | number;
  receivedDate: string;
  receivedBy: string;
}

export interface DeliveryReceiptTable extends DeliveryReceipt {
  purchaseOrder: PurchaseOrderDetail;
}

export type DeliveryReceiptRelations = ResourceRelations<['quotation']>;
