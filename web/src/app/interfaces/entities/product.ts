import {ResourceRelations} from '../resource';

export interface Product {
  id: number,
  sku: string,
  itemCode: string,
  name: string,
  description: string,
  price: number,
  um: string,
  umAmount: number,
}

export type ProductRelations = ResourceRelations<['inventory', 'quoteItem']>;
//   & {
//   _embedded?: {
//     product: OmitEmbedded<ProductsResourceResponse>;
//   };
// };
