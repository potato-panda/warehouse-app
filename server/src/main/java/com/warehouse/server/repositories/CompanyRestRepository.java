package com.warehouse.server.repositories;

import com.warehouse.server.entities.Company;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(collectionResourceRel = "companies", path = "companies")
public interface CompanyRestRepository extends
                                       PagingAndSortingRepository<Company, Long> {
}
