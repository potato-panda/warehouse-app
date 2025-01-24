package com.warehouse.server.repositories;

import com.warehouse.server.entities.Role;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;

@RepositoryRestResource(collectionResourceRel = "authorities", path = "authorities")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public interface RoleRestRepository extends
                                    PagingAndSortingRepository<Role, Long> {
}
