import {QuoteItem} from './quoteItem';
import {Company} from './company';

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

export interface PurchaseOrderDetail extends PurchaseOrder {
  supplier: Company | null;
  quoteItems: QuoteItem[];
}

export type PurchaseOrderTable = Omit<PurchaseOrderDetail, 'quoteItems'>;
