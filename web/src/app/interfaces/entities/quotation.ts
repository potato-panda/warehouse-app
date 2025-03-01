import {Customer} from './customer';
import {ResourceRelations} from '../resource';
import {DeliveryReceipt} from './delivery-receipt';

export type CreateQuotation = Partial<Omit<Quotation, 'id' | 'quotationDate' | 'discountSubtotal' | 'deliverySubtotal' | 'subtotal' | 'totalAmount'>>

export type UpdateQuotation = Partial<Quotation> & {
  id: string | number;
}

export interface Quotation {
  id: string | number;
  paymentTerms: string | null;
  shippingAddress: string | null;
  sameAsBilling: boolean;
  quotationDate: string | null;
  vatInclusive: boolean;
  deliveryCharge: number;
  deliverySubtotal: number;
  discountSubtotal: number;
  subtotal: number;
  totalAmount: number;
}

export interface QuotationWithCustomer extends Quotation {
  customer: Customer;
}

export interface QuotationTable {
  id: string | number;
  customer: Customer;
  paymentTerms: string | null;
  shippingAddress: string | null;
  quotationDate: string | null;
  totalAmount: number;
}

export interface QuotationDetail extends QuotationTable {
  deliveryReceipt: DeliveryReceipt;
}

export type QuotationRelations = ResourceRelations<['customer', 'quoteItems']>;
