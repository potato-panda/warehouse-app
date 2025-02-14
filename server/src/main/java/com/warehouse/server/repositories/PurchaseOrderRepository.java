package com.warehouse.server.repositories;

import com.warehouse.server.entities.PurchaseOrder;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

@RepositoryRestResource(collectionResourceRel = "purchaseOrders", path = "purchaseOrders")
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    @RestResource(path = "bySupplier", rel = "bySupplier")
    Page<PurchaseOrder> findPurchaseOrdersBySupplier_NameContainingIgnoreCase(@NotNull String supplierName,
                                                                              Pageable pageable);

    @RestResource(path = "byApprover", rel = "byApprover")
    Page<PurchaseOrder> findPurchaseOrdersByApprovedByContainingIgnoreCase(String approvedBy, Pageable pageable);
}
