package com.warehouse.server.repositories;

import com.warehouse.server.entities.Product;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

@RepositoryRestResource(collectionResourceRel = "products", path = "products")
public interface ProductRepository extends JpaRepository<Product, Long> {
    @RestResource(path = "byName", rel = "byName")
    Page<Product> findProductsByNameContainingIgnoreCase(@NotNull String name, Pageable pageable);

    Boolean existsByItemCode(@NotNull String itemCode);
}
