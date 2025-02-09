import {Company} from './company';
import {ResourceRelations} from '../resource';
import {Receipt} from './receipt';

export interface Quotation {
  id: string | number;
  paymentTerms: string;
  shippingAddress: string;
  quotationDate: string;
  totalAmount: number;
}

export interface QuotationTable extends Quotation {
  company: Company;
  receipt: Receipt;
}

export type QuotationRelations = ResourceRelations<['company', 'receipt']>;
