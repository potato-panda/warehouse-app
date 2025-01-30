export type Page = {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
};

interface ResourceBase<ResourceName extends string, Relations = {}> {
  _links: {
    self: { href: string };
  } & Record<ResourceName, { href: string; templated?: boolean }> & {
    [K in keyof Relations]: { href: string };
  };
}

export type Resource<Type, ResourceName extends string, Relations = {}> = Type &
  ResourceBase<ResourceName, Relations>;

export type ResourceCollection<
  ResourceType,
  CollectionName extends string,
  ResourceName extends string,
  Relations = {}
> = {
  _embedded: Record<ResourceName, Resource<ResourceType, CollectionName, Relations>[]>;
  _links: {
    self: { href: string };
    profile: { href: string };
  };
  page: Page;
};

type Relationships<RelationMap extends Record<string, any>> = {
  [K in keyof RelationMap]: ResourceCollection<RelationMap[K], string, string>;
};

export type ResourceWithRelations<
  Type,
  ResourceName extends string,
  RelationMap extends Record<string, any> = {}
> = Resource<Type, ResourceName, RelationMap>;

export type ResourceRelations<T extends string[]> = {
  [K in T[number]]: { href: string };
}
