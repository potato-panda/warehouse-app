package com.warehouse.server.repositories;

import com.warehouse.server.entities.Authority;
import org.hibernate.validator.constraints.Length;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.Optional;

@RepositoryRestResource(collectionResourceRel = "authorities", path = "authorities")
@PreAuthorize("hasRole('ADMIN')")
public interface AuthorityRepository extends JpaRepository<Authority, Long> {
    boolean existsByAuthority(@Length(min = 3, max = 60, message = "Role name must be between 3 and 60 characters long.") String authority);

    Optional<Authority> findByAuthority(@Length(min = 3, max = 60, message = "Role name must be between 3 and 60 characters long.") String authority);
}
