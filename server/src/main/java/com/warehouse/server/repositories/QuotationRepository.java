package com.warehouse.server.repositories;

import com.warehouse.server.entities.Quotation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

@RepositoryRestResource(collectionResourceRel = "quotations", path = "quotations")
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    @RestResource(path = "byCompany", rel = "byCompany")
    Page<Quotation> getQuotationsByCompany_NameContainingIgnoreCase(@Param("name") String name, Pageable pageable);
}
