import {Product} from './product';
import {ResourceRelations} from '../resource';

export interface QuoteItem {
  id: string | number | null | undefined;
  quantity: number | null;
  price: number | null;
  discountAmount: number | null;
  totalAmount: number | null;
}

export interface QuoteItemProduct extends QuoteItem {
  quotedProduct: Product;
}

export type QuoteItemRelations = ResourceRelations<['quotation', 'purchaseOrder', 'quotedProduct']>;
