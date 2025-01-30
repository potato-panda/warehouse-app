package com.warehouse.server.repositories;

import com.warehouse.server.entities.Authority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;

@RepositoryRestResource(collectionResourceRel = "authorities", path = "authorities")
@PreAuthorize("hasRole('ADMIN')")
public interface AuthorityRepository extends JpaRepository<Authority, Long> {}
