import {environment} from '../../environments/environment';

const {baseApiUrl} = environment;

export const resourceEndpoints = {
  company: (id?: string | number) => `${baseApiUrl}/companies${id ? '/' + id.toString().trim() : ''}`,
  purchaseOrders: (id?: string | number) => `${baseApiUrl}/purchaseOrders${id ? '/' + id.toString().trim() : ''}`,
  products: (id?: string | number) => `${baseApiUrl}/products${id ? '/' + id.toString().trim() : ''}`,
  quoteItems: (id?: string | number) => `${baseApiUrl}/quoteItems${id ? '/' + id.toString().trim() : ''}`
};
