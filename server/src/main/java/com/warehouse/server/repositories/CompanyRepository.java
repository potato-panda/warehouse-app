package com.warehouse.server.repositories;

import com.warehouse.server.entities.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(collectionResourceRel = "companies", path = "companies", excerptProjection =
        Company.Summary.class)
public interface CompanyRepository extends JpaRepository<Company, Long> {}
