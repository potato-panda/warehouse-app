package com.warehouse.server.controllers;

import org.springframework.http.ResponseEntity;

public interface PurchaseOrderController {
    ResponseEntity<byte[]> generatePurchaseOrderPdf(Long id);
}
