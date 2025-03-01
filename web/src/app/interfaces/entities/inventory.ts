import {ResourceRelations} from '../resource';
import {Product} from './product';
import {Site, SiteDetail} from './site';

export interface Inventory {
  id: string | number;
  quantity: number;
}

export interface InventoryDetail extends Inventory {
  site: SiteDetail;
  product: Product;
}

export type InventoryRelations = ResourceRelations<['product']>;
