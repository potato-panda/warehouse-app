package com.warehouse.server.repositories;

import com.warehouse.server.entities.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends
                                CrudRepository<com.warehouse.server.entities.User, String> {
    User getUserByUsername(String username);
}
