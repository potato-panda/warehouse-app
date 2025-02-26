import {QuoteItem} from './quoteItem';
import {Supplier} from './supplier';
import {DeliveryReceipt} from './delivery-receipt';

export type CreatePurchaseOrder = Partial<Omit<PurchaseOrder, 'id'>>

export type UpdatePurchaseOrder = Partial<CreatePurchaseOrder> & {
  id: string | number
};

export interface PurchaseOrder {
  id: string | number;
  preparedBy: string | null;
  checkedBy: string | null;
  approvedBy: string | null;
  receivedBy: string | null;
  totalAmount: number | null;
}

export interface PurchaseOrderDetail extends PurchaseOrderTable {
  quoteItems: QuoteItem[];
  deliveryReceipt: DeliveryReceipt;
}

export interface PurchaseOrderTable extends PurchaseOrder {
  supplier: Supplier | null;
}
