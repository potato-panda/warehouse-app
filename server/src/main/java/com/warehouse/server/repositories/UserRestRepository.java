package com.warehouse.server.repositories;

import com.warehouse.server.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;

@RepositoryRestResource(collectionResourceRel = "users", path = "users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public interface UserRestRepository extends JpaRepository<User, String> {}
