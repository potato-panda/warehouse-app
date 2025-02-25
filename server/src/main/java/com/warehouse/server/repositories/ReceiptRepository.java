package com.warehouse.server.repositories;

import com.warehouse.server.entities.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(collectionResourceRel = "receipts", path = "receipts")
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    // TODO get receipts with quotation with customer

    // TODO search receipts with quotation with customer
}
