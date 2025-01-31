package com.warehouse.server.repositories;

import com.warehouse.server.entities.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(collectionResourceRel = "inventories", path = "inventories")
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
}
