import {Company} from './company';
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

export interface QuotationWithCompany extends Quotation {
  company: Company;
}

export interface QuotationTable extends QuotationWithCompany {
  receipt: Receipt;
}

export type QuotationRelations = ResourceRelations<['company', 'receipt', 'quoteItems']>;
