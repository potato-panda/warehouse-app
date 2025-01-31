package com.warehouse.server.repositories;

import com.warehouse.server.entities.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(collectionResourceRel = "quotations", path = "quotations")
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
}
