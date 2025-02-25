import {Customer} from './customer';
import {ResourceRelations} from '../resource';
import {Receipt} from './receipt';

export type CreateQuotation = Partial<Omit<Quotation, 'id'>>

export type UpdateQuotation = Partial<Quotation> & {
  id: string | number;
}

export interface Quotation {
  id: string | number;
  paymentTerms: string | null;
  shippingAddress: string | null;
  quotationDate: string | null;
  totalAmount: number | null;
}

export interface QuotationWithCustomer extends Quotation {
  customer: Customer;
}

export interface QuotationTable extends QuotationWithCustomer {
  receipt: Receipt;
}

export type QuotationRelations = ResourceRelations<['customer', 'receipt', 'quoteItems']>;
