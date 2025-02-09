package com.warehouse.server.repositories;

import com.warehouse.server.entities.QuoteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(collectionResourceRel = "quoteItems", path = "quoteItems")
public interface QuoteItemRepository extends JpaRepository<QuoteItem, Long> {
}
