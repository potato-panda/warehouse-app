package com.warehouse.server.repositories;

import com.warehouse.server.entities.Customer;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

@RepositoryRestResource(collectionResourceRel = "customers", path = "customers")
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    @RestResource(path = "byName", rel = "byName")
    Page<Customer> findCustomersByNameContainingIgnoreCase(@NotNull String name, Pageable pageable);
}
