package com.warehouse.server.repositories;

import com.warehouse.server.entities.User;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;

@RepositoryRestResource(collectionResourceRel = "users", path = "users")
@PreAuthorize("hasRole('ADMIN')")
public interface UserRepository extends JpaRepository<User, String> {
    User getUsersByUsername(@NotNull String username);
}
