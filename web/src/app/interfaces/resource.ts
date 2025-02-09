export type Page = {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
};

type Links = { href: string; templated?: boolean };

type ResourceBase<ResourceName extends string, Relations = {}> = {
  _links: {
    self: Links;
  } & Record<ResourceName, Links> & {
    [K in keyof Relations]: Links;
  };
} & ('_embedded' extends keyof Relations ? { '_embedded': Relations['_embedded'] } : {});

export type Resource<Type, ResourceName extends string, Relations = {}> = Type &
  ResourceBase<ResourceName, Relations>;

export type CollectionResource<
  ResourceType,
  ResourceName extends string,
  CollectionName extends string,
  Relations = {}
> = {
  _embedded: Record<CollectionName, Resource<ResourceType, ResourceName, Relations>[]>;
  _links: {
    self: Links;
    profile: Links;
    search: Links;
  };
  page: Page;
};

type Relationships<RelationMap extends Record<string, any>> = {
  [K in keyof RelationMap]: CollectionResource<RelationMap[K], string, string>;
};

export type ResourceWithRelations<
  Type,
  ResourceName extends string,
  RelationMap extends Record<string, any> = {}
> = Resource<Type, ResourceName, RelationMap>;

export type ResourceRelations<T extends string[]> = {
  [K in T[number]]: Links;
}
export type OmitEmbedded<T> = {
  [K in keyof T as K extends '_embedded' ? never : K]: T[K] extends object ? OmitEmbedded<T[K]> : T[K];
}
