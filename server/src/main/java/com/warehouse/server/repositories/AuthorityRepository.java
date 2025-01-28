package com.warehouse.server.repositories;

import com.warehouse.server.entities.Authority;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthorityRepository extends
                                CrudRepository<Authority, String> {
}
