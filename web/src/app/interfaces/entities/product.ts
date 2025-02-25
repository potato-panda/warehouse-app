import {ResourceRelations} from '../resource';

export interface Product {
  id: number,
  sku: string,
  itemCode: string,
  name: string,
  description: string,
  um: string
}

export type ProductRelations = ResourceRelations<['inventory', 'quoteItem']>;
//   & {
//   _embedded?: {
//     product: OmitEmbedded<ProductsResourceResponse>;
//   };
// };
