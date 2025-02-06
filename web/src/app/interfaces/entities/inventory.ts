import {ResourceRelations} from '../resource';
import {Product} from './product';

export interface Inventory {
  id: string | number,
  address: string,
  quantity: number
}

export interface InventoryProduct extends Inventory {
  product: Product;
}

export type InventoryRelations = ResourceRelations<['product']>;
