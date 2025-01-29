export type Resource<Type, ResourceName extends string> = Type & ResourceBase<ResourceName>;

interface ResourceBase<ResourceName extends string> {
  _links: {
    'self': {
      href: string;
    };
  } & Record<ResourceName, {
    href: string;
  }>;
}

export type ResourceCollection<ResourceType, CollectionName extends string, ResourceName extends string> = {
  _embedded: Record<ResourceName, Resource<ResourceType, CollectionName>[]>;
  _links: {
    self: {
      href: string;
    };
    profile: {
      href: string;
    };
  };
  page: Page;
}

export type Page = {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
};
