package com.warehouse.server.repositories;

import com.warehouse.server.entities.DeliveryReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(collectionResourceRel = "deliveryReceipts", path = "deliveryReceipts")
public interface DeliveryReceiptRepository extends JpaRepository<DeliveryReceipt, Long> {
    // TODO get receipts with quotation with customer

    // TODO search receipts with quotation with customer
}
