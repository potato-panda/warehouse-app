import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'customers/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'suppliers/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'contacts/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'products/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'inventories/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'quotations/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'purchaseOrders/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'sites/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
