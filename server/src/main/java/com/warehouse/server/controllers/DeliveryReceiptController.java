package com.warehouse.server.controllers;

import org.springframework.http.ResponseEntity;

public interface DeliveryReceiptController {
    ResponseEntity<byte[]> generateDeliveryReceiptPdf(Long id);
}
