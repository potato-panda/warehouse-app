import {Company} from './company';
import {ResourceRelations} from '../resource';
import {Receipt} from './receipt';

export interface Quotation {
  id: string | number | null | undefined;
  paymentTerms: string | null | undefined;
  shippingAddress: string | null | undefined;
  quotationDate: string | null | undefined;
  totalAmount: number | null | undefined;
}

export interface QuotationWithCompany extends Quotation {
  company: Company;
}

export interface QuotationTable extends QuotationWithCompany {
  receipt: Receipt;
}

export type QuotationRelations = ResourceRelations<['company', 'receipt', 'quoteItems']>;
