package com.warehouse.server.services;

public interface PurchaseOrderService {
    byte[] generatePurchaseOrderPDF(Long id);
}
