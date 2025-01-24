package com.warehouse.server.repositories;

import com.warehouse.server.entities.Company;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepository extends
                                   CrudRepository<Company, Long> {
}
