package com.warehouse.server.repositories;

import com.warehouse.server.entities.User;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;

@RepositoryRestResource(collectionResourceRel = "users", path = "users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public interface UserRestRepository extends
                                    PagingAndSortingRepository<User, String> {
}
