package com.warehouse.server.repositories;

import com.warehouse.server.entities.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(collectionResourceRel = "inventories", path = "inventories")
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    @EntityGraph(attributePaths = {"product"})
    @Query("SELECT i FROM Inventory i WHERE LOWER(i.product.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Inventory> findByProductName(@Param("name") String name, Pageable pageable);
}
