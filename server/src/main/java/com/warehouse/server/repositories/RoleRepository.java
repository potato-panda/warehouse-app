package com.warehouse.server.repositories;

import com.warehouse.server.entities.Role;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends
                                CrudRepository<Role, String> {
}
