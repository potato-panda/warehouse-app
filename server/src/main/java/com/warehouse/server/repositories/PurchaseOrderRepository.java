package com.warehouse.server.repositories;

import com.warehouse.server.entities.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(collectionResourceRel = "purchase_orders", path = "purchase_orders")
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
}
