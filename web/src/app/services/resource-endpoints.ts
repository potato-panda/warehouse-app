import {environment} from '../../environments/environment';

const {baseApiUrl} = environment;

export const resourceEndpoints = {
  addresses: (id?: string | number) => `${baseApiUrl}/addresses${id ? '/' + id.toString().trim() : ''}`,
  customers: (id?: string | number) => `${baseApiUrl}/customers${id ? '/' + id.toString().trim() : ''}`,
  purchaseOrders: (id?: string | number) => `${baseApiUrl}/purchaseOrders${id ? '/' + id.toString().trim() : ''}`,
  products: (id?: string | number) => `${baseApiUrl}/products${id ? '/' + id.toString().trim() : ''}`,
  quotation: (id?: string | number) => `${baseApiUrl}/quotation${id ? '/' + id.toString().trim() : ''}`,
  quoteItems: (id?: string | number) => `${baseApiUrl}/quoteItems${id ? '/' + id.toString().trim() : ''}`,
  deliveryReceipts: (id?: string | number) => `${baseApiUrl}/deliveryReceipts${id ? '/' + id.toString().trim() : ''}`,
  suppliers: (id?: string | number) => `${baseApiUrl}/suppliers${id ? '/' + id.toString().trim() : ''}`
};
