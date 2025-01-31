package com.warehouse.server.repositories;

import com.warehouse.server.entities.Company;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

@RepositoryRestResource(collectionResourceRel = "companies", path = "companies", excerptProjection =
        Company.Summary.class)
public interface CompanyRepository extends JpaRepository<Company, Long> {
    @RestResource(path = "byName", rel = "byName")
    Page<Company> findCompaniesByNameContainingIgnoreCase(@NotNull String name, Pageable pageable);
}
