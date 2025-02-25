package com.warehouse.server.repositories;

import com.warehouse.server.entities.Supplier;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

@RepositoryRestResource(collectionResourceRel = "suppliers", path = "suppliers")
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    @RestResource(path = "byName", rel = "byName")
    Page<Supplier> findSuppliersByNameContainingIgnoreCase(@NotNull String name, Pageable pageable);
}
