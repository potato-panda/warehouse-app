package com.warehouse.server.services;

public interface DeliveryReceiptService {
    byte[] generateDeliveryReceiptPDF(Long id);
}
