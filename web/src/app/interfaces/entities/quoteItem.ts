import {Product} from './product';
import {ResourceRelations} from '../resource';

export interface QuoteItem {
  id: string | number;
  quantity: number;
  price: number;
  discountAmount: number;
  totalAmount: number;
}

export interface QuoteItemProduct extends QuoteItem {
  product: Product;
}

export type QuotationRelations = ResourceRelations<['quotation', 'purchaseOrder', 'quotedProduct']>;
